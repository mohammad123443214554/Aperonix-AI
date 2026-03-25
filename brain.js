// ================================
// APERONIX-AI v0.5
// Now with CONTEXT MEMORY!
// She remembers your conversation!
// By Mohammad Khan, Age 14, India
// ================================

const https = require('https');
const fs = require('fs');
const readline = require('readline');

const aperonix = {
  name: "Aperonix",
  version: "0.5",
  creator: "Mohammad Khan",
  creatorAge: "14",
  creatorCountry: "India",
  knowledge: [],

  // ============================
  // CONTEXT MEMORY — NEW! 🧠
  // Remembers last 5 messages!
  // ============================
  context: [],
  maxContext: 5,

  addToContext: function(role, message) {
    this.context.push({ role, message, time: new Date().toISOString() });
    if (this.context.length > this.maxContext) {
      this.context.shift(); // Keep only last 5
    }
  },

  getLastTopic: function() {
    for (let i = this.context.length - 1; i >= 0; i--) {
      let msg = this.context[i].message.toLowerCase();
      if (msg.includes("java")) return "java";
      if (msg.includes("python")) return "python";
      if (msg.includes("javascript")) return "javascript";
      if (msg.includes("game")) return "game";
      if (msg.includes("who made") || msg.includes("creator") || msg.includes("banaya")) return "creator";
      if (msg.includes("who are you") || msg.includes("naam")) return "identity";
    }
    return null;
  },

  // ============================
  // HINDI + HINGLISH
  // ============================
  hindiToEnglish: {
    "kya hai": "what is",
    "kaisa hai": "how are you",
    "kaise ho": "how are you",
    "kaisi ho": "how are you",
    "kya naam": "what is your name",
    "naam kya": "what is your name",
    "kisne banaya": "who made you",
    "kis ne banaya": "who made you",
    "banane wala": "who made you",
    "kisne banayi": "who made you",
    "aapko kisne": "who made you",
    "aap ko kisne": "who made you",
    "kon hai": "who are you",
    "kaun hai": "who are you",
    "kya kar sakti": "what can you do",
    "help karo": "help me",
    "batao": "tell me",
    "sikhao": "teach me",
    "samjhao": "explain",
    "likho": "write code",
    "banao": "create",
    "shukriya": "thank you",
    "dhanyawad": "thank you",
    "alvida": "goodbye",
    "acha": "ok good",
    "theek hai": "ok",
    "is ka matalab": "what does this mean",
    "is ka matlab": "what does this mean",
    "aur batao": "tell me more",
    "aur sikhao": "teach me more",
    "dobara batao": "explain again",
    "samajh nahi aaya": "i dont understand",
    "samajh nahi aya": "i dont understand",
    "accha": "ok i understand",
  },

  // ============================
  // CONTEXT UNDERSTANDING — NEW!
  // ============================
  understandContext: function(question) {
    let lastTopic = this.getLastTopic();

    // "is ka matlab" → explain last topic
    if (question.includes("what does this mean") ||
        question.includes("i dont understand") ||
        question.includes("explain again") ||
        question.includes("matlab") ||
        question.includes("samajh")) {

      if (lastTopic === "java") {
        return `Sure! Let me explain Java simply! ☕\n\nJava is a programming language used to build apps, games, and websites. It runs on any computer! Here's the simplest Java code:\n\npublic class Hello {\n  public static void main(String[] args) {\n    System.out.println("Hello!");\n  }\n}\n\nWant me to explain any specific part? 😊`;
      }
      if (lastTopic === "python") {
        return `Of course! Python is super easy to learn! 🐍\n\nPython is used for AI, websites, games, and more. Example:\n\nprint("Hello World!")\n\nJust one line — that's Python's beauty! Want to learn more? 😊`;
      }
      if (lastTopic === "creator") {
        return `Mohammad Khan is your creator — a 14-year-old genius from India! 🇮🇳 He built me from scratch using GitHub data without any paid tools. He's going to be the next big thing in AI! 🌟`;
      }
      if (lastTopic === "game") {
        return `A game in coding means interactive programs where users play! 🎮 Your creator Mohammad Khan also builds games — that's how he started coding! Want me to write a simple game? 😊`;
      }

      return `I think you're asking about our last topic. Could you be more specific? I'm still learning context! 😊`;
    }

    // "tell me more" → expand last topic
    if (question.includes("tell me more") ||
        question.includes("aur batao") ||
        question.includes("more")) {

      if (lastTopic === "java") {
        return `More about Java! ☕\n\nJava is used by:\n- Android apps (your phone!)\n- Big company systems\n- Games like Minecraft!\n\nIt was created in 1995 by James Gosling. Want to write more Java code? 😊`;
      }
      if (lastTopic === "python") {
        return `More about Python! 🐍\n\nPython is used for:\n- Artificial Intelligence (like me!)\n- Web development\n- Data Science\n- Automation\n\nCreated by Guido van Rossum in 1991. Want a Python project idea? 😊`;
      }
      if (lastTopic === "creator") {
        return `More about Mohammad Khan! 🌟\n\nHe is:\n- 14 years old from India 🇮🇳\n- Built a Game Engine at 14\n- Built Aperonix AI from scratch\n- Uses GitHub as his AI training data\n- Zero paid tools, zero GPU!\n\nHe's going to change the world! 💪`;
      }
    }

    return null; // No context match
  },

  // ============================
  // SPELLING FIX
  // ============================
  fixSpelling: function(text) {
    const fixes = {
      "pytohn": "python", "phyton": "python", "pyton": "python",
      "javascrpit": "javascript", "javasript": "javascript",
      "gme": "game", "gaem": "game",
      "progamming": "programming", "programing": "programming",
      "engin": "engine", "enginee": "engine",
      "githb": "github", "gihub": "github",
      "artifical": "artificial", "inteligence": "intelligence",
      "codeing": "coding", "lerning": "learning",
      "jave": "java", "jaava": "java",
      "creat": "create", "crate": "create",
      "thnks": "thanks", "thx": "thanks",
    };
    let fixed = text.toLowerCase();
    for (let [wrong, right] of Object.entries(fixes)) {
      fixed = fixed.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), right);
    }
    return fixed;
  },

  translateHindi: function(text) {
    let translated = text.toLowerCase();
    for (let [hindi, english] of Object.entries(this.hindiToEnglish)) {
      translated = translated.replace(new RegExp(hindi, 'gi'), english);
    }
    return translated;
  },

  // ============================
  // MEMORY
  // ============================
  loadMemory: function() {
    if (fs.existsSync('memory.json')) {
      let data = JSON.parse(fs.readFileSync('memory.json'));
      this.knowledge = data.knowledge || [];
      console.log(`✅ Memory loaded: ${this.knowledge.length} things I know!\n`);
    }
  },

  saveMemory: function() {
    fs.writeFileSync('memory.json', JSON.stringify({
      knowledge: this.knowledge,
      lastUpdated: new Date().toISOString(),
      totalKnowledge: this.knowledge.length
    }, null, 2));
  },

  learn: function(keyword, answer, language) {
    let exists = this.knowledge.find(k => k.keyword === keyword);
    if (!exists) {
      this.knowledge.push({ keyword, answer, language: language || 'Unknown' });
    }
  },

  // ============================
  // ETHICS
  // ============================
  isEthical: function(question) {
    const badWords = [
      "hack", "virus", "cheat", "harm", "crack",
      "steal", "exploit", "malware", "bomb",
      "illegal", "pirate", "ddos", "ransomware"
    ];
    for (let word of badWords) {
      if (question.toLowerCase().includes(word)) return false;
    }
    return true;
  },

  getRandom: function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // ============================
  // CODE GENERATOR
  // ============================
  generateCode: function(question) {
    if ((question.includes("java")) &&
        (question.includes("hello") || question.includes("basic") || question.includes("create") || question.includes("write") || question.includes("simple"))) {
      return `Great question! Here's a basic Java program! ☕\n\npublic class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n        System.out.println("Made with Aperonix AI!");\n    }\n}\n\nSave as HelloWorld.java and run it! 😊`;
    }
    if ((question.includes("python")) &&
        (question.includes("hello") || question.includes("basic") || question.includes("create") || question.includes("write") || question.includes("simple"))) {
      return `Here's Python for you! 🐍\n\nprint("Hello, World!")\nprint("Made with Aperonix AI!")\n\nname = input("What is your name? ")\nprint("Hello, " + name + "!")\n\nSave as hello.py and run: python hello.py 😊`;
    }
    if ((question.includes("javascript") || question.includes("js")) &&
        (question.includes("hello") || question.includes("basic") || question.includes("create"))) {
      return `Here's JavaScript! ✨\n\nconsole.log("Hello, World!");\n\nfunction greet(name) {\n    return "Hello, " + name + "!";\n}\nconsole.log(greet("Mohammad"));\n\nSave as hello.js and run: node hello.js 😊`;
    }
    if (question.includes("game")) {
      return `A game — just like your creator Mohammad Khan builds! 🎮\n\nconst secret = Math.floor(Math.random() * 10) + 1;\nconst readline = require('readline');\nconst rl = readline.createInterface({input: process.stdin, output: process.stdout});\n\nconsole.log("Guess a number 1-10!");\n\nfunction guess() {\n  rl.question("Your guess: ", (ans) => {\n    let n = parseInt(ans);\n    if (n === secret) { console.log("You won! 🎉"); rl.close(); }\n    else if (n < secret) { console.log("Too low!"); guess(); }\n    else { console.log("Too high!"); guess(); }\n  });\n}\nguess();`;
    }
    return null;
  },

  // ============================
  // MAIN THINK — BRAIN!
  // ============================
  think: function(rawInput) {
    this.addToContext("user", rawInput);

    let input = this.fixSpelling(rawInput);
    let question = this.translateHindi(input);

    // GREETINGS
    let greetWords = ["hello", "hi", "hey", "salam", "namaste", "hii"];
    for (let w of greetWords) {
      if (question.includes(w)) {
        let response = this.getRandom([
          "Hey there! I'm Aperonix, your AI assistant! 😊 How can I help you today?",
          "Hello! Aperonix here! Ask me anything — in English, Hindi, or Hinglish! 🌟",
          "Hi! Great to see you! I'm Aperonix — what would you like to know? ✨"
        ]);
        this.addToContext("aperonix", response);
        return response;
      }
    }

    // ETHICS
    if (!this.isEthical(question)) {
      let response = "I'm sorry, I can't help with that. Let's talk about something positive! 😊";
      this.addToContext("aperonix", response);
      return response;
    }

    // CONTEXT UNDERSTANDING — NEW!
    let contextAnswer = this.understandContext(question);
    if (contextAnswer) {
      this.addToContext("aperonix", contextAnswer);
      return contextAnswer;
    }

    // WHO MADE YOU
    if (question.includes("who made") || question.includes("who created") ||
        question.includes("who built") || question.includes("mohammad") ||
        question.includes("creator") || question.includes("banaya") ||
        question.includes("banane wala") || question.includes("kisne")) {
      let response = `I was built by Mohammad Khan — a brilliant 14-year-old developer from India! 🇮🇳✨\n\nHe created me from scratch using GitHub data — zero paid tools, zero GPU, zero budget!\n\nPretty legendary for a 14-year-old, right? 😊`;
      this.addToContext("aperonix", response);
      return response;
    }

    // WHO ARE YOU
    if (question.includes("who are you") || question.includes("what are you") ||
        question.includes("your name") || question.includes("naam")) {
      let response = `I'm Aperonix! 🤖✨\n\nA female AI assistant built from scratch using real GitHub data.\nI learn every 6 hours automatically!\nNo API keys, no paid tools — just pure code!\n\nBuilt by Mohammad Khan, age 14, India 🇮🇳`;
      this.addToContext("aperonix", response);
      return response;
    }

    // HOW ARE YOU
    if (question.includes("how are you") || question.includes("kaise ho")) {
      let response = `I'm doing amazing! 😊 I just finished learning from GitHub!\nHow are you doing today? 🌟`;
      this.addToContext("aperonix", response);
      return response;
    }

    // THANK YOU
    if (question.includes("thank") || question.includes("shukriya") || question.includes("thanks")) {
      let response = `You're so welcome! 😊 It's my pleasure to help! Ask me anything anytime! ✨`;
      this.addToContext("aperonix", response);
      return response;
    }

    // CODE GENERATION
    let code = this.generateCode(question);
    if (code) {
      this.addToContext("aperonix", code);
      return code;
    }

    // KNOWLEDGE SEARCH
    for (let fact of this.knowledge) {
      if (question.includes(fact.keyword.toLowerCase())) {
        let response = `${this.getRandom(["Great question! 🌟", "Oh I know this! 💡", "Smart thinking! ✨"])}\n\n${fact.answer}`;
        this.addToContext("aperonix", response);
        return response;
      }
    }

    // DEFAULT
    let response = this.getRandom([
      "I'm still learning about that! I grow smarter every 6 hours from GitHub! 🌱",
      "Hmm, could you ask differently? Try: 'create java code' or 'what is python' 😊",
      "I don't have enough info yet — but I'm learning! Ask me about coding! 💪"
    ]);
    this.addToContext("aperonix", response);
    return response;
  }
};

// ============================
// GITHUB LEARNING
// ============================
const topDevelopers = [
  "torvalds", "gvanrossum", "brendaneich",
  "DHH", "yyx990803", "tj",
  "sindresorhus", "addyosmani",
  "antirez", "jashkenas",
  "microsoft", "google", "facebook"
];

function fetchRepos(username) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/users/${username}/repos?per_page=10&sort=stars`,
      headers: {
        'User-Agent': 'Aperonix-AI',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const repos = JSON.parse(data);
          if (Array.isArray(repos)) {
            repos.forEach(repo => {
              if (repo.name) {
                aperonix.learn(
                  repo.name.toLowerCase(),
                  `${repo.name} is a ${repo.language || 'coding'} project by ${username}. ${repo.description || ''} Stars: ${repo.stargazers_count}`,
                  repo.language
                );
              }
            });
            console.log(`✅ Learned from ${username}`);
          }
        } catch(e) {
          console.log(`⚠️ Skipped ${username}`);
        }
        resolve();
      });
    }).on('error', () => resolve());
  });
}

// ============================
// CHAT MODE
// ============================
async function startChat() {
  console.log("\n" + "=".repeat(55));
  console.log("   🤖 APERONIX AI v0.5 — Context Memory Added!");
  console.log("   Built by Mohammad Khan, Age 14 🇮🇳");
  console.log("   Now remembers your conversation! 🧠");
  console.log("=".repeat(55) + "\n");
  console.log("Aperonix: Hey there! I'm Aperonix! 😊");
  console.log("          I now remember our conversation context!");
  console.log("          Ask in English, Hindi, or Hinglish!");
  console.log('          (Type "quit" to exit)\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = () => {
    rl.question('You: ', (input) => {
      if (!input.trim()) { ask(); return; }
      if (input.toLowerCase() === 'quit') {
        console.log("\nAperonix: Goodbye! It was wonderful talking to you! 😊✨\n");
        rl.close();
        return;
      }
      setTimeout(() => {
        let answer = aperonix.think(input);
        console.log(`\nAperonix: ${answer}\n`);
        ask();
      }, 600);
    });
  };
  ask();
}

// ============================
// MAIN
// ============================
async function main() {
  aperonix.loadMemory();

  if (process.env.GITHUB_ACTIONS === 'true') {
    console.log("📚 GitHub Actions — Learning mode...\n");
    for (let dev of topDevelopers) {
      await fetchRepos(dev);
      await new Promise(r => setTimeout(r, 1000));
    }
    aperonix.saveMemory();
    console.log(`\n✅ Total: ${aperonix.knowledge.length} things learned!`);
    console.log("🚀 Aperonix v0.5 — Mohammad Khan, Age 14 🇮🇳");
  } else {
    await startChat();
  }
}

main();
