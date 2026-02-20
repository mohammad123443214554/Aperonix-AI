import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate image: ${prompt}` }] }]
        })
      }
    );

    const data = await response.json();

    res.json({
      reply: data.candidates?.[0]?.content?.parts?.[0]?.text
    });

  } catch {
    res.status(500).json({ error: "Image error" });
  }
});

export default router;
