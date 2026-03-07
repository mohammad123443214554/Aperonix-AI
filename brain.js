/**
 * Aperonix Brain API
 * Author: Mohammad Khan
 * Handles reading & writing brain.json on GitHub via REST API.
 * Deploy this as: /api/brain.js on Vercel
 */

const GITHUB_API = "https://api.github.com";

// ─── CORS Helper ─────────────────────────────────────────────────────────────
function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// ─── GitHub: Fetch brain.json ─────────────────────────────────────────────────
async function readBrain(token, owner, repo, path = "brain.json") {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub read failed: ${err.message}`);
  }

  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { brain: JSON.parse(content), sha: data.sha };
}

// ─── GitHub: Write brain.json ─────────────────────────────────────────────────
async function writeBrain(token, owner, repo, brain, sha, path = "brain.json") {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;
  const content = Buffer.from(JSON.stringify(brain, null, 2)).toString("base64");

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message: `🧠 Aperonix brain update — ${new Date().toISOString()}`,
      content,
      sha,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub write failed: ${err.message}`);
  }

  return await res.json();
}

// ─── Teacher AI: Call Claude via Anthropic API ────────────────────────────────
async function teachWithClaude(apiKey, topic) {
  const prompt = `You are a coding knowledge generator for an AI named Aperonix.
Generate a coding knowledge entry for the topic: "${topic}"

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "id": "html-XXX",
  "tags": ["array", "of", "relevant", "search", "tags"],
  "title": "Entry Title",
  "language": "html",
  "description": "Brief description",
  "html": "complete HTML string (escaped)",
  "css": "complete CSS string (escaped)",
  "js": "complete JS string (escaped)"
}

Rules:
- Tags must be lowercase, 1-word strings relevant to what a user might search
- HTML/CSS/JS must be fully functional, clean code
- Escape all double quotes inside the strings with \\"
- The code must work as a standalone project`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
  const data = await res.json();
  const text = data.content[0].text.trim();

  // Strip any accidental markdown fences
  const cleaned = text.replace(/^```json\n?|^```\n?|```$/gm, "").trim();
  return JSON.parse(cleaned);
}

// ─── Teacher AI: Call Gemini ──────────────────────────────────────────────────
async function teachWithGemini(apiKey, topic) {
  const prompt = `You are a coding knowledge generator for an AI named Aperonix.
Generate a coding knowledge entry for: "${topic}"
Return ONLY a JSON object with: id, tags (array), title, language, description, html, css, js.
No markdown, no explanation. Just pure JSON.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4000 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  const text = data.candidates[0].content.parts[0].text.trim();
  const cleaned = text.replace(/^```json\n?|^```\n?|```$/gm, "").trim();
  return JSON.parse(cleaned);
}

// ─── Teacher AI: Call OpenAI GPT ─────────────────────────────────────────────
async function teachWithGPT(apiKey, topic) {
  const prompt = `You are a coding knowledge generator for an AI named Aperonix.
Generate a coding knowledge entry for: "${topic}"
Return ONLY a JSON object with: id, tags (array), title, language, description, html, css, js.
No markdown, no explanation. Just pure JSON.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000,
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error(`GPT API error: ${res.status}`);
  const data = await res.json();
  const text = data.choices[0].message.content.trim();
  const cleaned = text.replace(/^```json\n?|^```\n?|```$/gm, "").trim();
  return JSON.parse(cleaned);
}

// ─── Fuzzy Tag Matcher (for typo correction) ──────────────────────────────────
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function matchQuery(query, knowledge) {
  const words = query.toLowerCase().split(/\s+/);
  return knowledge
    .map((entry) => {
      let score = 0;
      for (const word of words) {
        for (const tag of entry.tags) {
          const dist = levenshtein(word, tag);
          const maxLen = Math.max(word.length, tag.length);
          const similarity = 1 - dist / maxLen;
          if (similarity > 0.6) score += similarity;
          // Exact match bonus
          if (word === tag) score += 2;
        }
      }
      return { entry, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  setCORS(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    // ── READ: Fetch brain.json from GitHub ──
    if (req.method === "GET" && action === "read") {
      const { token, owner, repo } = req.query;
      if (!token || !owner || !repo)
        return res.status(400).json({ error: "Missing token, owner, or repo" });

      const { brain } = await readBrain(token, owner, repo);
      return res.status(200).json({ success: true, brain });
    }

    // ── CHAT: Query Aperonix brain ──
    if (req.method === "POST" && action === "chat") {
      const { query, token, owner, repo } = req.body;
      if (!query) return res.status(400).json({ error: "Missing query" });

      // Fetch latest brain
      let brain = null;
      if (token && owner && repo) {
        try {
          const result = await readBrain(token, owner, repo);
          brain = result.brain;
        } catch (_) {
          // Fall through to empty brain
        }
      }

      const knowledge = brain?.knowledge || [];
      const matches = matchQuery(query, knowledge);

      if (matches.length === 0) {
        return res.status(200).json({
          success: true,
          answer: null,
          message: "I don't have knowledge about this topic yet. Ask an admin to teach me!",
          matches: [],
        });
      }

      // Build combined solution from top match
      const top = matches[0].entry;
      return res.status(200).json({
        success: true,
        answer: top,
        matches: matches.map((m) => ({
          title: m.entry.title,
          score: m.score.toFixed(2),
          id: m.entry.id,
        })),
      });
    }

    // ── TEACH: Ask Teacher AI and write to brain ──
    if (req.method === "POST" && action === "teach") {
      const { topic, teacher, teacherKey, githubToken, owner, repo } = req.body;

      if (!topic || !teacher || !teacherKey || !githubToken || !owner || !repo) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // 1. Generate knowledge from teacher AI
      let newEntry;
      if (teacher === "claude") {
        newEntry = await teachWithClaude(teacherKey, topic);
      } else if (teacher === "gemini") {
        newEntry = await teachWithGemini(teacherKey, topic);
      } else if (teacher === "gpt") {
        newEntry = await teachWithGPT(teacherKey, topic);
      } else {
        return res.status(400).json({ error: "Unknown teacher. Use: claude, gemini, gpt" });
      }

      // 2. Read current brain
      const { brain, sha } = await readBrain(githubToken, owner, repo);

      // 3. Merge — avoid duplicates by title
      const exists = brain.knowledge.findIndex(
        (e) => e.title.toLowerCase() === (newEntry.title || "").toLowerCase()
      );
      if (exists >= 0) {
        brain.knowledge[exists] = newEntry; // Update existing
      } else {
        // Generate a safe unique ID
        newEntry.id = `${teacher}-${Date.now()}`;
        brain.knowledge.push(newEntry);
      }

      brain.meta.last_updated = new Date().toISOString();
      brain.meta.total_entries = brain.knowledge.length;

      // 4. Write back to GitHub
      await writeBrain(githubToken, owner, repo, brain, sha);

      return res.status(200).json({
        success: true,
        message: `✅ Aperonix learned: "${newEntry.title}" from ${teacher.toUpperCase()}`,
        entry: newEntry,
      });
    }

    // ── DELETE: Remove an entry ──
    if (req.method === "POST" && action === "delete") {
      const { id, githubToken, owner, repo } = req.body;
      if (!id || !githubToken || !owner || !repo)
        return res.status(400).json({ error: "Missing fields" });

      const { brain, sha } = await readBrain(githubToken, owner, repo);
      const before = brain.knowledge.length;
      brain.knowledge = brain.knowledge.filter((e) => e.id !== id);

      if (brain.knowledge.length === before)
        return res.status(404).json({ error: "Entry not found" });

      brain.meta.total_entries = brain.knowledge.length;
      brain.meta.last_updated = new Date().toISOString();
      await writeBrain(githubToken, owner, repo, brain, sha);

      return res.status(200).json({ success: true, message: `Deleted entry: ${id}` });
    }

    return res.status(404).json({ error: "Unknown action" });
  } catch (err) {
    console.error("[Aperonix API Error]", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
