# ⚡ Aperonix — Self-Learning Coding AI
**Created by Mohammad Khan**

A self-learning AI that uses Claude, Gemini, and GPT-4o as "Teacher AIs" to write knowledge into a `brain.json` file on GitHub. The Aperonix chat interface reads from this file to answer user coding questions.

---

## 🗂️ Project Structure

```
aperonix/
├── api/
│   └── brain.js          ← Vercel Serverless Function (all backend logic)
├── public/
│   ├── index.html        ← Aperonix Chat Interface (user-facing)
│   └── admin.html        ← Admin Dashboard (Glassmorphism UI)
├── brain.json            ← Upload this to your GitHub repo
├── vercel.json           ← Vercel routing config
├── package.json
└── README.md
```

---

## 🚀 Deployment Steps

### Step 1: Create a GitHub Repository
1. Go to [github.com](https://github.com) and create a new public repo (e.g., `aperonix-brain`)
2. Upload the `brain.json` file from this project to the root of your repo
3. Generate a **Personal Access Token**:
   - GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
   - Select scope: `repo` (full control)
   - Copy the token (starts with `ghp_`)

### Step 2: Deploy to Vercel
1. Push this project to a new GitHub repo (different from the brain repo)
2. Go to [vercel.com](https://vercel.com) and import the project
3. Vercel will auto-detect the `vercel.json` and deploy everything
4. Your URLs will be:
   - Chat Interface: `https://your-project.vercel.app/`
   - Admin Dashboard: `https://your-project.vercel.app/admin.html`
   - API: `https://your-project.vercel.app/api/brain`

### Step 3: Configure the Admin Dashboard
1. Open `https://your-project.vercel.app/admin.html`
2. Go to **Settings (⚙️)** tab
3. Fill in:
   - GitHub Token: `ghp_xxxx...`
   - Owner: your GitHub username
   - Repo: `aperonix-brain` (your brain repo name)
   - Path: `brain.json`
4. Optionally pre-fill your Teacher AI API keys
5. Click **Save Configuration**

### Step 4: Teach Aperonix
1. Go to **Teach AI (🧠)** tab in Admin
2. Select a Teacher: Claude, Gemini, or GPT-4o
3. Paste the API key for the selected teacher
4. Enter a topic like `responsive navbar` or `quiz game`
5. Click **Start Teaching Session**
6. Aperonix will learn and write to `brain.json` on GitHub automatically!

---

## 🧠 How the Brain Works

The `brain.json` file has this structure:

```json
{
  "meta": { "version": "1.0.0", "total_entries": 3 },
  "knowledge": [
    {
      "id": "html-001",
      "tags": ["shopping", "ecommerce", "cart"],
      "title": "Simple Shopping Website",
      "html": "...",
      "css": "...",
      "js": "..."
    }
  ]
}
```

When a user asks "build me a shopping site", Aperonix:
1. Splits the query into words
2. Fuzzy-matches each word against all tags using Levenshtein distance
3. Returns the best-matching entry with full HTML/CSS/JS code

Typo correction is built-in! "shoping webstie" still matches the "shopping" tag.

---

## 🔑 API Endpoints

| Method | Endpoint | Action | Description |
|--------|----------|--------|-------------|
| GET | `/api/brain?action=read` | Read | Fetch brain.json from GitHub |
| POST | `/api/brain?action=chat` | Chat | Query Aperonix brain |
| POST | `/api/brain?action=teach` | Teach | Ask Teacher AI + write to GitHub |
| POST | `/api/brain?action=delete` | Delete | Remove an entry from brain |

---

## 🌐 Multi-Language Support

Aperonix auto-detects:
- **Hindi** (Devanagari script)
- **Hinglish** (common Hindi words in English)
- **English** (default)

Responses adapt to the detected language automatically.

---

## ⚙️ Environment

All configuration is stored in the browser's `localStorage` on the Admin page.
No `.env` file needed — everything is passed securely through API calls.

---

*Made with ❤️ by Mohammad Khan | Powered by Vercel + GitHub*
