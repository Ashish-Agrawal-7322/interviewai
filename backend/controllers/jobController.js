import asyncHandler from 'express-async-handler';
import Groq from 'groq-sdk';
import https from 'https';
import JobClick from '../models/JobClick.js';
import ApiUsage from '../models/ApiUsage.js';

// Simple in-memory cache to save JSearch credits
const jobCache = new Map();

// Helper function to make JSearch HTTPS requests
const fetchJSearchJobs = (query) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'jsearch.p.rapidapi.com',
      path: `/search?query=${encodeURIComponent(query)}&num_pages=1`,
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.JSEARCH_API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`JSearch API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
};

// @desc    Generate job recommendations by filtering live JSearch API jobs through AI
// @route   POST /api/jobs/recommend
// @access  Private
const getJobRecommendations = asyncHandler(async (req, res) => {
  const { targetRole, skills, experienceLevel } = req.body;

  if (!targetRole) {
    res.status(400);
    throw new Error('Please provide a target role');
  }

  try {
    // Determine the search query
    const experience = experienceLevel ? experienceLevel.toLowerCase() : '';
    const searchQuery = `${experience} ${targetRole}`.trim();
    const cacheKey = searchQuery.toLowerCase();

    let rawJobs = [];

    // Check cache first
    if (jobCache.has(cacheKey)) {
      console.log(`[CACHE HIT] Serving JSearch jobs for: "${cacheKey}"`);
      rawJobs = jobCache.get(cacheKey);
    } else {
      console.log(`[CACHE MISS] Fetching from JSearch for: "${cacheKey}"`);
      if (!process.env.JSEARCH_API_KEY) {
        throw new Error('JSEARCH_API_KEY is missing in environment variables.');
      }
      
      const data = await fetchJSearchJobs(searchQuery);
      rawJobs = data.data || [];

      // Track JSearch API Usage
      const monthStr = new Date().toISOString().slice(0, 7);
      await ApiUsage.findOneAndUpdate(
        { provider: 'JSearch', date: monthStr },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      );

      if (rawJobs.length > 0) {
        // Cache the successful results for 1 hour to save API credits
        jobCache.set(cacheKey, rawJobs);
        setTimeout(() => jobCache.delete(cacheKey), 60 * 60 * 1000); 
      }
    }

    if (rawJobs.length === 0) {
      res.status(404);
      throw new Error('No live jobs found for this specific role right now.');
    }

    // Format a subset of the raw jobs to send to Llama-3 to prevent token overflow
    const formattedJobsForAI = rawJobs.slice(0, 15).map(job => ({
      id: job.job_id,
      url: job.job_apply_link,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : job.job_country || 'Remote',
      salary: job.job_salary_string || 'Competitive',
      is_remote: job.job_is_remote,
      description_snippet: job.job_description ? job.job_description.substring(0, 300) + '...' : ''
    }));

    // Construct prompt instructing Llama-3 to strictly analyze these specific real jobs
    const prompt = `
      You are an expert AI Career Matchmaker and Technical Recruiter.
      I have fetched a list of REAL, active job postings from a live job board.
      
      I need you to act as an intelligent filter:
      1. Analyze the candidate's profile.
      2. Analyze the provided list of REAL jobs.
      3. Select exactly the top 6 jobs from the list that best match the candidate's specific profile.
      4. For each selected job, calculate a Match Score, explain why they are a match, and extract the top 3 core requirements.

      Candidate Profile:
      - Target Role: ${targetRole}
      - Experience Level: ${experienceLevel || 'Mid-Level'}
      - Core Skills: ${skills ? skills.join(', ') : 'General Software Engineering'}
      
      STRICT INSTRUCTION: You MUST heavily weigh your selection and the Match Score based on how well the candidate's Core Skills and Experience Level match the job's title, snippet, and implied seniority.

      REAL JOB POSTINGS (JSON Array):
      ${JSON.stringify(formattedJobsForAI)}

      For each of the 6 jobs you select, provide:
      1. "id": The exact id of the job from the list.
      2. "company": The exact company from the list.
      3. "title": The exact title from the list.
      4. "location": The exact location from the list.
      5. "url": The exact url from the list.
      6. "matchScore": A percentage integer between 70 and 99 based specifically on the candidate's skills and experience match.
      7. "salary": The exact salary string from the list.
      8. "reasoning": A 1-2 sentence compelling reason WHY this specific job is a perfect match for the candidate based strictly on the provided Candidate Profile.
      9. "requirements": A short array of exactly 3 strings listing the key tech stack/skills required based on the job's description snippet or title.

      Return ONLY a strict JSON array of objects matching the above keys. Do not include markdown codeblocks (like \`\`\`json) or any conversational text.
    `;

    // Send to Groq / Llama-3
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
    });
    
    const responseText = chatCompletion.choices[0]?.message?.content || '';
    
    // Clean up response text
    let cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const startIndex = cleanedText.indexOf('[');
    const endIndex = cleanedText.lastIndexOf(']');
    
    if (startIndex !== -1 && endIndex !== -1) {
      cleanedText = cleanedText.substring(startIndex, endIndex + 1);
    }
    
    let aiSelectedJobs = [];
    try {
      aiSelectedJobs = JSON.parse(cleanedText);
    } catch (e) {
      console.error('Failed to parse JSON:', cleanedText);
      throw new Error('Failed to parse AI response');
    }

    res.status(200).json(aiSelectedJobs);

  } catch (error) {
    console.error('Job generation error:', error);
    res.status(500);
    throw new Error(error.message || 'Failed to fetch job recommendations');
  }
});

// @desc    Track a job application click
// @route   POST /api/jobs/click
// @access  Private
const trackJobClick = asyncHandler(async (req, res) => {
  const { jobId, jobTitle, company } = req.body;
  
  if (!jobId) {
    res.status(400);
    throw new Error('Please provide jobId');
  }

  const click = await JobClick.create({
    user: req.user._id,
    jobId,
    jobTitle,
    company
  });

  res.status(201).json(click);
});

export { getJobRecommendations, trackJobClick };
