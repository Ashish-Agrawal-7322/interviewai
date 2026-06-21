import asyncHandler from 'express-async-handler';
import fs from 'fs';
import path from 'path';
import Resume from '../models/Resume.js';
import Groq from 'groq-sdk';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import streamifier from 'streamifier';

// Helper function to save buffer to local uploads folder
const saveLocally = async (req) => {
  const uploadDir = path.join(path.resolve(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filename = `resume_${Date.now()}_${req.user._id}.pdf`;
  const filepath = path.join(uploadDir, filename);
  await fs.promises.writeFile(filepath, req.file.buffer);
  return `/uploads/${filename}`;
};

// @desc    Upload resume and parse with AI
// @route   POST /api/resumes/upload
// @access  Private
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  try {
    // 1. Save to Local Storage
    const fileUrl = await saveLocally(req);

    // 2. Parse PDF text
    const pdfData = await pdfParse(req.file.buffer);
    const textContent = pdfData.text;

    // 3. Send text to Gemini for skill extraction and ATS scoring
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `
      You are an expert ATS (Applicant Tracking System).
      Please analyze the following resume text.
      Provide the following in strict JSON format:
      {
        "atsScore": <number between 0 and 100 based on the resume quality>,
        "skills": [<array of extracted key technical and soft skills strings>],
        "feedback": "<A short string providing feedback on the resume format, missing elements, or areas of improvement>"
      }
      
      Resume text:
      ${textContent}
    `;

    let aiData;
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        response_format: { type: 'json_object' }
      });
      const responseText = chatCompletion.choices[0]?.message?.content || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const cleanedJson = jsonMatch ? jsonMatch[0] : '{}';
      aiData = JSON.parse(cleanedJson);
    } catch (aiError) {
      console.error('Gemini API Error for Resume Parsing, using Fallback:', aiError.message);
      // Fallback Data
      aiData = {
        atsScore: 85,
        skills: ["JavaScript", "React", "Node.js", "Problem Solving", "Communication", "Fallback Mode Active"],
        feedback: "Your resume is well structured but could use more quantifiable achievements. (This is a fallback evaluation due to API rate limits)."
      };
    }

    // 4. Save to Database
    const resume = await Resume.create({
      user: req.user._id,
      resumeUrl: fileUrl,
      extractedSkills: aiData.skills,
      atsScore: aiData.atsScore,
      feedback: aiData.feedback,
    });

    res.status(201).json(resume);

  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Error processing resume: ' + error.message);
  }
});

// @desc    Get user's resumes
// @route   GET /api/resumes
// @access  Private
const getMyResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(resumes);
});

export { uploadResume, getMyResumes };
