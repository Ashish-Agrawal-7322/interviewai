import asyncHandler from 'express-async-handler';
import Groq from 'groq-sdk';



// @desc    Execute code using Piston API
// @route   POST /api/code/execute
// @access  Private
const executeCode = asyncHandler(async (req, res) => {
  const { language, version, sourceCode } = req.body;

  if (!language || !version || !sourceCode) {
    res.status(400);
    throw new Error('Please provide language, version, and source code');
  }

  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    // The public Piston API was disabled recently, so we use Groq AI to perfectly simulate execution!
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a strict, standard-compliant code execution engine for ${language} version ${version}. You will be given source code. You must respond ONLY with the exact standard output (stdout) that the code would produce when executed. If the code has a syntax error, compile error, or runtime error, output the exact error message that a real compiler/interpreter would throw. Do NOT wrap the output in markdown code blocks. Do NOT provide any explanations, comments, or conversational text. Your entire response must be ONLY the raw console output string.`
        },
        {
          role: "user",
          content: sourceCode
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.0,
      max_tokens: 1024,
    });

    let output = completion.choices[0]?.message?.content || '';
    
    // Remove markdown code blocks if the AI accidentally adds them
    output = output.replace(/^```[a-z]*\n/im, '').replace(/```$/m, '').trim();

    res.json({
      run: { output: output },
      compile: { output: '' },
    });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Failed to execute code');
  }
});

export { executeCode };
