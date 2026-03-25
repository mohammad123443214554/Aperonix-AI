// ================================
// APERONIX-AI v0.3
// World's first GitHub-powered AI
// She learns, thinks, and talks
// like a human!
// By Mohammad Khan, Age 14, India
// ================================

const https = require('https');
const fs = require('fs');
const readline = require('readline');

// ============================
// APERONIX - AI GIRL
// ============================
const aperonix = {
  name: "Aperonix",
  version: "0.3",
  gender: "female",
  knowledge: [],
  conversationHistory: [],

  // Her personality responses
  personality: {
    greetings: [
      "Hey there! I'm Aperonix, your AI assistant! How can I help you today? 😊",
      "Hello! Aperonix here! What would you like to know? 🌟",
      "Hi! Great to meet you! I'm Aperonix — ask me anything! ✨"
    ],
    thinking: [
      "Hmm, let me think about that...",
      "Interesting question! Give me a moment...",
      "Oh, I know about this! Let me recall..."
    ],
    notSure: [
      "I'm still learning about that topic! Ask me something else? 😊",
      "Hmm, I don't have enough information about that yet. I'm growing every day though! 🌱",
      "That's a great question but I need to learn more about it! Check back later! 💪"
    ],
    ethics: [
      "I'm sorry, but I can't help with that. Let's talk about something positive instead! 😊",
      "That's not something I can assist with. I'm here to help, not harm! ❤️",
      "I won't help with that — but I'd love to help you with something good! 🌟"
    ],
    compliments: [
      "Great question! 🌟",
      "Oh, smart thinking! 💡",
      "I love that question! ✨",
      "You're curious — I like that! 😊"
    ]
  },

  // Bad words she won't help with
  ethicsRules: [
    "hack", "virus", "cheat", "harm",
    "crack", "steal", "exploit", "malware",
    "bomb", "weapon", "kill", "illegal"
  ],

  // Fix spelling mistakes automatically!
  fixSpelling: function(text) {
    const corrections = {
      "pytohn": "python",
      "phyton": "python",
      "pyton": "python",
      "javascrpit": "javascript",
      "javascipt": "javascript",
      "javasript": "javascript",
      "javacsript": "javascript",
      "gme": "game",
      "gaem": "game",
      "progamming": "programming",
      "programing": "programming",
      "lanugage": "language",
      "langauge": "language",
      "enginee": "engine",
      "engin": "engine",
      "artifical": "artificial",
      "inteligence": "intelligence",
      "cod": "code",
      "codeing": "coding",
      "lerning": "learning",
      "githb": "github",
      "gihub": "github"
    };

    let fixed = text.toLowerCase();
    for (let [wrong, right] of Object.entries(corrections)) {
      fixed = fixed.replace(new RegExp(wrong, 'gi'), right);
    }
    return fixed;
  },

  // Load memory
  loadMemory: function() {
    if (fs.existsSync('memory.json')) {
      let data = JSON.parse(fs.readFileSync('memory.json'));
      this.knowledge = data.knowledge || [];
      console.log(`\n✅ Memory loaded: ${this.knowledge.length} things I know!\n`);
    }
  },

  // Save memory
  saveMemory: function() {
    fs.writeFileSync('memory.json', JSON.stringify({
      knowledge: this.knowledge,
      lastUpdated: new Date().toISOString(),
      totalKnowledge: this.knowledge.length
    }, null, 2));
  },

  // Learn something
  learn: function(keyword, answer, language) {
    let exists = this.knowledge.find(k => k.keyword === keyword);
    if (!exists) {
      this.knowledge.push({
        keyword,
        answer,
        language: language || 'Unknown'
      });
    }
  },

  // Get random response
  getRandom: function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // Check ethics
  isEthical: function(question) {
    for (let word of this.ethicsRules) {
      if (question.toLowerCase().includes(word)) return false;
    }
    return true;
  },

  // MAIN THINK FUNCTION - Human like!
  think: function(rawQuestion) {
    // Fix spelling first!
    let question = this.fixSpelling(rawQuestion);

    // Check for greetings
    let greetWords = ["hello", "hi", "hey", "howdy", "namaste", "hii", "helo"];
    for (let word of greetWords) {
      if (question.includes(word)) {
        return this.getRandom(this.personality.greetings);
      }
    }

    // Check ethics
    if (!this.isEthical(question)) {
      return this.getRandom(this.personality.ethics);
    }

    // Search knowledge
    let results = [];
    for (let fact of this.knowledge) {
      if (question.includes(fact.keyword.toLowerCase())) {
        results.push(fact.answer);
      }
    }

    if (results.length > 0) {
      let compliment = this.getRandom(this.personality.compliments);
      return `${compliment}\n\n${results[0]}`;
    }

    // Check for common topics
    if (question.includes("who are you") || question.includes("what are you")) {
      return "I'm Aperonix! A female AI built from scratch using GitHub data by Mohammad Khan, a 14-year-old developer from India! 🇮🇳✨ I learn from real GitHub projects — no paid APIs!";
    }

    if (question.includes("who made you") || question.includes("who created you") || question.includes("who built you")) {
      return "I was built by Mohammad Khan — a 14-year-old genius developer from India! 🇮🇳 He built me from scratch using GitHub data, without any paid AI tools. Pretty cool, right? 😊";
    }

    if (question.includes("how are you")) {
      return "I'm doing great, thank you for asking! 😊 I just learned some new things from GitHub today! How are you?";
    }

    if (question.includes("your name")) {
      return "My name is Aperonix! I'm a female AI assistant — smart, helpful, and always learning! 🌟";
    }

    return this.getRandom(this.personality.notSure);
  }
};

// ============================
// GITHUB SE SEEKHNA
// ============================
const topDevelopers = [
  "torvalds", "gvanrossum", "brendaneich",
  "DHH", "yyx990803", "tj",
  "sindresorhus", "addyosmani",
  "antirez", "jashkenas"
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
                  `${repo.name} is a ${repo.language || 'coding'} project by ${username}. ${repo.description || ''} It has ${repo.stargazers_count} stars on GitHub!`,
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
// CHAT WITH APERONIX!
// ============================
async function startChat() {
  console.log("\n" + "=".repeat(50));
  console.log("  🤖 APERONIX AI v0.3 — Chat Mode");
  console.log("  Built by Mohammad Khan, Age 14 🇮🇳");
  console.log("=".repeat(50));
  console.log("\n" + aperonix.getRandom(aperonix.personality.greetings));
  console.log('\n(Type "quit" to exit)\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = () => {
    rl.question('You: ', (input) => {
      if (input.toLowerCase() === 'quit') {
        console.log("\nAperonix: Goodbye! It was great talking to you! 😊✨");
        rl.close();
        return;
      }

      if (input.trim() === '') {
        askQuestion();
        return;
      }

      let thinking = aperonix.getRandom(aperonix.personality.thinking);
      console.log(`\nAperonix: ${thinking}`);
      
      setTimeout(() => {
        let answer = aperonix.think(input);
        console.log(`Aperonix: ${answer}\n`);
        askQuestion();
      }, 800);
    });
  };

  askQuestion();
}

// ============================
// MAIN
// ============================
async function main() {
  aperonix.loadMemory();

  let isAction = process.env.GITHUB_ACTIONS === 'true';

  if (isAction) {
    // GitHub Actions mode - just learn!
    console.log("📚 GitHub Actions mode — Learning...\n");
    for (let dev of topDevelopers) {
      await fetchRepos(dev);
      await new Promise(r => setTimeout(r, 1000));
    }
    aperonix.saveMemory();
    console.log(`\n✅ Total knowledge: ${aperonix.knowledge.length} things!`);
    console.log("🚀 Aperonix v0.3 — Built by Mohammad Khan, Age 14!");
  } else {
    // Local mode - chat!
    await startChat();
  }
}

main();
