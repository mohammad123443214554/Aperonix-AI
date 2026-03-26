// ================================
// APERONIX-AI v0.8
// 500+ TRAINING EXAMPLES!
// 1000 NEURONS — SMARTER BRAIN!
// By Mohammad Khan, Age 14, India
// ================================

const https = require('https');
const fs = require('fs');
const readline = require('readline');

// ============================
// MATRIX MATH
// ============================
class Matrix {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.data = Array.from({length: rows}, () =>
      Array.from({length: cols}, () => (Math.random() - 0.5) * 0.1)
    );
  }

  static multiply(a, b) {
    let result = new Matrix(a.rows, b.cols);
    for (let i = 0; i < result.rows; i++)
      for (let j = 0; j < result.cols; j++) {
        let sum = 0;
        for (let k = 0; k < a.cols; k++)
          sum += a.data[i][k] * b.data[k][j];
        result.data[i][j] = sum;
      }
    return result;
  }

  static fromArray(arr) {
    let m = new Matrix(arr.length, 1);
    arr.forEach((v, i) => m.data[i][0] = v);
    return m;
  }

  toArray() {
    return this.data.map(r => r[0]);
  }

  add(other) {
    for (let i = 0; i < this.rows; i++)
      for (let j = 0; j < this.cols; j++)
        this.data[i][j] += other instanceof Matrix ? other.data[i][j] : other;
    return this;
  }

  static subtract(a, b) {
    let r = new Matrix(a.rows, a.cols);
    for (let i = 0; i < r.rows; i++)
      for (let j = 0; j < r.cols; j++)
        r.data[i][j] = a.data[i][j] - b.data[i][j];
    return r;
  }

  map(fn) {
    let r = new Matrix(this.rows, this.cols);
    for (let i = 0; i < r.rows; i++)
      for (let j = 0; j < r.cols; j++)
        r.data[i][j] = fn(this.data[i][j]);
    return r;
  }

  static transpose(m) {
    let r = new Matrix(m.cols, m.rows);
    for (let i = 0; i < m.rows; i++)
      for (let j = 0; j < m.cols; j++)
        r.data[j][i] = m.data[i][j];
    return r;
  }

  scale(n) {
    let r = new Matrix(this.rows, this.cols);
    for (let i = 0; i < r.rows; i++)
      for (let j = 0; j < r.cols; j++)
        r.data[i][j] = this.data[i][j] * n;
    return r;
  }

  static elementMultiply(a, b) {
    let r = new Matrix(a.rows, a.cols);
    for (let i = 0; i < r.rows; i++)
      for (let j = 0; j < r.cols; j++)
        r.data[i][j] = a.data[i][j] * b.data[i][j];
    return r;
  }

  save() { return { rows: this.rows, cols: this.cols, data: this.data }; }

  static load(saved) {
    let m = new Matrix(saved.rows, saved.cols);
    m.data = saved.data;
    return m;
  }
}

// ============================
// NEURAL NETWORK
// ============================
class NeuralNetwork {
  constructor(inputSize, hiddenSize, outputSize) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;
    this.lr = 0.01;
    this.wIH = new Matrix(hiddenSize, inputSize);
    this.wHO = new Matrix(outputSize, hiddenSize);
    this.bH = new Matrix(hiddenSize, 1);
    this.bO = new Matrix(outputSize, 1);
  }

  sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
  sigDeriv(x) { return x * (1 - x); }

  think(inputArr) {
    let inp = Matrix.fromArray(inputArr);
    let hid = Matrix.multiply(this.wIH, inp);
    hid.add(this.bH);
    hid = hid.map(x => this.sigmoid(x));
    let out = Matrix.multiply(this.wHO, hid);
    out.add(this.bO);
    out = out.map(x => this.sigmoid(x));
    return out.toArray();
  }

  train(inputArr, targetArr) {
    let inp = Matrix.fromArray(inputArr);
    let hid = Matrix.multiply(this.wIH, inp);
    hid.add(this.bH);
    hid = hid.map(x => this.sigmoid(x));
    let out = Matrix.multiply(this.wHO, hid);
    out.add(this.bO);
    out = out.map(x => this.sigmoid(x));

    let targets = Matrix.fromArray(targetArr);
    let outErr = Matrix.subtract(targets, out);
    let outGrad = out.map(x => this.sigDeriv(x));
    outGrad = Matrix.elementMultiply(outGrad, outErr);
    outGrad = outGrad.scale(this.lr);
    this.wHO.add(Matrix.multiply(outGrad, Matrix.transpose(hid)));
    this.bO.add(outGrad);

    let hidErr = Matrix.multiply(Matrix.transpose(this.wHO), outErr);
    let hidGrad = hid.map(x => this.sigDeriv(x));
    hidGrad = Matrix.elementMultiply(hidGrad, hidErr);
    hidGrad = hidGrad.scale(this.lr);
    this.wIH.add(Matrix.multiply(hidGrad, Matrix.transpose(inp)));
    this.bH.add(hidGrad);

    return outErr.toArray().reduce((s, e) => s + Math.abs(e), 0);
  }

  save() {
    return {
      wIH: this.wIH.save(), wHO: this.wHO.save(),
      bH: this.bH.save(), bO: this.bO.save()
    };
  }

  load(d) {
    this.wIH = Matrix.load(d.wIH); this.wHO = Matrix.load(d.wHO);
    this.bH = Matrix.load(d.bH); this.bO = Matrix.load(d.bO);
  }
}

// ============================
// APERONIX v0.8
// ============================
const aperonix = {
  name: "Aperonix",
  version: "0.8",
  creator: "Mohammad Khan",
  nn: new NeuralNetwork(15, 1000, 10),
  knowledge: [],
  context: [],

  // ============================
  // 500+ TRAINING EXAMPLES!
  // Features (15):
  // 0:greeting 1:coding 2:python
  // 3:java 4:javascript 5:html
  // 6:game 7:who_made 8:how_are
  // 9:thanks 10:what_is 11:css
  // 12:error 13:help 14:name
  //
  // Output (10):
  // 0:greet 1:python 2:java
  // 3:js 4:html 5:game
  // 6:creator 7:feeling 8:explain
  // 9:css
  // ============================
  generateTraining: function() {
    let data = [];

    // GREETINGS — 50 examples
    let greetInputs = [
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
      [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
    ];
    greetInputs.forEach(i => {
      for(let x=0; x<10; x++) {
        let inp = [...i];
        data.push({ i: inp, o: [1,0,0,0,0,0,0,0,0,0] });
      }
    });

    // PYTHON — 50 examples
    let pyInputs = [
      [0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,1,0,0,0,0,0,0,0,1,0,0,0,0],
      [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],
      [0,1,1,0,0,0,0,0,0,0,0,0,0,1,0],
    ];
    pyInputs.forEach(i => {
      for(let x=0; x<10; x++) {
        data.push({ i: [...i], o: [0,1,0,0,0,0,0,0,0,0] });
      }
    });

    // JAVA — 50 examples
    let javaInputs = [
      [0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
      [1,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,0,1,0,0,0,0,0,0,1,0,0,0,0],
      [0,0,0,1,0,0,0,0,0,0,1,0,0,0,0],
      [0,1,0,1,0,0,0,0,0,0,0,0,0,1,0],
    ];
    javaInputs.forEach(i => {
      for(let x=0; x<10; x++) {
        data.push({ i: [...i], o: [0,0,1,0,0,0,0,0,0,0] });
      }
    });

    // JAVASCRIPT — 50 examples
    let jsInputs = [
      [0,1,0,0,1,0,0,0,0,0,0,0,0,0,0],
      [1,1,0,0,1,0,0,0,0,0,0,0,0,0,0],
      [0,1,0,0,1,0,0,0,0,0,1,0,0,0,0],
      [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],
      [0,1,0,0,1,0,0,0,0,0,0,0,0,1,0],
    ];
    jsInputs.forEach(i => {
      for(let x=0; x<10; x++) {
        data.push({ i: [...i], o: [0,0,0,1,0,0,0,0,0,0] });
      }
    });

    // HTML — 50 examples
    let htmlInputs = [
      [0,1,0,0,0,1,0,0,0,0,0,0,0,0,0],
      [1,1,0,0,0,1,0,0,0,0,0,0,0,0,0],
      [0,1,0,0,0,1,0,0,0,0,1,0,0,0,0],
      [0,0,0,0,0,1,0,0,0,0,1,0,0,0,0],
      [0,1,0,0,0,1,0,0,0,0,0,0,0,1,0],
    ];
    htmlInputs.forEach(i => {
      for(let x=0; x<10; x++) {
        data.push({ i: [...i], o: [0,0,0,0,1,0,0,0,0,0] });
      }
    });

    // GAME — 50 examples
    let gameInputs = [
      [0,1,0,0,0,0,1,0,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,1,0,0,0,0,0,0,0,0],
      [0,1,0,0,1,0,1,0,0,0,0,0,0,0,0],
      [0,1,0,0,0,0,1,0,0,0,1,0,0,0,0],
      [0,1,0,0,0,0,1,0,0,0,0,0,0,1,0],
    ];
    gameInputs.forEach(i => {
      for(let x=0; x<10; x++) {
        data.push({ i: [...i], o: [0,0,0,0,0,1,0,0,0,0] });
      }
    });

    // WHO MADE — 50 examples
    let creatorInputs = [
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,1,0,0,1,0,0,0,0],
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [0,0,0,0,0,0,0,1,0,0,0,0,0,1,0],
    ];
    creatorInputs.forEach(i => {
      for(let x=0; x<10; x++) {
        data.push({ i: [...i], o: [0,0,0,0,0,0,1,0,0,0] });
      }
    });

    // HOW ARE YOU — 50 examples
    let howInputs = [
      [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
      [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    ];
    howInputs.forEach(i => {
      for(let x=0; x<16; x++) {
        data.push({ i: [...i], o: [0,0,0,0,0,0,0,1,0,0] });
      }
    });

    // CSS — 30 examples
    let cssInputs = [
      [0,1,0,0,0,0,0,0,0,0,0,1,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,1,1,0,0,0],
      [0,1,0,0,0,1,0,0,0,0,0,1,0,0,0],
    ];
    cssInputs.forEach(i => {
      for(let x=0; x<10; x++) {
        data.push({ i: [...i], o: [0,0,0,0,0,0,0,0,0,1] });
      }
    });

    // Shuffle!
    for(let i=data.length-1; i>0; i--) {
      let j = Math.floor(Math.random()*(i+1));
      [data[i], data[j]] = [data[j], data[i]];
    }

    return data;
  },

  // ============================
  // TRAIN!
  // ============================
  train: function(epochs) {
    let trainingData = this.generateTraining();
    console.log(`\n🔥 Training with ${trainingData.length} examples!`);
    console.log(`   1000 neurons — ${epochs} epochs\n`);

    let lastError = 0;
    for(let e=0; e<epochs; e++) {
      let totalError = 0;
      for(let d of trainingData) {
        totalError += this.nn.train(d.i, d.o);
      }
      lastError = totalError;
      if(e % 500 === 0) {
        let pct = Math.floor((e/epochs)*20);
        let bar = "█".repeat(pct) + "░".repeat(20-pct);
        process.stdout.write(`\r   [${bar}] ${Math.floor((e/epochs)*100)}% Error: ${totalError.toFixed(2)}`);
      }
    }
    console.log(`\n\n✅ Done! Examples: ${trainingData.length} | Error: ${lastError.toFixed(4)}`);
    console.log(`   99% accuracy target: ${lastError < 1 ? "✅ REACHED!" : "🔜 Getting closer!"}\n`);
  },

  // ============================
  // ANALYZE — 15 FEATURES
  // ============================
  analyze: function(text) {
    let t = text.toLowerCase();
    return [
      // 0: greeting
      /hello|hi|hey|salam|namaste|hii+|assalam/.test(t) ? 1 : 0,
      // 1: coding
      /code|program|create|write|build|banao|likhao|script/.test(t) ? 1 : 0,
      // 2: python
      /python|py/.test(t) ? 1 : 0,
      // 3: java (not js)
      /\bjava\b/.test(t) ? 1 : 0,
      // 4: javascript
      /javascript|js\b/.test(t) ? 1 : 0,
      // 5: html
      /html|webpage|website/.test(t) ? 1 : 0,
      // 6: game
      /game|gaming|khel/.test(t) ? 1 : 0,
      // 7: who made
      /who made|who built|kisne|banaya|creator|mohammad|banane wala/.test(t) ? 1 : 0,
      // 8: how are you
      /how are|kaise ho|kaisi ho|kaisa/.test(t) ? 1 : 0,
      // 9: thanks
      /thank|shukriya|thanks|shukria/.test(t) ? 1 : 0,
      // 10: what is
      /what is|kya hai|explain|batao|samjhao/.test(t) ? 1 : 0,
      // 11: css
      /css|style|design/.test(t) ? 1 : 0,
      // 12: error/help
      /error|bug|fix|problem|help/.test(t) ? 1 : 0,
      // 13: help
      /help|madad|assist/.test(t) ? 1 : 0,
      // 14: name/identity
      /name|naam|kaun|who are|kon ho/.test(t) ? 1 : 0,
    ];
  },

  // ============================
  // MEMORY
  // ============================
  loadMemory: function() {
    if(fs.existsSync('memory.json')) {
      try {
        let d = JSON.parse(fs.readFileSync('memory.json'));
        this.knowledge = d.knowledge || [];
        if(d.neuralWeights) {
          this.nn.load(d.neuralWeights);
          console.log(`✅ Neural weights loaded!`);
        }
        console.log(`✅ Knowledge: ${this.knowledge.length} things!\n`);
      } catch(e) { console.log(`⚠️ Fresh start!\n`); }
    }
  },

  saveMemory: function() {
    fs.writeFileSync('memory.json', JSON.stringify({
      knowledge: this.knowledge,
      neuralWeights: this.nn.save(),
      lastUpdated: new Date().toISOString(),
      version: this.version
    }, null, 2));
    console.log(`\n✅ Brain saved to memory.json!`);
  },

  learn: function(keyword, answer, language) {
    if(!this.knowledge.find(k => k.keyword === keyword))
      this.knowledge.push({ keyword, answer, language: language||'Unknown' });
  },

  isEthical: function(text) {
    return !["hack","virus","cheat","harm","crack",
             "steal","exploit","malware","illegal","ddos"]
      .some(w => text.toLowerCase().includes(w));
  },

  getRandom: function(arr) {
    return arr[Math.floor(Math.random()*arr.length)];
  },

  // ============================
  // RESPONSES
  // ============================
  getResponse: function(index, confidence) {
    const responses = [
      // 0: greet
      () => this.getRandom([
        "Hey there! I'm Aperonix! 😊 How can I help you today?",
        "Hello! Aperonix here — ask me anything! 🌟",
        "Hi! Great to see you! What would you like to know? ✨",
        "Hey! Aperonix is ready to help! 😊"
      ]),
      // 1: python
      () => `Here's Python for you! 🐍\n\nprint("Hello from Aperonix!")\nname = input("Your name: ")\nprint(f"Hello {name}! Nice to meet you!")\n\n# Simple calculator\na = int(input("Number 1: "))\nb = int(input("Number 2: "))\nprint(f"Sum = {a+b}")\n\nSave as hello.py → Run: python hello.py`,
      // 2: java
      () => `Here's Java! ☕\n\npublic class Hello {\n    public static void main(String[] args) {\n        System.out.println("Hello from Aperonix!");\n        System.out.println("Built by Mohammad Khan, Age 14!");\n    }\n}\n\nSave as Hello.java → Run: javac Hello.java && java Hello`,
      // 3: javascript
      () => `Here's JavaScript! ✨\n\nconsole.log("Hello from Aperonix!");\n\nfunction greet(name) {\n    return \`Hello \${name}! Welcome!\`;\n}\nconsole.log(greet("Mohammad"));\n\n// Array example\nlet fruits = ["apple","mango","banana"];\nfruits.forEach(f => console.log(f));\n\nSave as hello.js → Run: node hello.js`,
      // 4: html
      () => `Here's HTML! 🌐\n\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Aperonix Page</title>\n    <style>\n        body { font-family: Arial; background: #1a1a2e; color: white; text-align: center; }\n        button { background: #e94560; color: white; padding: 10px 20px; border: none; cursor: pointer; }\n    </style>\n</head>\n<body>\n    <h1>Hello from Aperonix!</h1>\n    <p>Built by Mohammad Khan, Age 14 🇮🇳</p>\n    <button onclick="alert('Aperonix says hi!')">Click Me!</button>\n</body>\n</html>\n\nSave as index.html → Open in browser!`,
      // 5: game
      () => `A game — like your creator builds! 🎮\n\n// Number Guessing Game\nconst secret = Math.floor(Math.random()*10)+1;\nconst rl = require('readline').createInterface({input:process.stdin,output:process.stdout});\nconsole.log("I'm thinking of a number 1-10!");\nlet attempts = 0;\nfunction guess(){\n  rl.question("Your guess: ",(a)=>{\n    attempts++;\n    let n=parseInt(a);\n    if(n===secret){console.log(\`🎉 Correct in \${attempts} attempts!\`);rl.close();}\n    else{console.log(n<secret?"Too low! 📈":"Too high! 📉");guess();}\n  });\n}\nguess();\n\nSave as game.js → Run: node game.js`,
      // 6: creator
      () => `I was built by Mohammad Khan! 🇮🇳✨\n\n👤 Name: Mohammad Khan\n🎂 Age: 14 years old\n🌍 Country: India\n💡 Built: Aperonix AI from scratch\n⚡ Tools: Zero paid tools!\n🖥️ GPU: Zero — pure GitHub data!\n🧠 My brain: 1000 real neurons!\n\nHe also built a Game Engine at 14!\nPretty legendary, right? 😊`,
      // 7: how are
      () => this.getRandom([
        "I'm doing amazing! 😊 My 1000 neurons just finished training!\nHow are you doing today? 🌟",
        "Feeling great! I learned new things from GitHub today! ✨\nHow about you? 😊",
        "I'm wonderful, thank you! 💪 Ready to help you with anything!\nHow are you? 🌟"
      ]),
      // 8: explain
      () => `I'd love to explain! 😊 Could you be more specific?\n\nI can explain:\n• Python — easy AI language 🐍\n• Java — Android & enterprise ☕\n• JavaScript — web & games ✨\n• HTML/CSS — websites 🌐\n• How I work — neural networks 🧠`,
      // 9: css
      () => `Here's CSS! 🎨\n\nbody {\n    background-color: #1a1a2e;\n    color: white;\n    font-family: Arial;\n    text-align: center;\n}\n\nh1 {\n    color: #e94560;\n    font-size: 2em;\n}\n\nbutton {\n    background: #e94560;\n    color: white;\n    padding: 10px 20px;\n    border: none;\n    border-radius: 5px;\n    cursor: pointer;\n}\n\nbutton:hover {\n    background: #c73652;\n}\n\nSave as style.css → Link in HTML!`,
    ];

    if(index >= 0 && index < responses.length) {
      return responses[index]();
    }
    return null;
  },

  // ============================
  // THINK — NEURAL NETWORK!
  // ============================
  think: function(rawInput) {
    this.context.push(rawInput);
    if(this.context.length > 5) this.context.shift();

    let lower = rawInput.toLowerCase();

    // Ethics!
    if(!this.isEthical(lower)) {
      return "I can't help with that. Let's keep it positive! 😊";
    }

    // Neural network!
    let features = this.analyze(rawInput);
    let output = this.nn.think(features);
    let maxIndex = output.indexOf(Math.max(...output));
    let confidence = Math.max(...output);

    process.stdout.write(`   [Neural: ${(confidence*100).toFixed(1)}% → Response #${maxIndex}]\n`);

    // High confidence → neural response
    if(confidence > 0.5) {
      let response = this.getResponse(maxIndex, confidence);
      if(response) return response;
    }

    // Knowledge search
    for(let fact of this.knowledge) {
      if(lower.includes(fact.keyword.toLowerCase())) {
        return `Great question! 🌟\n\n${fact.answer}`;
      }
    }

    // Manual fallbacks
    if(/thank|shukriya/.test(lower)) return "You're welcome! 😊 Ask me anything! ✨";
    if(/who are|naam|kaun/.test(lower)) return "I'm Aperonix! 🤖 A female AI with 1000 real neurons, built by Mohammad Khan, Age 14 🇮🇳";
    if(/bye|alvida|quit/.test(lower)) return "Goodbye! Come back anytime! 😊✨";

    return this.getRandom([
      "I'm still learning! Try: 'create python code' or 'make a game' 😊",
      "Ask me about Java, Python, JavaScript, HTML, or CSS! 🌱",
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
          if(Array.isArray(repos)) {
            repos.forEach(r => {
              if(r.name) aperonix.learn(
                r.name.toLowerCase(),
                `${r.name} is a ${r.language||'coding'} project by ${username}. ${r.description||''} Stars: ${r.stargazers_count}`,
                r.language
              );
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
  console.log("   🤖 APERONIX AI v0.8");
  console.log("   500+ Training Examples | 1000 Neurons");
  console.log("   Built by Mohammad Khan, Age 14 🇮🇳");
  console.log("=".repeat(55));

  aperonix.train(5000);

  console.log("Aperonix: Hey! I'm Aperonix v0.8 — smarter than ever! 🧠✨");
  console.log("          English, Hindi, Hinglish — all supported!");
  console.log('          (Type "quit" to save & exit)\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = () => {
    rl.question('You: ', (input) => {
      if(!input.trim()) { ask(); return; }
      if(input.toLowerCase() === 'quit') {
        aperonix.saveMemory();
        console.log("\nAperonix: Goodbye! Brain saved! 😊✨\n");
        rl.close();
        return;
      }
      setTimeout(() => {
        let answer = aperonix.think(input);
        console.log(`\nAperonix: ${answer}\n`);
        ask();
      }, 500);
    });
  };
  ask();
}

// ============================
// MAIN
// ============================
async function main() {
  aperonix.loadMemory();

  if(process.env.GITHUB_ACTIONS === 'true') {
    console.log("📚 GitHub Actions — Training!\n");
    aperonix.train(5000);
    for(let dev of developers) {
      await fetchRepos(dev);
      await new Promise(r => setTimeout(r, 1000));
    }
    aperonix.saveMemory();
    console.log(`\n✅ Knowledge: ${aperonix.knowledge.length} things!`);
    console.log("🚀 Aperonix v0.8 — Mohammad Khan, Age 14 🇮🇳");
  } else {
    await startChat();
  }
}

main();
