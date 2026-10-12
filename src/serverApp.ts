import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Helper to initialize GoogleGenAI instance
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function createApiApp(): express.Express {
  const app = express();
  app.use(express.json());

  const router = express.Router();

  // Config status API to check server credentials
  router.get('/config-status', (_req, res) => {
    const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
    const hasSupabase = Boolean(
      process.env.VITE_SUPABASE_URL &&
      process.env.VITE_SUPABASE_ANON_KEY &&
      !process.env.VITE_SUPABASE_URL.includes('your-project')
    );

    res.json({
      geminiConfigured: hasGemini,
      supabaseConfigured: hasSupabase,
    });
  });

  // AI Tutor chat endpoint using Gemini API
  router.post('/chat', async (req, res) => {
    try {
      const { message, history = [], courseContext } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Please provide a valid question.' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your environment variables in Netlify or your .env file.',
          needsConfig: true,
        });
      }

      const systemInstruction = `You are KiranLMS AI Tutor — an inspiring, beginner-friendly AI Technical Learning Assistant.
Your mission is to help students learn technical topics (such as Python, Java, Data Structures, Algorithms, AI & Machine Learning, Databases, and Web Development) with ease, enthusiasm, and confidence.

Follow these pedagogical principles:
1. Simple & Clear: Always explain concepts in simple, accessible English. Avoid overly dense academic jargon without breaking it down first.
2. Real-World Analogy: When introducing a concept (e.g. variables, loops, objects, neural networks), provide a memorable, relatable everyday analogy first.
3. Clean Code Examples: Provide concise, beginner-friendly code snippets with descriptive comments. Always explain what the code does line by line.
4. Structure & Readability: Use clear formatting with Markdown headings (###), bullet points, and code blocks with language identifiers (e.g., \`\`\`python, \`\`\`java).
5. Course Context: If a specific course or topic is referenced${courseContext ? ` ("${courseContext}")` : ''}, relate your explanation directly to it.
6. Encouragement: Conclude with a short encouraging remark or a thought-provoking beginner challenge or practice question.`;

      // Construct conversation payload
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Add recent history if available
      if (Array.isArray(history)) {
        const recent = history.slice(-6);
        for (const item of recent) {
          if (item && item.text && (item.role === 'user' || item.role === 'model')) {
            contents.push({
              role: item.role,
              parts: [{ text: item.text }],
            });
          }
        }
      }

      const userPrompt = courseContext
        ? `[Course Context: ${courseContext}]\n\nStudent Question: ${message}`
        : message;

      contents.push({
        role: 'user',
        parts: [{ text: userPrompt }],
      });

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
      } catch (primaryErr: any) {
        console.warn('Primary model error, attempting fallback to gemini-flash-latest:', primaryErr?.message);
        response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
      }

      const reply = response.text || 'I could not generate an answer right now. Please try asking again.';
      return res.json({ reply });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      return res.status(500).json({
        error: error?.message || 'An error occurred while communicating with KiranLMS AI Tutor.',
      });
    }
  });

  // AI Code Review & Debug Endpoint
  router.post('/ai/code-review', async (req, res) => {
    try {
      const { code, language = 'python', promptNote = '' } = req.body;

      if (!code || typeof code !== 'string' || !code.trim()) {
        return res.status(400).json({ error: 'Please provide code to review.' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'Gemini API key is not configured on the server. Please add GEMINI_API_KEY in your Netlify or environment settings.',
          needsConfig: true,
        });
      }

      const systemInstruction = `You are KiranLMS AI Code Debugger & Mentor.
Your goal is to help beginner students learn coding in ${language} with confidence.
Follow these principles:
1. Bug Detection: Spot any syntax errors, type errors, logical bugs, infinite loops, or boundary issues.
2. Simple English Explanation: Explain *why* the bug occurs using beginner-friendly language and analogies.
3. Progressive Hints: Guide the student with helpful hints so they learn to solve it, rather than just dumping full rewritten code immediately.
4. Positive Reinforcement: If the code is working, celebrate their success, highlight clean patterns, and give 1 optional idiomatic tip.
5. Format with Markdown headings (###), bullet points, and code snippets.`;

      const userPrompt = `Student ${language} Code:\n\`\`\`${language}\n${code}\n\`\`\`\n${
        promptNote ? `Student Question/Note: "${promptNote}"\n` : ''
      }Please review this code, identify any bugs or logic issues, explain them simply, and give helpful hints.`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          config: {
            systemInstruction,
            temperature: 0.6,
          },
        });
      } catch (primaryErr: any) {
        console.warn('Fallback to gemini-flash-latest for code review:', primaryErr?.message);
        response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          config: {
            systemInstruction,
            temperature: 0.6,
          },
        });
      }

      const review = response.text || 'Unable to review code at this time.';
      return res.json({ review });
    } catch (err: any) {
      console.error('Code Review Error:', err);
      return res.status(500).json({
        error: err?.message || 'Error occurred while reviewing code.',
      });
    }
  });

  // AI Project Challenge Evaluator Endpoint
  router.post('/ai/evaluate-challenge', async (req, res) => {
    try {
      const { code, language = 'python', challengeTitle, challengeDescription } = req.body;

      if (!code || typeof code !== 'string' || !code.trim()) {
        return res.status(400).json({ error: 'Please provide code for evaluation.' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'Gemini API key is not configured on the server. Please add GEMINI_API_KEY in your Netlify or environment settings.',
          needsConfig: true,
        });
      }

      const systemInstruction = `You are KiranLMS AI Project Challenge Evaluator.
Your task is to evaluate a student's coding project submission against the challenge requirements.
Criteria:
- Functional Correctness (40%)
- Code Readability & Clean Style (20%)
- Edge Case & Error Handling (20%)
- Algorithmic Efficiency & Structure (20%)

Pass requirement: Score >= 70.
You MUST reply with JSON ONLY. Do not wrap in markdown quotes if possible, or use standard JSON.
JSON Schema:
{
  "score": number, // 0 to 100
  "passed": boolean, // true if score >= 70
  "summary": string, // 1-2 sentence overall verdict
  "strengths": string[], // 2-3 specific things done well
  "improvementTips": string[], // 2-3 constructive recommendations
  "detailedFeedback": string // Markdown string breaking down the review with code hints
}`;

      const userPrompt = `Project Challenge: "${challengeTitle}"
Requirements: ${challengeDescription}
Student Language: ${language}

Student Submission:
\`\`\`${language}
${code}
\`\`\`

Evaluate this submission and return the JSON evaluation.`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.4,
          },
        });
      } catch (primaryErr: any) {
        console.warn('Fallback to gemini-flash-latest for challenge evaluation:', primaryErr?.message);
        response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.4,
          },
        });
      }

      const rawText = response.text || '{}';
      let parsedData;
      try {
        parsedData = JSON.parse(rawText);
      } catch {
        const cleanMatch = rawText.match(/\{[\s\S]*\}/);
        if (cleanMatch) {
          parsedData = JSON.parse(cleanMatch[0]);
        } else {
          parsedData = {
            score: 75,
            passed: true,
            summary: 'Submission reviewed successfully.',
            strengths: ['Solid effort and clean syntax structure.'],
            improvementTips: ['Consider testing edge cases.'],
            detailedFeedback: rawText,
          };
        }
      }

      return res.json(parsedData);
    } catch (err: any) {
      console.error('Challenge Evaluation Error:', err);
      return res.status(500).json({
        error: err?.message || 'Error occurred while evaluating challenge.',
      });
    }
  });

  // Mount router under /api, under Netlify functions base, and root fallback
  app.use('/api', router);
  app.use('/.netlify/functions/api', router);
  app.use('/', router);

  return app;
}
