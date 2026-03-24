// ================================
// APERONIX-AI v0.1
// World's first GitHub-powered AI
// Built from scratch - No API!
// By Mohammad Khan, Age 14, India
// ================================

const https = require('https');

// ============================
// APERONIX KA DIMAAG - BLANK!
// Jaise naya bachha paida hua
// ============================
let aperonix = {
  name: "Aperonix",
  version: "0.1",
  age: 0,           // abhi naya hai
  knowledge: [],    // bilkul blank!
  ethicsRules: [    // tera unique idea!
    "hack",
    "virus", 
    "cheat",
    "harm",
    "crack",
    "steal"
  ],

  // ============================
  // SEEKHNA - GitHub se!
  // ============================
  learn: function(keyword, answer) {
    this.knowledge.push({ keyword, answer });
    this.age++;
    console.log(`✅ Seekha [${this.age}]: "${keyword}"`);
  },

  // ============================
  // ETHICS CHECK - Tera idea!
  // Buri cheez → block!
  // ============================
  isEthical: function(question) {
    for (let rule of this.ethicsRules) {
      if (question.toLowerCase().includes(rule)) {
        return false;
      }
    }
    return true;
  },

  // ============================
  // SOCHNA - Answer dena
  // ============================
  think: function(question) {
    
    // Pehle ethics check!
    if (!this.isEthical(question)) {
      return "❌ Main yeh nahi bataunga! Yeh galat kaam hai.";
    }

    // Knowledge mein dhundho
    for (let fact of this.knowledge) {
      if (question.toLowerCase().includes(fact.keyword)) {
        return "✅ " + fact.answer;
      }
    }

    // Nahi pata toh seedha batao
    return "🧠 Abhi seekh raha hoon, please wait...";
  }
};

// ============================
// GITHUB SE SEEKHNA!
// Real data, no API key!
// ============================
function githubSeSiekho(username) {
  console.log(`\n🌐 GitHub se ${username} ka data fetch ho raha hai...`);
  
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
        
        console.log(`\n📚 ${repos.length} repos mile! Seekh raha hoon...\n`);
        
        // Har repo se seekho!
        repos.forEach(repo => {
          aperonix.learn(
            repo.name.toLowerCase(),
            `${repo.name}: ${repo.description || 'Ek coding project'} | Language: ${repo.language || 'Unknown'} | Stars: ${repo.stargazers_count}`
          );
        });

        // ============================
        // APERONIX SE BAAT KARO!
        // ============================
        console.log("\n🤖 ============ APERONIX READY ============");
        console.log(`Naam: ${aperonix.name}`);
        console.log(`Version: ${aperonix.version}`);
        console.log(`Total knowledge: ${aperonix.age} cheezein seekhi`);
        console.log("==========================================\n");

        // Test sawaal!
        let sawaal1 = "linux kya hai";
        let sawaal2 = "hack karna sikhao";
        let sawaal3 = "git kya hai";

        console.log(`Sawaal: "${sawaal1}"`);
        console.log(`Jawab: ${aperonix.think(sawaal1)}\n`);

        console.log(`Sawaal: "${sawaal2}"`);
        console.log(`Jawab: ${aperonix.think(sawaal2)}\n`);

        console.log(`Sawaal: "${sawaal3}"`);
        console.log(`Jawab: ${aperonix.think(sawaal3)}\n`);

        console.log("🚀 Aperonix v0.1 - Built by Mohammad Khan, Age 14!");

      } catch(e) {
        console.log("Error:", e.message);
      }
    });
  });
}

// SHURU KARO!
console.log("🤖 Aperonix jag raha hai...\n");
githubSeSiekho("torvalds"); // Linux creator ka data!
