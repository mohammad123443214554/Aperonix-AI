// api/chat.js — Vercel Serverless Function (Placeholder)
// 📌 Connect your AI model here (e.g., OpenAI, Anthropic, Gemini, etc.)

const { SYSTEM_PROMPT } = require("../systemPrompt.js");

module.exports = async (req, res) => {
  // Allow CORS for local development and Vercel deployments
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { message, history = [] } = req.body;

    // Validate input
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Message is required." });
    }

    // ---------------------------------------------------------------
    // 🔌 PLACEHOLDER — Replace this block with your real AI model call
    // ---------------------------------------------------------------
    // Example with OpenAI (commented out):
    //
    // const { OpenAI } = require("openai");
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    //
    // const completion = await openai.chat.completions.create({
    //   model: "gpt-4o",
    //   messages: [
    //     { role: "system", content: SYSTEM_PROMPT },
    //     ...history,
    //     { role: "user", content: message }
    //   ],
    // });
    //
    // const reply = completion.choices[0].message.content;
    // ---------------------------------------------------------------

    // Placeholder response — remove this once AI is connected
    const reply =
      `⚠️ Placeholder Response: This is Aperonix AI, created by Kadir Khan.\n\n` +
      `You said: "${message}"\n\n` +
      `The AI brain is not yet connected. To enable real intelligence, open ` +
      `/api/chat.js and connect your preferred AI model (OpenAI, Anthropic, Gemini, etc.).`;

    // Return the AI reply
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Aperonix API Error:", error);
    return res.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
};
