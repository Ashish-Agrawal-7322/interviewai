import asyncHandler from 'express-async-handler';
import Interview from '../models/Interview.js';
import AdminSettings from '../models/AdminSettings.js';
import Groq from 'groq-sdk';

// @desc    Generate a new interview
// @route   POST /api/interviews/generate
// @access  Private
const generateInterview = asyncHandler(async (req, res) => {
  const { role, experience, interviewType, resumeSkills, language, govDetails, targetCompany, companyDetails } = req.body;

  if (!role || !experience || !interviewType) {
    res.status(400);
    throw new Error('Please provide role, experience level, and interview type');
  }

  let typeConstraint = '';
  if (interviewType === 'Coding') {
    typeConstraint = `STRICT RULE: You MUST ask ONLY algorithmic, data structures, or programming tasks specifically tailored to the tech domain: ${role}. If resume skills are provided, you MUST ask coding questions that specifically test those skills. The candidate will write executable code. DO NOT ask theoretical or behavioral questions.`;
  } else if (interviewType === 'Technical') {
    typeConstraint = 'STRICT RULE: You MUST ask a mix of theoretical questions, logical reasoning questions, and deep technical/conceptual coding questions. DO NOT ask any behavioral or HR questions.';
  } else if (interviewType === 'Behavioral') {
    typeConstraint = 'STRICT RULE: You MUST ask ONLY behavioral, HR, cultural fit, or scenario-based communication questions. DO NOT ask any technical or coding questions.';
  } else if (interviewType === 'Gov Exam') {
    const pType = govDetails?.panelType || 'Board Member';
    const diff = govDetails?.difficulty || 'Medium';
    const fields = govDetails?.dafFields ? Object.keys(govDetails.dafFields).join(', ') : 'application details';
    let tone = 'formal and analytical';
    if (pType === 'Stress Interview') tone = 'aggressive, highly critical, and intentionally stressful';
    if (pType === 'Friendly') tone = 'encouraging and supportive';
    typeConstraint = `STRICT RULE: You are acting as a ${pType}. Your tone MUST be ${tone}. The difficulty level is ${diff}. You MUST ask questions based heavily on the candidate's Detailed Application Form (DAF) provided below. Cross-question them specifically on the intersections of these fields: ${fields}.\nDAF DETAILS: ${JSON.stringify(govDetails?.dafFields || govDetails)}`;
  } else if (interviewType === 'Resume') {
    typeConstraint = 'STRICT RULE: You MUST act as an interviewer and ask the VERY FIRST question of the interview. Base it strongly on the candidate\'s resume skills. Make it open-ended and conversational. Do not ask a list of questions, just ONE question to start the conversation.';
  } else if (interviewType === 'Company') {
    const focus = companyDetails?.focus || 'Mixed';
    const panelTone = companyDetails?.panelTone || 'Standard';
    let tone = 'formal and analytical';
    if (panelTone === 'Bar Raiser') tone = 'aggressive, highly critical, probing deeply into edge cases';
    if (panelTone === 'Friendly') tone = 'encouraging, supportive, and conversational';
    
    const jobReqs = companyDetails?.jobRequirements;
    let jobReqString = '';
    if (jobReqs && jobReqs.length > 0) {
      jobReqString = `The candidate is applying for a specific job that requires the following skills: ${jobReqs.join(', ')}. You MUST heavily bias your question to test these specific required skills in the context of the company. `;
    }

    typeConstraint = `STRICT RULE: You are a ${panelTone} from ${companyDetails?.company || targetCompany}. Your tone MUST be ${tone}. You MUST ask the VERY FIRST question of the interview. The interview focus is EXACTLY: "${focus}". ${jobReqString}You MUST ask a question that perfectly aligns with real ${companyDetails?.company || targetCompany} interview questions for this specific focus area. For example, if it's Amazon, ask about Leadership Principles. If it's Google, focus on Googleyness or hard algorithms. Make it open-ended and conversational.`;
  } else {
    typeConstraint = 'STRICT RULE: You MUST act as an interviewer and ask the VERY FIRST question of the interview. Ask a balanced mix of technical and behavioral questions. Make it open-ended and conversational.';
  }
  
  const isConversational = ['Technical', 'Behavioral', 'Mixed', 'Resume', 'Company'].includes(interviewType);
  const numQuestions = 1;
  let prompt = '';

  // Fetch Global Admin Settings
  const settings = await AdminSettings.findOne() || { aiDifficulty: 'Medium' };
  const diffLevel = settings.aiDifficulty;

  if (resumeSkills && resumeSkills.length > 0) {
    prompt = `
      You are an expert interviewer.
      The language for the interview questions MUST be: ${language || 'English'}.
      The candidate has uploaded their resume.
      Target Role / Domain: ${role}
      Difficulty / Experience Level: ${experience}
      Global Admin Difficulty Override: The AI MUST strictly adhere to the overall difficulty level of '${diffLevel}'. Adjust the complexity of the question accordingly.
      You MUST STRICTLY generate exactly ${numQuestions} interview questions based ONLY on the following extracted skills from their resume:
      ${resumeSkills.join(', ')}

      ${typeConstraint}

      Return the response ONLY as a strict JSON array of strings. No markdown formatting, no comments.
      Example: ["Question 1", "Question 2", "Question 3"]
    `;
  } else {
    prompt = `
      You are an expert interviewer.
      The language for the interview questions MUST be: ${language || 'English'}.
      Target Role / Domain: ${role}
      Difficulty / Experience Level: ${experience}
      Global Admin Difficulty Override: The AI MUST strictly adhere to the overall difficulty level of '${diffLevel}'. Adjust the complexity of the question accordingly.
      
      ${typeConstraint}
      
      Generate exactly ${numQuestions} interview questions.
      Return the response ONLY as a strict JSON array of strings. No markdown formatting, no comments.
      Example: ["Question 1", "Question 2", "Question 3"]
    `;
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
    });
    const responseText = chatCompletion.choices[0]?.message?.content || '';
    
    // Remove markdown code blocks if any
    let cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    // Find the first [ and last ]
    const startIndex = cleanedText.indexOf('[');
    const endIndex = cleanedText.lastIndexOf(']');
    if (startIndex !== -1 && endIndex !== -1) {
      cleanedText = cleanedText.substring(startIndex, endIndex + 1);
    }
    
    let questionsArray = [];
    try {
      questionsArray = JSON.parse(cleanedText);
    } catch (e) {
      throw new Error('Failed to parse JSON: ' + e.message + '\nResponse was: ' + responseText);
    }

    if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
      throw new Error('AI returned invalid format');
    }

    const formattedQuestions = questionsArray.map((q) => ({
      questionText: q,
    }));

    const interview = await Interview.create({
      user: req.user._id,
      role,
      experience,
      interviewType,
      language,
      targetCompany,
      govDetails,
      resumeSkills: resumeSkills || [],
      questions: formattedQuestions,
      totalQuestions: 999,
    });

    res.status(201).json(interview);
  } catch (error) {
    console.error('Error generating interview:', error);
    const mockQuestions = [
      { questionText: "Given a string, return the first non-repeating character. For example, if the string is 'leetcode', return 'l'. If a string has no non-repeating characters, return an empty string." },
      { questionText: "Design an algorithm to find the shortest path between a given node in a graph and all other nodes. The graph is represented as an adjacency list." },
      { questionText: "Write a function to find all duplicates in a sorted array. For example, given the array [1, 1, 2, 3, 3, 4, 4, 5], return [[1, 1], [2, 2], [3, 3], [4, 4]]." }
    ];
    // Fallback if API fails
    const interview = await Interview.create({
      user: req.user._id,
      role,
      experience,
      interviewType,
      language,
      govDetails,
      resumeSkills: resumeSkills || [],
      questions: interviewType === 'Resume' ? [{ questionText: "Could you walk me through your background and the skills listed on your resume?" }] : mockQuestions,
    });

    res.status(201).json(interview);
  }
});

// @desc    Submit an answer to a question
// @route   POST /api/interviews/:id/answer
// @access  Private
const submitAnswer = asyncHandler(async (req, res) => {
  const { questionIndex, answer, endInterview } = req.body;
  const interview = await Interview.findById(req.params.id);
  const settings = await AdminSettings.findOne() || { enableFollowUpQuestions: true, aiDifficulty: 'Medium' };

  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }

  if (interview.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const question = interview.questions[questionIndex];
  
  if (!question) {
    res.status(400);
    throw new Error('Invalid question index');
  }

  let evaluation = { score: 0, feedback: '' };

  if (!answer.trim() || answer === 'SKIPPED_QUESTION') {
    evaluation.score = 0;
    evaluation.feedback = "Question was skipped or not answered in the given time limit.";
  } else {
    let evaluationPrompt = '';
    if (interview.interviewType === 'Gov Exam') {
      evaluationPrompt = `
      You are a strict UPSC / Government Exam Evaluator assessing a candidate's answer.
      Role/Exam: ${interview.role}
      Question: ${question.questionText}
      Candidate's Answer: \n${answer}

      Evaluate strictly based on the UPSC Answer Framework. Calculate the final score out of 10.
      In your feedback, explicitly mention:
      1. Structure (Intro, Body, Conclusion)
      2. Content (Facts, Examples, Neutrality)
      3. Personality (Clarity of thought, balanced opinion)

      Provide your evaluation in strict JSON format:
      {
        "score": <number between 0 and 10>,
        "feedback": "<Detailed string covering Structure, Content, and Personality.>"
      }
      `;
    } else {
      evaluationPrompt = `
      You are an expert interviewer evaluating a candidate's answer.
      Role: ${interview.role} (${interview.experience} level)
      Interview Type: ${interview.interviewType}
      Global Admin Difficulty Override: Evaluate strictly according to the '${settings.aiDifficulty}' difficulty standard.
      Question: ${question.questionText}
      Candidate's Answer / Code Submission: \n${answer}

      Provide your evaluation in strict JSON format:
      {
        "score": <number between 0 and 10 based on accuracy, depth, code efficiency (if applicable), and clarity>,
        "feedback": "<A concise string explaining what was good and what could be improved. If code is submitted, briefly mention time/space complexity.>"
      }
      `;
    }

    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: evaluationPrompt }],
        model: 'llama-3.1-8b-instant',
      });
      const responseText = chatCompletion.choices[0]?.message?.content || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const cleanedJson = jsonMatch ? jsonMatch[0] : '{"score": 0, "feedback": "JSON Parsing Error"}';
      evaluation = JSON.parse(cleanedJson);
    } catch (error) {
      console.error('Gemini API Error during evaluation, using fallback:', error.message);
      evaluation.score = 7;
      evaluation.feedback = "Good attempt! (Fallback evaluation active due to API rate limits).";
    }
  }

  // Apply evaluation
  interview.questions[questionIndex].userAnswer = answer === 'SKIPPED_QUESTION' ? 'Skipped' : answer;
  interview.questions[questionIndex].aiScore = evaluation.score;
  interview.questions[questionIndex].aiFeedback = evaluation.feedback;
  interview.status = 'In Progress';

  // Dynamically generate the NEXT question if we haven't reached the limit and user hasn't ended the interview
  if (!endInterview && interview.questions.length < interview.totalQuestions) {
    const targetCompanyStr = interview.targetCompany ? `Target Company: ${interview.targetCompany}` : '';
    let modeConstraint = '';
    if (interview.interviewType === 'Technical') modeConstraint = 'You MUST ask ONLY deep technical, conceptual coding, or system design questions.';
    if (interview.interviewType === 'Behavioral') modeConstraint = 'You MUST ask ONLY behavioral, HR, cultural fit, or scenario-based communication questions.';
    if (interview.interviewType === 'Mixed') modeConstraint = 'You should ask a balanced mix of technical and behavioral questions.';

    const nextQuestionPrompt = `
      You are an expert interviewer conducting a conversational interview in ${interview.interviewType} mode.
      Target Role: ${interview.role}
      Experience Level: ${interview.experience}
      ${targetCompanyStr}
      ${interview.resumeSkills && interview.resumeSkills.length > 0 ? `The candidate's resume skills are: ${interview.resumeSkills.join(', ')}` : ''}
      
      Here is the interview history so far:
      ${interview.questions.map((q, i) => `Q${i+1}: ${q.questionText}\nA${i+1}: ${i === questionIndex ? answer : q.userAnswer}`).join('\n\n')}

      ${settings.enableFollowUpQuestions 
        ? `Based on the candidate's last answer${interview.resumeSkills && interview.resumeSkills.length > 0 ? ' and their resume' : ''}, if the answer is weak or missing critical details, generate ONE follow-up question to probe deeper. If the answer is complete and excellent, generate a brand new, highly important Main Question on a completely different topic or skill.`
        : `Based on the candidate's last answer, do NOT ask any follow-up questions about it. You MUST generate a completely new, distinct interview question on a completely different topic or skill.`
      }
      Global Admin Difficulty Override: The question MUST perfectly align with the '${settings.aiDifficulty}' difficulty standard.
      ${modeConstraint}

      Provide your response ONLY as a strict JSON object:
      { "nextQuestion": "<The actual question text>" }
    `;
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const nextCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: nextQuestionPrompt }],
        model: 'llama-3.1-8b-instant',
      });
      const nextResponseText = nextCompletion.choices[0]?.message?.content || '';
      const nextJsonMatch = nextResponseText.match(/\{[\s\S]*\}/);
      if (nextJsonMatch) {
        const nextData = JSON.parse(nextJsonMatch[0]);
        if (nextData.nextQuestion) {
          interview.questions.push({ questionText: nextData.nextQuestion });
        }
      }
    } catch (err) {
      console.error('Failed to generate next dynamic question:', err);
      // Fallback: just ask a generic follow up
      interview.questions.push({ questionText: "Could you elaborate more on your previous experience?" });
    }
  }

  await interview.save();
  res.json(interview);
});

// @desc    Complete interview and generate overall feedback
// @route   PUT /api/interviews/:id/complete
// @access  Private
const completeInterview = asyncHandler(async (req, res) => {
  const { videoMetrics, proctoringWarnings } = req.body;
  const interview = await Interview.findById(req.params.id);
  const settings = await AdminSettings.findOne() || { evaluationCriteria: { confidenceAnalysis: true, eyeContactAnalysis: true, technicalAccuracy: true } };

  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }

  // Calculate average score
  const totalScore = interview.questions.reduce((acc, q) => acc + (q.aiScore || 0), 0);
  let avgScore = (totalScore / interview.questions.length) * 10; // Out of 100
  if (isNaN(avgScore)) avgScore = 0;

  // Generate overall feedback and roadmap
  const prompt = `
    You are a career mentor. A candidate just finished an interview.
    Role: ${interview.role}
    Overall Score: ${avgScore}/100
    Here are their scores and feedback for each question:
    ${interview.questions.map((q, i) => `Q: ${q.questionText} | Score: ${q.aiScore}/10 | Feedback: ${q.aiFeedback}`).join('\n')}

    Global Admin Evaluation Criteria Overrides:
    ${settings.evaluationCriteria?.technicalAccuracy ? '- You MUST evaluate Technical Accuracy.' : '- IGNORE Technical Accuracy completely. Do not factor it into your roadmap or feedback.'}
    ${settings.evaluationCriteria?.confidenceAnalysis ? '- You MUST evaluate Confidence and Tone.' : '- IGNORE Confidence and Tone completely.'}

    Provide your final assessment in strict JSON format. DO NOT use literal newlines in the strings, use \n instead:
    {
      "overallFeedback": "<A short paragraph summarizing their overall performance>",
      "roadmap": "<A SINGLE STRING formatted as Markdown containing a bulleted list of topics or skills they need to study next. DO NOT USE AN ARRAY HERE. IT MUST BE A SINGLE STRING.>",
      "skills": [
        { "name": "<Skill Name>", "score": <Number out of 100> },
        { "name": "<Skill Name>", "score": <Number out of 100> },
        { "name": "<Skill Name>", "score": <Number out of 100> }
      ]
    }
  `;

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' }
    });
    
    const responseText = chatCompletion.choices[0]?.message?.content || '{}';
    const finalData = JSON.parse(responseText);

    interview.overallScore = Math.round(avgScore);
    interview.overallFeedback = typeof finalData.overallFeedback === 'string' ? finalData.overallFeedback : JSON.stringify(finalData.overallFeedback || '');
    
    // Force roadmap to string safely
    let safeRoadmap = '';
    if (Array.isArray(finalData.roadmap)) safeRoadmap = finalData.roadmap.join('\n');
    else if (typeof finalData.roadmap === 'string') safeRoadmap = finalData.roadmap;
    else safeRoadmap = JSON.stringify(finalData.roadmap || '');
    interview.roadmap = safeRoadmap;

    // Ensure skills is an array of objects
    interview.skills = Array.isArray(finalData.skills) ? finalData.skills.filter(s => s && s.name && typeof s.score === 'number') : [];
    if (videoMetrics) interview.videoMetrics = videoMetrics;
    if (proctoringWarnings) interview.proctoringWarnings = proctoringWarnings;
    interview.status = 'Completed';

    await interview.save();
    res.json(interview);
  } catch (error) {
    console.error('Groq API Error during completion, using fallback:', error);
    
    interview.overallScore = Math.round(avgScore);
    interview.overallFeedback = "You did a solid job overall! (Fallback generated due to API rate limits). ERROR: " + error.message + " | " + error.stack;
    interview.roadmap = "1. Advanced concepts for your role\n2. System Design basics\n3. Communication skills";
    if (videoMetrics) interview.videoMetrics = videoMetrics;
    if (proctoringWarnings) interview.proctoringWarnings = proctoringWarnings;
    interview.status = 'Completed';

    await interview.save();
    res.json(interview);
  }
});

// @desc    Get user's interviews
// @route   GET /api/interviews
// @access  Private
const getMyInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(interviews);
});

// @desc    Get single interview by ID
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewById = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (interview && interview.user.toString() === req.user._id.toString()) {
    res.json(interview);
  } else {
    res.status(404);
    throw new Error('Interview not found or unauthorized');
  }
});

// @desc    Analyze DAF / Biodata and generate categorized bulk questions
// @route   POST /api/interviews/daf-analyze
// @access  Private
const analyzeDaf = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text) {
    res.status(400);
    throw new Error('Please provide the extracted text from the DAF/Biodata PDF');
  }

  const prompt = `
    You are an expert UPSC/PSC Board Member.
    The following is the extracted text from a candidate's Detailed Application Form (DAF) or Biodata:
    ---
    ${text}
    ---
    
    Analyze this text and generate a comprehensive set of highly probable interview questions they will be asked.
    Categorize them strictly into these arrays: "Education", "HomeState", "OptionalSubject", "WorkExperience", "Hobbies".
    If a category is missing in their DAF, leave the array empty.
    Return the response ONLY as a strict JSON object:
    {
      "Education": ["Q1", "Q2"],
      "HomeState": ["Q1", "Q2"],
      "OptionalSubject": ["Q1"],
      "WorkExperience": [],
      "Hobbies": ["Q1"]
    }
  `;

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.2
    });
    const responseText = chatCompletion.choices[0]?.message?.content || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : '{}';
    const categorizedQuestions = JSON.parse(cleanedJson);
    res.json(categorizedQuestions);
  } catch (error) {
    console.error('Gemini API Error during DAF Analysis:', error.message);
    // Fallback response for rate limiting
    res.json({
      Education: ["Can you justify the gap in your education?", "How does your degree help in administration?"],
      HomeState: ["What are the major tribal issues in your state?", "Explain the geographic significance of your home district."],
      OptionalSubject: ["Why did you choose this optional despite having a different graduation subject?"],
      WorkExperience: ["Why leave a well-paying private job for government service?"],
      Hobbies: ["How can you use your hobby to relieve stress in this job?"]
    });
  }
});

// @desc    Get Global Leaderboard (Top Candidates)
// @route   GET /api/interviews/leaderboard
// @access  Public or Private
const getLeaderboard = asyncHandler(async (req, res) => {
  const allInterviews = await Interview.find({ status: 'Completed' }).populate('user', 'name');
  const userHighestScores = {};
  
  allInterviews.forEach(int => {
    if (int.user && int.user._id) {
      const userId = int.user._id.toString();
      const score = int.overallScore || 0;
      if (!userHighestScores[userId] || score > userHighestScores[userId].score) {
        userHighestScores[userId] = {
          name: int.user.name,
          score: score,
          role: int.role,
          experience: int.experience,
          feedback: int.overallFeedback,
          date: int.createdAt,
          interviewType: int.interviewType
        };
      }
    }
  });

  const topCandidates = Object.values(userHighestScores)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  res.json(topCandidates);
});

export { generateInterview, submitAnswer, completeInterview, getMyInterviews, getInterviewById, analyzeDaf, getLeaderboard };
