// api/chat.js — Aperonix AI Backend
// Connects to local Ollama instance running llama3
// Works as a Vercel serverless function OR a plain Node.js server

const { SYSTEM_PROMPT } = require("../systemprompt.js");

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "llama3";

// ── Vercel Serverless Handler ────────────────────────────────
module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { message, history = [] } = req.body || {};

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Missing or empty 'message' field." });
  }

  // Build full conversation context for Ollama
  // We embed history into the prompt since Ollama /api/generate uses a single prompt string
  let conversationContext = "";
  if (history.length > 0) {
    conversationContext = history
      .slice(-10) // Last 10 messages for context window management
      .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");
    conversationContext += "\n";
  }

  const fullPrompt = `${SYSTEM_PROMPT}\n\n${conversationContext}User: ${message.trim()}\nAssistant:`;

  try {
    // Call local Ollama API
    const ollamaRes = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        prompt: fullPrompt,
        stream: false,        // Get full response at once
        options: {
          temperature: 0.7,   // Balanced creativity
          top_p: 0.9,
          num_predict: 1024   // Max tokens per response
        }
      })
    });

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text();
      console.error("Ollama error:", errText);
      return res.status(502).json({
        error: "Ollama API error. Make sure Ollama is running and llama3 is pulled.",
        detail: errText
      });
    }

    const data = await ollamaRes.json();
    const reply = (data.response || "").trim();

    return res.status(200).json({
      reply,
      model: MODEL,
      done: data.done ?? true
    });

  } catch (err) {
    console.error("Connection error:", err.message);

    // Friendly error if Ollama isn't running
    if (err.code === "ECONNREFUSED" || err.message.includes("fetch failed")) {
      return res.status(503).json({
        error: "Cannot connect to Ollama. Please make sure Ollama is running on localhost:11434 and the llama3 model is installed.",
        hint: "Run: ollama pull llama3 && ollama serve"
      });
    }

    return res.status(500).json({ error: "Internal server error.", detail: err.message });
  }
};
