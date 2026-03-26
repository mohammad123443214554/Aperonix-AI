// ================================
// APERONIX-AI v0.6
// REAL NEURAL NETWORK — FROM ZERO!
// Pure math — No libraries!
// By Mohammad Khan, Age 14, India
// ================================

const https = require('https');
const fs = require('fs');
const readline = require('readline');

// ============================
// ASLI NEURON — PURE MATH!
// Jaise tera dimaag kaam karta hai
// ============================
class Neuron {
  constructor() {
    // Blank brain — random weights
    // Jaise naya bachha paida hua!
    this.weights = [
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ];
    this.bias = Math.random() - 0.5;
    this.learningRate = 0.1;
  }

  // Activation — neuron fire karega ya nahi?
  activate(x) {
    // Sigmoid function — 0 se 1 ke beech
    return 1 / (1 + Math.exp(-x));
  }

  // Sochna — input se output nikalna
  think(inputs) {
    let sum = this.bias;
    for (let i = 0; i < inputs.length; i++) {
      sum += inputs[i] * this.weights[i];
    }
    return this.activate(sum);
  }

  // Seekhna — galti se improve karna!
  learn(inputs, correctAnswer) {
    let output = this.think(inputs);
    let error = correctAnswer - output;
    
    // Weights adjust karo — yahi "seekhna" hai!
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] += this.learningRate * error * inputs[i];
    }
    this.bias += this.learningRate * error;
    
    return error;
  }
}

// ============================
// NEURAL LAYER — NEURONS KA GROUP
// ============================
class NeuralLayer {
  constructor(neuronCount, inputCount) {
    this.neurons = [];
    for (let i = 0; i < neuronCount; i++) {
      this.neurons.push(new Neuron());
    }
  }

  think(inputs) {
    return this.neurons.map(n => n.think(inputs));
  }

  learn(inputs, targets) {
    let totalError = 0;
    for (let i = 0; i < this.neurons.length; i++) {
      let error = this.neurons[i].learn(inputs, targets[i] || 0);
      totalError += Math.abs(error);
    }
    return totalError;
  }
}

// ============================
// APERONIX KA POORA DIMAAG
// ============================
const aperonix = {
  name: "Aperonix",
  version: "0.6",
  creator: "Mohammad Khan",

  // Real Neural Network!
  brain: {
    layer1: new NeuralLayer(8, 3),  // 8 neurons, 3 inputs
    layer2: new NeuralLayer(4, 8),  // 4 neurons
    layer3: new NeuralLayer(2, 4),  // 2 output neurons
  },

  // Training data — GitHub se aaya!
  trainingData: [
    // [inputs], [expected outputs]
    // Input: [is_coding, is_question, is_greeting]
    // Output: [should_code, should_greet]
    { input: [1, 1, 0], output: [1, 0] }, // coding question → code do
    { input: [0, 0, 1], output: [0, 1] }, // greeting → greet karo
    { input: [1, 0, 0], output: [1, 0] }, // coding → code do
    { input: [0, 1, 0], output: [0, 0] }, // question only → default
    { input: [0, 0, 0], output: [0, 0] }, // nothing → default
    { input: [1, 1, 1], output: [1, 1] }, // everything → both
  ],

  // Knowledge from GitHub
  knowledge: [],
  context: [],

  // ============================
  // TRAIN THE BRAIN!
  // ============================
  train: function(epochs) {
    console.log(`\n🧠 Training Aperonix brain...`);
    let lastError = 0;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalError = 0;

      for (let data of this.trainingData) {
        // Forward pass — sochna
        let out1 = this.brain.layer1.think(data.input);
        let out2 = this.brain.layer2.think(out1);

        // Backward pass — seekhna!
        let error2 = this.brain.layer3.learn(out2, data.output);
        let error1 = this.brain.layer2.learn(out1, out2);
        let error0 = this.brain.layer1.learn(data.input, out1);

        totalError += error2;
      }

      lastError = totalError;

      // Progress dikhao
      if (epoch % 200 === 0) {
        console.log(`   Epoch ${epoch}: Error = ${totalError.toFixed(4)}`);
      }
    }

    console.log(`✅ Training complete! Final error: ${lastError.toFixed(4)}`);
    console.log(`   (Error kam = Aperonix zyada smart!) 🧠\n`);
  },

  // ============================
  // ANALYZE INPUT
  // ============================
  analyzeInput: function(text) {
    let lower = text.toLowerCase();
    
    let isCoding = 0;
    let isQuestion = 0;
    let isGreeting = 0;

    // Coding words
    let codingWords = ["code", "java", "python", "javascript", 
                       "program", "function", "game", "create", 
                       "build", "write", "html", "css"];
    for (let w of codingWords) {
      if (lower.includes(w)) { isCoding = 1; break; }
    }

    // Question words
    let questionWords = ["what", "how", "why", "when", "kya", 
                         "kaise", "kyun", "batao", "explain"];
    for (let w of questionWords) {
      if (lower.includes(w)) { isQuestion = 1; break; }
    }

    // Greeting words
    let greetWords = ["hello", "hi", "hey", "salam", 
                      "namaste", "hii", "good morning"];
    for (let w of greetWords) {
      if (lower.includes(w)) { isGreeting = 1; break; }
    }

    return [isCoding, isQuestion, isGreeting];
  },

  // ============================
  // MEMORY
  // ============================
  loadMemory: function() {
    if (fs.existsSync('memory.json')) {
      let data = JSON.parse(fs.readFileSync('memory.json'));
      this.knowledge = data.knowledge || [];
      console.log(`✅ Memory: ${this.knowledge.length} things loaded!\n`);
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
  isEthical: function(text) {
    const bad = ["hack", "virus", "cheat", "harm", "crack",
                 "steal", "exploit", "malware", "illegal"];
    for (let w of bad) {
      if (text.toLowerCase().includes(w)) return false;
    }
    return true;
  },

  getRandom: function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // ============================
  // GENERATE CODE
  // ============================
  generateCode: function(text) {
    let lower = text.toLowerCase();

    if (lower.includes("java")) {
      return `Here's Java code for you! ☕\n
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello from Aperonix!");
        System.out.println("Built by Mohammad Khan, Age 14!");
    }
}`;
    }
    if (lower.includes("python")) {
      return `Here's Python code! 🐍\n
print("Hello from Aperonix!")
print("Built by Mohammad Khan, Age 14!")

name = input("Your name: ")
print(f"Hello {name}! Nice to meet you!")`;
    }
    if (lower.includes("javascript") || lower.includes("js")) {
      return `Here's JavaScript! ✨\n
console.log("Hello from Aperonix!");
console.log("Built by Mohammad Khan, Age 14!");

function greet(name) {
  return \`Hello \${name}! Welcome!\`;
}
console.log(greet("Mohammad"));`;
    }
    if (lower.includes("html")) {
      return `Here's HTML for you! 🌐\n
<!DOCTYPE html>
<html>
<head>
    <title>My Aperonix Page</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>Built with Aperonix AI by Mohammad Khan!</p>
    <button onclick="alert('Aperonix says hi!')">
        Click Me!
    </button>
</body>
</html>`;
    }
    if (lower.includes("game")) {
      return `A game — just like your creator builds! 🎮\n
// Number Guessing Game
const secret = Math.floor(Math.random() * 10) + 1;
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin, 
  output: process.stdout
});

console.log("Guess 1-10!");

function guess() {
  rl.question("Your guess: ", (ans) => {
    let n = parseInt(ans);
    if (n === secret) { 
      console.log("You won! 🎉"); 
      rl.close(); 
    }
    else if (n < secret) { 
      console.log("Too low!"); 
      guess(); 
    }
    else { 
      console.log("Too high!"); 
      guess(); 
    }
  });
}
guess();`;
    }
    return null;
  },

  // ============================
  // MAIN THINK — NEURAL NETWORK!
  // ============================
  think: function(rawInput) {
    this.context.push(rawInput);
    if (this.context.length > 5) this.context.shift();

    let lower = rawInput.toLowerCase();

    // Ethics first!
    if (!this.isEthical(lower)) {
      return "I'm sorry, I can't help with that. Let's talk about something positive! 😊";
    }

    // Neural network analyze karo!
    let inputs = this.analyzeInput(rawInput);
    let out1 = this.brain.layer1.think(inputs);
    let out2 = this.brain.layer2.think(out1);
    let output = this.brain.layer3.think(out2);

    // output[0] = should code, output[1] = should greet

    // Greeting
    if (output[1] > 0.6 || lower.includes("hello") || 
        lower.includes("hi") || lower.includes("salam")) {
      return this.getRandom([
        "Hey there! I'm Aperonix! 😊 How can I help you today?",
        "Hello! Aperonix here — ask me anything! 🌟",
        "Hi! Great to see you! What would you like to know? ✨"
      ]);
    }

    // Who made you
    if (lower.includes("who made") || lower.includes("kisne banaya") ||
        lower.includes("creator") || lower.includes("mohammad") ||
        lower.includes("banane wala") || lower.includes("banaya")) {
      return `I was built by Mohammad Khan — a 14-year-old genius from India! 🇮🇳✨\nZero paid tools, zero GPU, pure GitHub data!\nPretty legendary, right? 😊`;
    }

    // Who are you
    if (lower.includes("who are you") || lower.includes("kon ho") ||
        lower.includes("kaun ho") || lower.includes("your name") ||
        lower.includes("naam")) {
      return `I'm Aperonix! 🤖✨\nA female AI — built from scratch using GitHub data!\nI have a real neural network inside me!\nBuilt by Mohammad Khan, Age 14 🇮🇳`;
    }

    // How are you
    if (lower.includes("how are you") || lower.includes("kaise ho") ||
        lower.includes("kaisi ho")) {
      return `I'm doing great! 😊 My neural network just finished training!\nHow are you doing today? 🌟`;
    }

    // Code generation — neural network said yes!
    if (output[0] > 0.5) {
      let code = this.generateCode(rawInput);
      if (code) return code;
    }

    // Direct code request
    let code = this.generateCode(rawInput);
    if (code) return code;

    // Knowledge search
    for (let fact of this.knowledge) {
      if (lower.includes(fact.keyword.toLowerCase())) {
        return `Great question! 🌟\n\n${fact.answer}`;
      }
    }

    // Thank you
    if (lower.includes("thank") || lower.includes("shukriya")) {
      return "You're welcome! 😊 Ask me anything anytime! ✨";
    }

    return this.getRandom([
      "I'm still learning! Ask me about coding — Java, Python, JavaScript, HTML! 😊",
      "Hmm, try asking: 'create python code' or 'what is java' 🌱",
      "I grow smarter every 6 hours from GitHub! Ask me about coding! 💪"
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
  console.log("   🤖 APERONIX AI v0.6 — Real Neural Network!");
  console.log("   Built by Mohammad Khan, Age 14 🇮🇳");
  console.log("   Real neurons — Pure math — No libraries!");
  console.log("=".repeat(55));

  // Train the brain first!
  aperonix.train(500);

  console.log("Aperonix: Hey! I'm Aperonix — now with a real brain! 🧠✨");
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
        console.log("\nAperonix: Goodbye! 😊✨\n");
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
    aperonix.train(1000);
    for (let dev of topDevelopers) {
      await fetchRepos(dev);
      await new Promise(r => setTimeout(r, 1000));
    }
    aperonix.saveMemory();
    console.log(`\n✅ Total: ${aperonix.knowledge.length} things learned!`);
    console.log("🚀 Aperonix v0.6 — Real Neural Network!");
    console.log("   Built by Mohammad Khan, Age 14 🇮🇳");
  } else {
    await startChat();
  }
}

main();
