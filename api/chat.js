// Vercel Serverless Function — CommonJS format
// GEMINI_API_KEY set karo: Vercel Dashboard > Settings > Environment Variables

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY not set. Go to Vercel Dashboard → Settings → Environment Variables and add it.'
    });
  }

  let messages;
  try {
    messages = req.body && req.body.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid request: messages array required' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const SYSTEM_PROMPT = 'You are Aperonix AI, a highly intelligent, helpful, and friendly AI assistant powered by Google Gemini. Provide accurate, detailed, well-structured responses. Use Markdown formatting where appropriate.';

  // Build Gemini request
  const contents = messages.map(function(m) {
    return {
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    };
  });

  const geminiBody = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: contents,
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192
    }
  };

  try {
    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody)
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const errMsg = (data && data.error && data.error.message) || ('Gemini error: ' + geminiRes.status);
      return res.status(geminiRes.status).json({ error: errMsg });
    }

    const text =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;

    return res.status(200).json({ content: text || 'No response received.' });

  } catch (err) {
    console.error('Gemini fetch error:', err);
    return res.status(500).json({ error: 'Failed to reach Gemini API: ' + err.message });
  }
};
