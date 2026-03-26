// ================================
// APERONIX-AI v0.7
// 1000 NEURONS — REAL BRAIN!
// Pure math — No libraries!
// By Mohammad Khan, Age 14, India
// ================================

const https = require('https');
const fs = require('fs');
const readline = require('readline');

// ============================
// MATRIX MATH — BRAIN KI NEENV
// Yahi se AI banti hai!
// ============================
class Matrix {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.data = [];
    for (let i = 0; i < rows; i++) {
      this.data[i] = [];
      for (let j = 0; j < cols; j++) {
        this.data[i][j] = (Math.random() - 0.5) * 0.1;
      }
    }
  }

  // Matrix multiply — neurons ka kaam!
  static multiply(a, b) {
    if (a.cols !== b.rows) return null;
    let result = new Matrix(a.rows, b.cols);
    for (let i = 0; i < result.rows; i++) {
      for (let j = 0; j < result.cols; j++) {
        let sum = 0;
        for (let k = 0; k < a.cols; k++) {
          sum += a.data[i][k] * b.data[k][j];
        }
        result.data[i][j] = sum;
      }
    }
    return result;
  }

  // Array to Matrix
  static fromArray(arr) {
    let m = new Matrix(arr.length, 1);
    for (let i = 0; i < arr.length; i++) {
      m.data[i][0] = arr[i];
    }
    return m;
  }

  // Matrix to Array
  toArray() {
    let arr = [];
    for (let i = 0; i < this.rows; i++) {
      arr.push(this.data[i][0]);
    }
    return arr;
  }

  // Add matrices
  add(other) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (other instanceof Matrix) {
          this.data[i][j] += other.data[i][j];
        } else {
          this.data[i][j] += other;
        }
      }
    }
    return this;
  }

  // Subtract
  static subtract(a, b) {
    let result = new Matrix(a.rows, a.cols);
    for (let i = 0; i < result.rows; i++) {
      for (let j = 0; j < result.cols; j++) {
        result.data[i][j] = a.data[i][j] - b.data[i][j];
      }
    }
    return result;
  }

  // Map function to each element
  map(func) {
    let result = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[i][j] = func(this.data[i][j]);
      }
    }
    return result;
  }

  // Transpose
  static transpose(m) {
    let result = new Matrix(m.cols, m.rows);
    for (let i = 0; i < m.rows; i++) {
      for (let j = 0; j < m.cols; j++) {
        result.data[j][i] = m.data[i][j];
      }
    }
    return result;
  }

  // Scale
  scale(n) {
    let result = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[i][j] = this.data[i][j] * n;
      }
    }
    return result;
  }

  // Element wise multiply
  static elementMultiply(a, b) {
    let result = new Matrix(a.rows, a.cols);
    for (let i = 0; i < result.rows; i++) {
      for (let j = 0; j < result.cols; j++) {
        result.data[i][j] = a.data[i][j] * b.data[i][j];
      }
    }
    return result;
  }
}

// ============================
// NEURAL NETWORK — 1000 NEURONS!
// ============================
class NeuralNetwork {
  constructor(inputSize, hiddenSize, outputSize) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize; // 1000 neurons!
    this.outputSize = outputSize;
    this.learningRate = 0.01;

    // Weight matrices — yahi "memory" hai!
    this.weightsIH = new Matrix(hiddenSize, inputSize);
    this.weightsHO = new Matrix(outputSize, hiddenSize);
    this.biasH = new Matrix(hiddenSize, 1);
    this.biasO = new Matrix(outputSize, 1);

    console.log(`🧠 Neural Network created!`);
    console.log(`   Input neurons:  ${inputSize}`);
    console.log(`   Hidden neurons: ${hiddenSize}`);
    console.log(`   Output neurons: ${outputSize}`);
    console.log(`   Total neurons:  ${inputSize + hiddenSize + outputSize}`);
    console.log(`   Total weights:  ${inputSize*hiddenSize + hiddenSize*outputSize}`);
  }

  // Activation functions
  sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
  sigmoidDerivative(x) { return x * (1 - x); }
  relu(x) { return Math.max(0, x); }
  reluDerivative(x) { return x > 0 ? 1 : 0; }

  // Forward pass — sochna!
  think(inputArray) {
    let inputs = Matrix.fromArray(inputArray);

    // Input → Hidden
    let hidden = Matrix.multiply(this.weightsIH, inputs);
    hidden.add(this.biasH);
    hidden = hidden.map(x => this.sigmoid(x));

    // Hidden → Output
    let output = Matrix.multiply(this.weightsHO, hidden);
    output.add(this.biasO);
    output = output.map(x => this.sigmoid(x));

    return output.toArray();
  }

  // Backward pass — seekhna!
  train(inputArray, targetArray) {
    let inputs = Matrix.fromArray(inputArray);

    // Forward pass
    let hidden = Matrix.multiply(this.weightsIH, inputs);
    hidden.add(this.biasH);
    hidden = hidden.map(x => this.sigmoid(x));

    let output = Matrix.multiply(this.weightsHO, hidden);
    output.add(this.biasO);
    output = output.map(x => this.sigmoid(x));

    // Calculate errors
    let targets = Matrix.fromArray(targetArray);
    let outputErrors = Matrix.subtract(targets, output);

    // Output gradients
    let outputGradients = output.map(x => this.sigmoidDerivative(x));
    outputGradients = Matrix.elementMultiply(outputGradients, outputErrors);
    outputGradients = outputGradients.scale(this.learningRate);

    // Update output weights
    let hiddenT = Matrix.transpose(hidden);
    let deltaWHO = Matrix.multiply(outputGradients, hiddenT);
    this.weightsHO.add(deltaWHO);
    this.biasO.add(outputGradients);

    // Hidden errors
    let whoT = Matrix.transpose(this.weightsHO);
    let hiddenErrors = Matrix.multiply(whoT, outputErrors);

    // Hidden gradients
    let hiddenGradients = hidden.map(x => this.sigmoidDerivative(x));
    hiddenGradients = Matrix.elementMultiply(hiddenGradients, hiddenErrors);
    hiddenGradients = hiddenGradients.scale(this.learningRate);

    // Update hidden weights
    let inputsT = Matrix.transpose(inputs);
    let deltaWIH = Matrix.multiply(hiddenGradients, inputsT);
    this.weightsIH.add(deltaWIH);
    this.biasH.add(hiddenGradients);

    return outputErrors.toArray().reduce((s, e) => s + Math.abs(e), 0);
  }

  // Save weights
  save() {
    return {
      weightsIH: this.weightsIH.data,
      weightsHO: this.weightsHO.data,
      biasH: this.biasH.data,
      biasO: this.biasO.data,
      inputSize: this.inputSize,
      hiddenSize: this.hiddenSize,
      outputSize: this.outputSize
    };
  }

  // Load weights
  load(data) {
    this.weightsIH.data = data.weightsIH;
    this.weightsHO.data = data.weightsHO;
    this.biasH.data = data.biasH;
    this.biasO.data = data.biasO;
  }
}

// ============================
// APERONIX — 1000 NEURON BRAIN!
// ============================
const aperonix = {
  name: "Aperonix",
  version: "0.7",
  creator: "Mohammad Khan",

  // 1000 NEURONS!
  nn: new NeuralNetwork(10, 1000, 8),

  knowledge: [],
  context: [],

  // ============================
  // TRAINING DATA
  // Input: 10 features
  // Output: 8 response types
  // ============================
  trainingData: [
    // Features: [greeting, coding, python, java, js, html, game, who_made, how_are, thanks]
    // Output:   [greet, code_py, code_java, code_js, code_html, code_game, who_made, how_are]

    { i: [1,0,0,0,0,0,0,0,0,0], o: [1,0,0,0,0,0,0,0] }, // hello → greet
    { i: [0,1,1,0,0,0,0,0,0,0], o: [0,1,0,0,0,0,0,0] }, // python code → python
    { i: [0,1,0,1,0,0,0,0,0,0], o: [0,0,1,0,0,0,0,0] }, // java code → java
    { i: [0,1,0,0,1,0,0,0,0,0], o: [0,0,0,1,0,0,0,0] }, // js code → js
    { i: [0,1,0,0,0,1,0,0,0,0], o: [0,0,0,0,1,0,0,0] }, // html → html
    { i: [0,1,0,0,0,0,1,0,0,0], o: [0,0,0,0,0,1,0,0] }, // game → game
    { i: [0,0,0,0,0,0,0,1,0,0], o: [0,0,0,0,0,0,1,0] }, // who made → creator
    { i: [0,0,0,0,0,0,0,0,1,0], o: [0,0,0,0,0,0,0,1] }, // how are → feeling
    { i: [0,0,0,0,0,0,0,0,0,1], o: [1,0,0,0,0,0,0,0] }, // thanks → greet back
    { i: [1,1,1,0,0,0,0,0,0,0], o: [0,1,0,0,0,0,0,0] }, // hello python → python
    { i: [1,0,0,0,0,0,0,1,0,0], o: [0,0,0,0,0,0,1,0] }, // hello who made → creator
    { i: [0,1,0,0,0,0,0,0,0,0], o: [0,1,0,0,0,0,0,0] }, // just coding → python default
  ],

  // ============================
  // TRAIN — 1000 NEURONS!
  // ============================
  train: function(epochs) {
    console.log(`\n🔥 Training 1000 neurons...`);
    console.log(`   This is real AI — pure math!\n`);

    let lastError = 999;
    for (let e = 0; e < epochs; e++) {
      let totalError = 0;
      for (let data of this.trainingData) {
        totalError += this.nn.train(data.i, data.o);
      }
      lastError = totalError;
      if (e % 100 === 0) {
        let bar = "█".repeat(Math.floor((e/epochs)*20)) + 
                  "░".repeat(20 - Math.floor((e/epochs)*20));
        process.stdout.write(`\r   [${bar}] ${Math.floor((e/epochs)*100)}% Error: ${totalError.toFixed(4)}`);
      }
    }
    console.log(`\n\n✅ Training done! Error: ${lastError.toFixed(4)}`);
    console.log(`   (0.0000 = perfect brain!) 🧠\n`);
  },

  // ============================
  // ANALYZE — 10 FEATURES
  // ============================
  analyze: function(text) {
    let t = text.toLowerCase();
    return [
      // greeting
      (t.includes("hello")||t.includes("hi")||t.includes("hey")||
       t.includes("salam")||t.includes("namaste")) ? 1 : 0,
      // coding
      (t.includes("code")||t.includes("program")||t.includes("create")||
       t.includes("write")||t.includes("build")||t.includes("banao")) ? 1 : 0,
      // python
      t.includes("python") ? 1 : 0,
      // java
      (t.includes("java") && !t.includes("javascript")) ? 1 : 0,
      // javascript
      (t.includes("javascript")||t.includes(" js ")) ? 1 : 0,
      // html
      t.includes("html") ? 1 : 0,
      // game
      t.includes("game") ? 1 : 0,
      // who made
      (t.includes("who made")||t.includes("kisne")||t.includes("banaya")||
       t.includes("creator")||t.includes("mohammad")) ? 1 : 0,
      // how are you
      (t.includes("how are")||t.includes("kaise ho")||t.includes("kaisi")) ? 1 : 0,
      // thanks
      (t.includes("thank")||t.includes("shukriya")||t.includes("thanks")) ? 1 : 0,
    ];
  },

  // ============================
  // MEMORY
  // ============================
  loadMemory: function() {
    if (fs.existsSync('memory.json')) {
      try {
        let data = JSON.parse(fs.readFileSync('memory.json'));
        this.knowledge = data.knowledge || [];
        if (data.neuralWeights) {
          this.nn.load(data.neuralWeights);
          console.log(`✅ Neural weights loaded!`);
        }
        console.log(`✅ Knowledge: ${this.knowledge.length} things!\n`);
      } catch(e) {
        console.log(`⚠️ Fresh start!\n`);
      }
    }
  },

  saveMemory: function() {
    fs.writeFileSync('memory.json', JSON.stringify({
      knowledge: this.knowledge,
      neuralWeights: this.nn.save(),
      lastUpdated: new Date().toISOString(),
      version: this.version
    }, null, 2));
    console.log(`✅ Brain saved!`);
  },

  learn: function(keyword, answer, language) {
    if (!this.knowledge.find(k => k.keyword === keyword)) {
      this.knowledge.push({ keyword, answer, language: language || 'Unknown' });
    }
  },

  isEthical: function(text) {
    const bad = ["hack","virus","cheat","harm","crack",
                 "steal","exploit","malware","illegal","ddos"];
    return !bad.some(w => text.toLowerCase().includes(w));
  },

  getRandom: function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // ============================
  // RESPONSES
  // ============================
  responses: {
    greet: [
      "Hey there! I'm Aperonix! 😊 How can I help you today?",
      "Hello! Aperonix here — ask me anything! 🌟",
      "Hi! Great to see you! What would you like to know? ✨"
    ],
    python: `Here's Python for you! 🐍\n\nprint("Hello from Aperonix!")\nname = input("Your name: ")\nprint(f"Hello {name}!")\n\nRun: python hello.py`,
    java: `Here's Java! ☕\n\npublic class Hello {\n  public static void main(String[] args) {\n    System.out.println("Hello from Aperonix!");\n  }\n}\n\nSave as Hello.java`,
    javascript: `Here's JavaScript! ✨\n\nconsole.log("Hello from Aperonix!");\n\nfunction greet(name) {\n  return "Hello " + name + "!";\n}\nconsole.log(greet("Mohammad"));`,
    html: `Here's HTML! 🌐\n\n<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello from Aperonix!</h1>\n  <p>Built by Mohammad Khan, Age 14!</p>\n  <button onclick="alert('Hi!')">Click!</button>\n</body>\n</html>`,
    game: `A game — like your creator builds! 🎮\n\nconst secret = Math.floor(Math.random()*10)+1;\nconst rl = require('readline').createInterface({input:process.stdin,output:process.stdout});\nconsole.log("Guess 1-10!");\nfunction guess(){rl.question("Guess: ",(a)=>{\n  let n=parseInt(a);\n  if(n===secret){console.log("Won! 🎉");rl.close();}\n  else{console.log(n<secret?"Low!":"High!");guess();}\n});}\nguess();`,
    creator: `I was built by Mohammad Khan — a 14-year-old genius from India! 🇮🇳✨\nZero paid tools, zero GPU, pure GitHub data!\nHe built me with 1000 real neurons — from scratch! 💪`,
    howAre: `I'm doing amazing! 😊\nMy 1000 neurons just finished training!\nHow are you doing today? 🌟`
  },

  // ============================
  // MAIN THINK — 1000 NEURONS!
  // ============================
  think: function(rawInput) {
    this.context.push(rawInput);
    if (this.context.length > 5) this.context.shift();

    let lower = rawInput.toLowerCase();

    // Ethics!
    if (!this.isEthical(lower)) {
      return "I can't help with that. Let's talk positively! 😊";
    }

    // Neural network decide karega!
    let features = this.analyze(rawInput);
    let output = this.nn.think(features);

    // Highest output = best response
    let maxIndex = output.indexOf(Math.max(...output));
    let confidence = Math.max(...output);

    console.log(`   [Neural: confidence=${(confidence*100).toFixed(1)}%]`);

    // Response based on neural network output
    if (maxIndex === 0 && confidence > 0.4) return this.getRandom(this.responses.greet);
    if (maxIndex === 1 && confidence > 0.4) return this.responses.python;
    if (maxIndex === 2 && confidence > 0.4) return this.responses.java;
    if (maxIndex === 3 && confidence > 0.4) return this.responses.javascript;
    if (maxIndex === 4 && confidence > 0.4) return this.responses.html;
    if (maxIndex === 5 && confidence > 0.4) return this.responses.game;
    if (maxIndex === 6 && confidence > 0.4) return this.responses.creator;
    if (maxIndex === 7 && confidence > 0.4) return this.responses.howAre;

    // Knowledge search
    for (let fact of this.knowledge) {
      if (lower.includes(fact.keyword.toLowerCase())) {
        return `Great question! 🌟\n\n${fact.answer}`;
      }
    }

    // Thanks
    if (lower.includes("thank")||lower.includes("shukriya")) {
      return "You're welcome! 😊 Ask me anything! ✨";
    }

    return this.getRandom([
      "I'm still learning! Ask me: 'create python code' or 'make a game'! 😊",
      "Try asking about Java, Python, JavaScript, or HTML! 🌱",
      "I grow smarter every 6 hours from GitHub! 💪"
    ]);
  }
};

// ============================
// GITHUB LEARNING
// ============================
const developers = [
  "torvalds","gvanrossum","brendaneich",
  "DHH","yyx990803","tj",
  "sindresorhus","addyosmani",
  "antirez","jashkenas"
];

function fetchRepos(username) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/users/${username}/repos?per_page=10&sort=stars`,
      headers: { 'User-Agent': 'Aperonix-AI' }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const repos = JSON.parse(data);
          if (Array.isArray(repos)) {
            repos.forEach(r => {
              if (r.name) {
                aperonix.learn(
                  r.name.toLowerCase(),
                  `${r.name} is a ${r.language||'coding'} project by ${username}. ${r.description||''} Stars: ${r.stargazers_count}`,
                  r.language
                );
              }
            });
            console.log(`✅ Learned from ${username}`);
          }
        } catch(e) { console.log(`⚠️ Skipped ${username}`); }
        resolve();
      });
    }).on('error', () => resolve());
  });
}

// ============================
// CHAT
// ============================
async function startChat() {
  console.log("\n" + "=".repeat(55));
  console.log("   🤖 APERONIX AI v0.7 — 1000 NEURONS!");
  console.log("   Built by Mohammad Khan, Age 14 🇮🇳");
  console.log("   Real neural network — Pure math!");
  console.log("=".repeat(55));

  aperonix.train(500);

  console.log("Aperonix: Hey! I'm Aperonix — 1000 real neurons! 🧠✨");
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
        aperonix.saveMemory();
        console.log("\nAperonix: Goodbye! Brain saved! 😊✨\n");
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
    console.log("📚 GitHub Actions — Training + Learning!\n");
    aperonix.train(1000);
    for (let dev of developers) {
      await fetchRepos(dev);
      await new Promise(r => setTimeout(r, 1000));
    }
    aperonix.saveMemory();
    console.log(`\n✅ Knowledge: ${aperonix.knowledge.length} things!`);
    console.log("🚀 Aperonix v0.7 — 1000 Neurons!");
    console.log("   Mohammad Khan, Age 14 🇮🇳");
  } else {
    await startChat();
  }
}

main();
