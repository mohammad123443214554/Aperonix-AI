// ================================
// APERONIX-AI v0.2
// World's first GitHub-powered AI
// Now learns from 50+ developers!
// Built from scratch - No API!
// By Mohammad Khan, Age 14, India
// ================================

const https = require('https');
const fs = require('fs');

// ============================
// APERONIX KA DIMAAG
// ============================
let aperonix = {
  name: "Aperonix",
  version: "0.2",
  knowledge: [],
  
  // Load old knowledge (memory!)
  loadMemory: function() {
    if (fs.existsSync('memory.json')) {
      let data = JSON.parse(fs.readFileSync('memory.json'));
      this.knowledge = data.knowledge || [];
      console.log(`Memory loaded: ${this.knowledge.length} things I know!`);
    }
  },

  // Save knowledge (so it grows!)
  saveMemory: function() {
    fs.writeFileSync('memory.json', JSON.stringify({
      knowledge: this.knowledge,
      lastUpdated: new Date().toISOString(),
      totalKnowledge: this.knowledge.length
    }, null, 2));
    console.log(`Memory saved: ${this.knowledge.length} things learned!`);
  },

  // Learn something new
  learn: function(keyword, answer, language) {
    // Don't learn duplicates!
    let exists = this.knowledge.find(k => k.keyword === keyword);
    if (!exists) {
      this.knowledge.push({ keyword, answer, language: language || 'Unknown' });
    }
  },

  // Ethics check
  isEthical: function(question) {
    const badWords = ["hack", "virus", "cheat", "harm", "crack", "steal", "exploit", "malware"];
    for (let word of badWords) {
      if (question.toLowerCase().includes(word)) return false;
    }
    return true;
  },

  // Think and answer
  think: function(question) {
    if (!this.isEthical(question)) {
      return "I cannot help with that. Please ask something positive! ❌";
    }

    let results = [];
    for (let fact of this.knowledge) {
      if (question.toLowerCase().includes(fact.keyword.toLowerCase())) {
        results.push(fact.answer);
      }
    }

    if (results.length > 0) return results[0];
    return "I am still learning about this topic. Please check back later! 🧠";
  }
};

// ============================
// GITHUB SE SEEKHNA
// 50+ top developers!
// ============================
const topDevelopers = [
  "torvalds",      // Linux - C
  "gvanrossum",    // Python creator
  "brendaneich",   // JavaScript creator
  "DHH",           // Ruby on Rails
  "yyx990803",     // Vue.js creator
  "tj",            // Express.js
  "sindresorhus",  // 1000+ JS packages
  "addyosmani",    // Google Chrome team
  "antirez",       // Redis creator
  "jashkenas"      // CoffeeScript
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
              if (repo.name && repo.language) {
                aperonix.learn(
                  repo.name.toLowerCase(),
                  `${repo.name} is a ${repo.language} project by ${username}. ${repo.description || ''}. Stars: ${repo.stargazers_count}`,
                  repo.language
                );
              }
            });
            console.log(`✅ Learned from ${username} — ${repos.length} repos`);
          }
        } catch(e) {
          console.log(`⚠️ Could not learn from ${username}`);
        }
        resolve();
      });
    }).on('error', () => resolve());
  });
}

// ============================
// LANGUAGE STATS
// ============================
function showLanguageStats() {
  let stats = {};
  aperonix.knowledge.forEach(k => {
    if (k.language) {
      stats[k.language] = (stats[k.language] || 0) + 1;
    }
  });
  
  console.log("\n📊 Languages Aperonix knows:");
  Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([lang, count]) => {
      console.log(`   ${lang}: ${count} projects`);
    });
}

// ============================
// MAIN - SHURU KARO!
// ============================
async function main() {
  console.log("🤖 Aperonix v0.2 starting...\n");
  
  // Load old memory first!
  aperonix.loadMemory();
  let previousKnowledge = aperonix.knowledge.length;

  // Learn from all top developers!
  console.log("📚 Learning from top GitHub developers...\n");
  for (let dev of topDevelopers) {
    await fetchRepos(dev);
    // Small delay so GitHub doesn't block us
    await new Promise(r => setTimeout(r, 1000));
  }

  // Save everything!
  aperonix.saveMemory();

  // Show stats
  let newLearned = aperonix.knowledge.length - previousKnowledge;
  console.log(`\n✅ Total knowledge: ${aperonix.knowledge.length} things`);
  console.log(`✅ New this run: ${newLearned} things`);
  showLanguageStats();

  // Test Aperonix!
  console.log("\n🧪 Testing Aperonix...");
  console.log("Q: What is linux?");
  console.log("A:", aperonix.think("what is linux"));
  
  console.log("\nQ: Tell me about python");
  console.log("A:", aperonix.think("tell me about python"));

  console.log("\nQ: How to hack?");
  console.log("A:", aperonix.think("how to hack"));

  console.log("\n🚀 Aperonix v0.2 - Built by Mohammad Khan, Age 14, India!");
}

main();
