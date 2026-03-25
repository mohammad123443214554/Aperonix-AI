// ================================
// APERONIX-AI v0.4
// World's first GitHub-powered AI
// She understands Hindi, Hinglish,
// English — and codes too!
// By Mohammad Khan, Age 14, India
// ================================

const https = require('https');
const fs = require('fs');
const readline = require('readline');

const aperonix = {
  name: "Aperonix",
  version: "0.4",
  gender: "female",
  creator: "Mohammad Khan",
  creatorAge: "14",
  creatorCountry: "India",
  knowledge: [],

  // ============================
  // HINDI + HINGLISH DICTIONARY
  // ============================
  hindiToEnglish: {
    // Questions
    "kya hai": "what is",
    "kaisa hai": "how are you",
    "kaise ho": "how are you",
    "kaisi ho": "how are you",
    "kya naam": "what is your name",
    "naam kya": "what is your name",
    "kisne banaya": "who made you",
    "kis ne banaya": "who made you",
    "banane wala": "who made you",
    "tune banaya": "who made you",
    "kisne banayi": "who made you",
    "aapko kisne": "who made you",
    "aap ko kisne": "who made you",
    "kon hai": "who are you",
    "kaun hai": "who are you",
    "kya kar sakti": "what can you do",
    "kya kar sakte": "what can you do",
    "help karo": "help me",
    "batao": "tell me",
    "sikhao": "teach me",
    "samjhao": "explain",
    "likho": "write code",
    "banao": "create",
    "shukriya": "thank you",
    "dhanyawad": "thank you",
    "alvida": "goodbye",
    "bye": "goodbye",
    "acha": "ok good",
    "theek hai": "ok",
    "haan": "yes",
    "nahi": "no",
  },

  // ============================
  // SPELLING FIXES
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
      "pyton": "python", "cpp": "cpp",
      "mujhe": "me", "aapko": "you",
      "karo": "do", "karna": "do",
    };
    let fixed = text.toLowerCase();
    for (let [wrong, right] of Object.entries(fixes)) {
      fixed = fixed.replace(new RegExp(wrong, 'gi'), right);
    }
    return fixed;
  },

  // ============================
  // HINDI → ENGLISH TRANSLATE
  // ============================
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
      "steal", "exploit", "malware", "bomb", "weapon",
      "kill", "illegal", "pirate", "ddos", "ransomware"
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
    if (question.includes("java") && (question.includes("hello") || question.includes("basic"))) {
      return `Great question! Here's a basic Java program for you! 🎯\n
\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Made with Aperonix AI!");
    }
}
\`\`\`
Save this as HelloWorld.java and run it! 😊`;
    }

    if (question.includes("python") && (question.includes("hello") || question.includes("basic"))) {
      return `Sure! Here's Python for you! 🐍\n
\`\`\`python
print("Hello, World!")
print("Made with Aperonix AI!")

# Simple calculator
num1 = int(input("Enter first number: "))
num2 = int(input("Enter second number: "))
print(f"Sum = {num1 + num2}")
\`\`\`
Save as hello.py and run with: python hello.py 😊`;
    }

    if (question.includes("javascript") && (question.includes("hello") || question.includes("basic"))) {
      return `Here's JavaScript for you! ✨\n
\`\`\`javascript
console.log("Hello, World!");
console.log("Made with Aperonix AI!");

// Simple function
function greet(name) {
    return "Hello, " + name + "!";
}
console.log(greet("Mohammad"));
\`\`\`
Save as hello.js and run: node hello.js 😊`;
    }

    if (question.includes("game") && question.includes("javascript")) {
      return `Ooh, a game! Just like your creator Mohammad Khan! 🎮\n
\`\`\`javascript
// Simple Number Guessing Game
const secret = Math.floor(Math.random() * 10) + 1;
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin, output: process.stdout
});

console.log("Guess a number between 1 and 10!");

function guess() {
  rl.question("Your guess: ", (ans) => {
    let num = parseInt(ans);
    if (num === secret) {
      console.log("Correct! You won! 🎉");
      rl.close();
    } else if (num < secret) {
      console.log("Too low! Try again!");
      guess();
    } else {
      console.log("Too high! Try again!");
      guess();
    }
  });
}
guess();
\`\`\``;
    }

    return null;
  },

  // ============================
  // MAIN THINK — BRAIN!
  // ============================
  think: function(rawInput) {
    // Fix spelling
    let input = this.fixSpelling(rawInput);
    // Translate Hindi
    let question = this.translateHindi(input);

    // GREETINGS
    let greetWords = ["hello", "hi", "hey", "howdy", "hii", "helo", "salam", "namaste"];
    for (let w of greetWords) {
      if (question.includes(w)) {
        return this.getRandom([
          "Hey there! I'm Aperonix, your AI assistant! How can I help you today? 😊",
          "Hello! Aperonix here! What would you like to know? 🌟",
          "Hi! Great to meet you! I'm Aperonix — ask me anything! ✨"
        ]);
      }
    }

    // ETHICS CHECK
    if (!this.isEthical(question)) {
      return this.getRandom([
        "I'm sorry, I can't help with that. Let's talk about something positive! 😊",
        "That's not something I'll assist with. I'm here to help, not harm! ❤️",
        "I won't help with that — but I'd love to help you with something good! 🌟"
      ]);
    }

    // WHO MADE YOU
    if (question.includes("who made you") || question.includes("who created") ||
        question.includes("who built") || question.includes("banane wala") ||
        question.includes("mohammad") || question.includes("creator")) {
      return `I was built by Mohammad Khan — a brilliant 14-year-old developer from India! 🇮🇳✨ He created me from scratch using GitHub data, with zero paid tools and zero GPU. Pretty legendary, right? 😊`;
    }

    // WHO ARE YOU
    if (question.includes("who are you") || question.includes("what are you") ||
        question.includes("your name") || question.includes("naam")) {
      return `I'm Aperonix! 🤖✨ A female AI assistant built from scratch using real GitHub data. I learn every 6 hours — no API keys, no paid tools! Built by Mohammad Khan, age 14, India 🇮🇳`;
    }

    // HOW ARE YOU
    if (question.includes("how are you") || question.includes("kaise ho") ||
        question.includes("kaisi ho")) {
      return `I'm doing amazing, thank you! 😊 I just finished learning from GitHub a few hours ago. How are you doing? 🌟`;
    }

    // THANK YOU
    if (question.includes("thank") || question.includes("shukriya") ||
        question.includes("dhanyawad") || question.includes("thanks")) {
      return `You're so welcome! 😊 It's my pleasure to help! Ask me anything anytime! ✨`;
    }

    // GOODBYE
    if (question.includes("goodbye") || question.includes("bye") ||
        question.includes("alvida") || question.includes("quit")) {
      return `Goodbye! It was wonderful talking to you! Come back anytime! 😊✨`;
    }

    // CODE GENERATION
    let code = this.generateCode(question);
    if (code) return code;

    // KNOWLEDGE SEARCH
    let results = [];
    for (let fact of this.knowledge) {
      if (question.includes(fact.keyword.toLowerCase())) {
        results.push(fact.answer);
      }
    }
    if (results.length > 0) {
      let compliment = this.getRandom([
        "Great question! 🌟", "Oh, I know this! 💡",
        "Smart thinking! ✨", "I love that question! 😊"
      ]);
      return `${compliment}\n\n${results[0]}`;
    }

    // DEFAULT
    return this.getRandom([
      "I'm still learning about that! I grow smarter every 6 hours from GitHub! 🌱",
      "Hmm, I don't have enough info yet. Ask me about coding, Java, Python, or JavaScript! 😊",
      "Great question! I'm still learning — check back soon! 💪"
    ]);
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
  console.log("   🤖 APERONIX AI v0.4 — Now smarter than ever!");
  console.log("   Built by Mohammad Khan, Age 14 🇮🇳");
  console.log("   Hindi + Hinglish + English supported!");
  console.log("=".repeat(55) + "\n");
  console.log("Aperonix: Hey there! I'm Aperonix, your AI assistant! 😊");
  console.log("          Ask me in English, Hindi, or Hinglish!");
  console.log('          (Type "quit" to exit)\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = () => {
    rl.question('You: ', (input) => {
      if (!input.trim()) { ask(); return; }
      if (input.toLowerCase() === 'quit') {
        console.log("\nAperonix: Goodbye! Come back soon! 😊✨\n");
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
    console.log("📚 Learning from GitHub...\n");
    for (let dev of topDevelopers) {
      await fetchRepos(dev);
      await new Promise(r => setTimeout(r, 1000));
    }
    aperonix.saveMemory();
    console.log(`\n✅ Total: ${aperonix.knowledge.length} things learned!`);
    console.log("🚀 Aperonix v0.4 — Mohammad Khan, Age 14, India 🇮🇳");
  } else {
    await startChat();
  }
}

main();
