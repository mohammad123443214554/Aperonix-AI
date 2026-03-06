// server.js — Plain Node.js dev server (no Vercel CLI needed)
// Run: node server.js   then open http://localhost:3000

const http = require("http");
const fs   = require("fs");
const path = require("path");
const chatHandler = require("./api/chat.js");

const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html",
  ".css":  "text/css",
  ".js":   "application/javascript",
  ".png":  "image/png",
  ".ico":  "image/x-icon",
  ".svg":  "image/svg+xml",
};

const server = http.createServer(async (req, res) => {
  // Route API
  if (req.url === "/api/chat" && req.method === "POST") {
    let body = "";
    req.on("data", c => (body += c));
    req.on("end", async () => {
      req.body = JSON.parse(body || "{}");
      await chatHandler(req, res);
    });
    return;
  }

  // Serve static files
  let filePath = path.join(__dirname, req.url === "/" ? "index.html" : req.url);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[ext] || "text/plain" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n✦ Aperonix AI running at http://localhost:${PORT}`);
  console.log(`  Make sure Ollama is running: ollama serve`);
  console.log(`  And llama3 is pulled: ollama pull llama3\n`);
});
