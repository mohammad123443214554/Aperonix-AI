// Aperonix AI - Image Generation Serverless Function
// Uses Gemini's Imagen model via API

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    // Using Imagen 3 via Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
          },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData?.error?.message || "Image generation failed");
    }

    const data = await response.json();
    const imageBase64 = data?.predictions?.[0]?.bytesBase64Encoded;

    if (!imageBase64) {
      throw new Error("No image generated");
    }

    return res.status(200).json({
      image: `data:image/png;base64,${imageBase64}`,
    });
  } catch (error) {
    console.error("Image API Error:", error.message);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
