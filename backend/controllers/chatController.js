import asyncHandler from 'express-async-handler';
import Groq from 'groq-sdk';

// @desc    Process chat message with Groq AI
// @route   POST /api/chat
// @access  Public
export const handleChat = asyncHandler(async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400);
    throw new Error('Messages array is required');
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // Format the conversation history for Groq
  const formattedMessages = [
    {
      role: 'system',
      content: "You are an expert AI Career and Interview Preparation Assistant embedded in a web platform called 'InterviewAI'. Your goal is to help users land their dream job. You should be extremely encouraging, highly knowledgeable about technical interviews, resume building, and career growth. If a user expresses frustration or difficulty (like 'i am 23 and still have no job'), respond with deep empathy, encouragement, and actionable step-by-step advice. Keep responses concise, well-formatted, and conversational."
    }
  ];

  messages.forEach(msg => {
    // Map our frontend sender ('user' | 'ai') to Groq roles ('user' | 'assistant')
    const role = msg.sender === 'user' ? 'user' : 'assistant';
    formattedMessages.push({ role, content: msg.text });
  });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: 'llama-3.3-70b-versatile', // updated to current supported model
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || "I'm having trouble connecting to my brain right now. Please try again in a moment!";

    res.status(200).json({ response: responseContent });
  } catch (error) {
    console.error('Groq AI Chat Error:', error);
    res.status(500).json({ message: 'Failed to process chat response.' });
  }
});
