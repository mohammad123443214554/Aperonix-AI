# ⬡ Aperonix AI

A production-ready AI SaaS web application powered by **Google Gemini**, built for deployment on **Vercel**.

---

## ✨ Features

- 💬 **AI Chat** — Conversational AI with full history context (Gemini 1.5 Flash)
- 🎨 **Image Generation** — Text-to-image via Google Imagen 3
- 🔒 **Secure** — API keys handled server-side via Vercel environment variables
- 📱 **Responsive** — Clean dark UI optimized for all screen sizes
- 💰 **AdSense Ready** — Placeholder slots for monetization
- ⚡ **Fast** — Serverless functions on Vercel's global edge network

---

## 🗂️ Project Structure

```
aperonix-ai/
├── api/
│   ├── chat.js        ← Serverless: Gemini chat handler
│   └── image.js       ← Serverless: Imagen image generator
├── index.html         ← Main chat page
├── style.css          ← Global dark theme styles
├── app.js             ← Chat page logic
├── image.html         ← Image generation page
├── image.js           ← Image page logic
├── about.html         ← About page
├── vercel.json        ← Vercel routing & config
├── package.json       ← Project dependencies
└── README.md
```

---

## 🚀 Deployment on Vercel

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/aperonix-ai.git
cd aperonix-ai
npm install
```

### 2. Set Environment Variables

In your Vercel dashboard, go to **Settings → Environment Variables** and add:

| Variable | Value |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key |

Get your API key at: https://aistudio.google.com/app/apikey

### 3. Deploy

```bash
npm run deploy
```

Or connect your GitHub repo to Vercel for automatic deployments.

---

## 💻 Local Development

```bash
npm install -g vercel
vercel dev
```

This starts a local server at `http://localhost:3000` with serverless functions.

---

## 💰 AdSense Setup

1. Get approved at https://www.google.com/adsense/
2. In each HTML file, replace `ca-pub-XXXXXXXXXXXXXXXX` with your Publisher ID
3. Uncomment the AdSense `<script>` tag and `<ins>` ad unit blocks

Ad placements included:
- **Top Banner** (728x90 Leaderboard) — top of each page
- **Sidebar** (300x250 Medium Rectangle) — left sidebar
- **In-Content** (responsive) — image.html content area

---

## 🔑 API Keys

- **Never** commit your `.env` file
- Set `GEMINI_API_KEY` only through Vercel's environment variable dashboard
- The frontend **never** has access to the API key

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js (Vercel Serverless Functions) |
| AI Model | Google Gemini 1.5 Flash + Imagen 3 |
| Hosting | Vercel |
| Fonts | Syne + JetBrains Mono (Google Fonts) |

---

## 📄 License

MIT © Aperonix AI
