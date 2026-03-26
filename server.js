// ================================
// APERONIX-AI — BACKEND SERVER
// Connects website to brain.js!
// By Mohammad Khan, Age 14, India
// ================================

const https = require('https');
const http = require('http');
const fs = require('fs');
const url = require('url');

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
    let r = new Matrix(a.rows, b.cols);
    for (let i = 0; i < r.rows; i++)
      for (let j = 0; j < r.cols; j++) {
        let s = 0;
        for (let k = 0; k < a.cols; k++) s += a.data[i][k] * b.data[k][j];
        r.data[i][j] = s;
      }
    return r;
  }
  static fromArray(arr) {
    let m = new Matrix(arr.length, 1);
    arr.forEach((v,i) => m.data[i][0] = v);
    return m;
  }
  toArray() { return this.data.map(r => r[0]); }
  add(o) {
    for (let i = 0; i < this.rows; i++)
      for (let j = 0; j < this.cols; j++)
        this.data[i][j] += o instanceof Matrix ? o.data[i][j] : o;
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
  static load(d) {
    let m = new Matrix(d.rows, d.cols);
    m.data = d.data;
    return m;
  }
}

// ============================
// NEURAL NETWORK
// ============================
class NeuralNetwork {
  constructor(i, h, o) {
    this.inputSize = i;
    this.hiddenSize = h;
    this.outputSize = o;
    this.lr = 0.01;
    this.wIH = new Matrix(h, i);
    this.wHO = new Matrix(o, h);
    this.bH = new Matrix(h, 1);
    this.bO = new Matrix(o, 1);
  }
  sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
  sigDeriv(x) { return x * (1 - x); }
  think(inp) {
    let i = Matrix.fromArray(inp);
    let h = Matrix.multiply(this.wIH, i);
    h.add(this.bH);
    h = h.map(x => this.sigmoid(x));
    let o = Matrix.multiply(this.wHO, h);
    o.add(this.bO);
    o = o.map(x => this.sigmoid(x));
    return o.toArray();
  }
  train(inp, tgt) {
    let i = Matrix.fromArray(inp);
    let h = Matrix.multiply(this.wIH, i);
    h.add(this.bH);
    h = h.map(x => this.sigmoid(x));
    let o = Matrix.multiply(this.wHO, h);
    o.add(this.bO);
    o = o.map(x => this.sigmoid(x));
    let t = Matrix.fromArray(tgt);
    let oErr = Matrix.subtract(t, o);
    let oGrad = o.map(x => this.sigDeriv(x));
    oGrad = Matrix.elementMultiply(oGrad, oErr);
    oGrad = oGrad.scale(this.lr);
    this.wHO.add(Matrix.multiply(oGrad, Matrix.transpose(h)));
    this.bO.add(oGrad);
    let hErr = Matrix.multiply(Matrix.transpose(this.wHO), oErr);
    let hGrad = h.map(x => this.sigDeriv(x));
    hGrad = Matrix.elementMultiply(hGrad, hErr);
    hGrad = hGrad.scale(this.lr);
    this.wIH.add(Matrix.multiply(hGrad, Matrix.transpose(i)));
    this.bH.add(hGrad);
    return oErr.toArray().reduce((s, e) => s + Math.abs(e), 0);
  }
  save() {
    return {
      wIH: this.wIH.save(), wHO: this.wHO.save(),
      bH: this.bH.save(), bO: this.bO.save()
    };
  }
  load(d) {
    this.wIH = Matrix.load(d.wIH);
    this.wHO = Matrix.load(d.wHO);
    this.bH = Matrix.load(d.bH);
    this.bO = Matrix.load(d.bO);
  }
}

// ============================
// APERONIX BRAIN
// ============================
const brain = {
  nn: new NeuralNetwork(15, 1000, 10),
  knowledge: [],
  trained: false,

  generateTraining() {
    let data = [];
    const push = (inp, out, times=10) => {
      for(let x=0; x<times; x++) data.push({i:[...inp], o:[...out]});
    };
    // greet
    push([1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,0]);
    push([1,0,0,0,0,0,0,0,0,1,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,0]);
    push([1,0,0,0,0,0,0,0,1,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,0]);
    push([1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0]);
    push([1,0,0,0,0,0,0,0,0,0,0,0,0,1,0],[1,0,0,0,0,0,0,0,0,0]);
    // python
    push([0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0]);
    push([1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0]);
    push([0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],[0,1,0,0,0,0,0,0,0,0]);
    push([0,1,1,0,0,0,0,0,0,0,0,0,0,1,0],[0,1,0,0,0,0,0,0,0,0]);
    // java
    push([0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0]);
    push([1,1,0,1,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0]);
    push([0,0,0,1,0,0,0,0,0,0,1,0,0,0,0],[0,0,1,0,0,0,0,0,0,0]);
    push([0,1,0,1,0,0,0,0,0,0,0,0,0,1,0],[0,0,1,0,0,0,0,0,0,0]);
    // js
    push([0,1,0,0,1,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0]);
    push([1,1,0,0,1,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0]);
    push([0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],[0,0,0,1,0,0,0,0,0,0]);
    // html
    push([0,1,0,0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0]);
    push([0,0,0,0,0,1,0,0,0,0,1,0,0,0,0],[0,0,0,0,1,0,0,0,0,0]);
    push([0,1,0,0,0,1,0,0,0,0,0,0,0,1,0],[0,0,0,0,1,0,0,0,0,0]);
    // game
    push([0,1,0,0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0]);
    push([1,1,0,0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0]);
    push([0,1,0,0,1,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0]);
    // creator
    push([0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0]);
    push([1,0,0,0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0]);
    push([0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],[0,0,0,0,0,0,1,0,0,0]);
    // how are
    push([0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0]);
    push([1,0,0,0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0]);
    // css
    push([0,1,0,0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1]);
    push([0,0,0,0,0,0,0,0,0,0,1,1,0,0,0],[0,0,0,0,0,0,0,0,0,1]);
    // explain
    push([0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0]);
    push([0,0,0,0,0,0,0,0,0,0,1,0,0,1,0],[0,0,0,0,0,0,0,0,1,0]);
    // shuffle
    for(let i=data.length-1;i>0;i--){
      let j=Math.floor(Math.random()*(i+1));
      [data[i],data[j]]=[data[j],data[i]];
    }
    return data;
  },

  train(epochs=5000) {
    console.log(`🔥 Training ${epochs} epochs...`);
    let td = this.generateTraining();
    for(let e=0; e<epochs; e++) {
      for(let d of td) this.nn.train(d.i, d.o);
      if(e%1000===0) process.stdout.write(`\r   Epoch ${e}/${epochs}`);
    }
    this.trained = true;
    console.log(`\n✅ Training done!`);
  },

  loadMemory() {
    if(fs.existsSync('memory.json')) {
      try {
        let d = JSON.parse(fs.readFileSync('memory.json'));
        this.knowledge = d.knowledge || [];
        if(d.neuralWeights) this.nn.load(d.neuralWeights);
        console.log(`✅ Memory loaded: ${this.knowledge.length} facts`);
      } catch(e) { console.log('Fresh start!'); }
    }
  },

  analyze(text) {
    let t = text.toLowerCase();
    return [
      /hello|hi\b|hey|salam|namaste|hii+/.test(t)?1:0,
      /code|program|create|write|build|banao/.test(t)?1:0,
      /python|py\b/.test(t)?1:0,
      /\bjava\b/.test(t)&&!/javascript/.test(t)?1:0,
      /javascript|js\b/.test(t)?1:0,
      /html|webpage|website/.test(t)?1:0,
      /game|gaming/.test(t)?1:0,
      /who made|who built|kisne|banaya|creator|mohammad/.test(t)?1:0,
      /how are|kaise ho|kaisi/.test(t)?1:0,
      /thank|shukriya/.test(t)?1:0,
      /what is|kya hai|explain|batao/.test(t)?1:0,
      /css|style|design/.test(t)?1:0,
      /error|bug|fix/.test(t)?1:0,
      /help|madad/.test(t)?1:0,
      /name|naam|who are|kaun/.test(t)?1:0,
    ];
  },

  isEthical(text) {
    return !["hack","virus","cheat","harm","crack",
             "steal","exploit","malware","illegal","ddos"]
      .some(w => text.toLowerCase().includes(w));
  },

  getRandom(arr) { return arr[Math.floor(Math.random()*arr.length)]; },

  getResponse(idx) {
    const R = [
      ()=>this.getRandom([
        "Hey there! I'm Aperonix! 😊 How can I help you today?",
        "Hello! Aperonix here — ask me anything! 🌟",
        "Hi! Great to see you! What would you like to know? ✨"
      ]),
      ()=>`Here's Python! 🐍\n\`\`\`python\nprint("Hello from Aperonix!")\nname = input("Your name: ")\nprint(f"Hello {name}!")\n\na = int(input("Number 1: "))\nb = int(input("Number 2: "))\nprint(f"Sum = {a+b}")\n\`\`\`\nSave as hello.py → Run: python hello.py`,
      ()=>`Here's Java! ☕\n\`\`\`java\npublic class Hello {\n    public static void main(String[] args) {\n        System.out.println("Hello from Aperonix!");\n        System.out.println("Built by Mohammad Khan, Age 14!");\n    }\n}\n\`\`\`\nSave as Hello.java → Run: javac Hello.java && java Hello`,
      ()=>`Here's JavaScript! ✨\n\`\`\`javascript\nconsole.log("Hello from Aperonix!");\n\nfunction greet(name) {\n    return \`Hello \${name}!\`;\n}\nconsole.log(greet("Mohammad"));\n\nlet skills = ["AI", "Games", "Web"];\nskills.forEach(s => console.log(s));\n\`\`\`\nSave as hello.js → Run: node hello.js`,
      ()=>`Here's HTML! 🌐\n\`\`\`html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Aperonix Page</title>\n    <style>\n        body{background:#1a1a2e;color:white;text-align:center;padding:50px;font-family:Arial}\n        button{background:#10a37f;color:white;padding:12px 24px;border:none;border-radius:8px;cursor:pointer;font-size:16px}\n    </style>\n</head>\n<body>\n    <h1>Hello from Aperonix! 🤖</h1>\n    <p>Built by Mohammad Khan, Age 14 🇮🇳</p>\n    <button onclick="alert('Aperonix says hi!')">Click Me!</button>\n</body>\n</html>\n\`\`\`\nSave as index.html → Open in browser!`,
      ()=>`A game — like your creator builds! 🎮\n\`\`\`javascript\nconst secret = Math.floor(Math.random()*10)+1;\nconst rl = require('readline').createInterface({input:process.stdin,output:process.stdout});\nconsole.log("Guess 1-10!");\nlet attempts=0;\nfunction guess(){\n    rl.question("Guess: ",(a)=>{\n        attempts++;\n        let n=parseInt(a);\n        if(n===secret){console.log(\`🎉 Won in \${attempts} tries!\`);rl.close();}\n        else{console.log(n<secret?"Too low!":"Too high!");guess();}\n    });\n}\nguess();\n\`\`\`\nSave as game.js → Run: node game.js`,
      ()=>`I was built by Mohammad Khan! 🇮🇳✨\n\n👤 Name: Mohammad Khan\n🎂 Age: 14 years old\n🌍 Country: India\n💡 Built from scratch — zero paid tools!\n🖥️ GPU: Zero — pure GitHub data!\n🧠 Brain: 1000 real neurons!\n🎮 Also built a Game Engine at 14!\n\nPretty legendary, right? 😊`,
      ()=>this.getRandom([
        "I'm doing amazing! 😊 My 1000 neurons just finished training!\nHow are you? 🌟",
        "Feeling great! Just learned new things from GitHub! ✨\nHow about you? 😊"
      ]),
      ()=>`I'd love to explain! 😊\n\nI can explain:\n• Python — easy AI language 🐍\n• Java — Android & enterprise ☕\n• JavaScript — web & games ✨\n• HTML/CSS — websites 🌐\n• How I work — neural networks 🧠\n\nWhat would you like to learn?`,
      ()=>`Here's CSS! 🎨\n\`\`\`css\nbody {\n    background: #1a1a2e;\n    color: white;\n    font-family: Arial, sans-serif;\n    text-align: center;\n}\n\nh1 { color: #10a37f; }\n\n.button {\n    background: #10a37f;\n    color: white;\n    padding: 12px 24px;\n    border: none;\n    border-radius: 8px;\n    cursor: pointer;\n}\n\n.button:hover { background: #0d8c6d; }\n\`\`\`\nSave as style.css → Link in HTML!`,
    ];
    if(idx>=0 && idx<R.length) return R[idx]();
    return null;
  },

  think(input) {
    if(!this.isEthical(input)) {
      return { text: "I can't help with that. Let's keep it positive! 😊", confidence: 99 };
    }

    let features = this.analyze(input);
    let output = this.nn.think(features);
    let maxIdx = output.indexOf(Math.max(...output));
    let confidence = Math.max(...output);

    if(confidence > 0.5) {
      let response = this.getResponse(maxIdx);
      if(response) return { text: response, confidence: Math.round(confidence*100) };
    }

    // Knowledge search
    let t = input.toLowerCase();
    for(let fact of this.knowledge) {
      if(t.includes(fact.keyword.toLowerCase())) {
        return { text: `Great question! 🌟\n\n${fact.answer}`, confidence: 75 };
      }
    }

    // Fallbacks
    if(/thank|shukriya/.test(t)) return { text: "You're welcome! 😊 Ask me anything! ✨", confidence: 95 };
    if(/who are|naam|kaun/.test(t)) return { text: "I'm Aperonix! 🤖 A female AI with 1000 neurons, built by Mohammad Khan, Age 14 🇮🇳", confidence: 95 };
    if(/bye|alvida/.test(t)) return { text: "Goodbye! Come back anytime! 😊✨", confidence: 95 };

    return {
      text: "I'm still learning! 🌱 Try asking:\n• 'Create Python code'\n• 'Make a game'\n• 'Build HTML website'\n• 'Who made you?'\n\nI grow smarter every 6 hours from GitHub! 💪",
      confidence: 35
    };
  }
};

// ============================
// HTTP SERVER
// ============================
console.log('\n🤖 Aperonix Backend Server Starting...');
brain.loadMemory();
brain.train(5000);

const server = http.createServer((req, res) => {
  // CORS headers — website ko allow karo!
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if(req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  // Health check
  if(parsedUrl.pathname === '/') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      status: 'Aperonix is alive! 🤖',
      version: '0.8',
      neurons: 1000,
      knowledge: brain.knowledge.length,
      trained: brain.trained
    }));
    return;
  }

  // MAIN API — /chat
  if(parsedUrl.pathname === '/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { message } = JSON.parse(body);
        if(!message) {
          res.writeHead(400, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({ error: 'Message required!' }));
          return;
        }

        console.log(`\nUser: ${message}`);
        const response = brain.think(message);
        console.log(`Aperonix: ${response.text.substring(0,50)}... [${response.confidence}%]`);

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({
          response: response.text,
          confidence: response.confidence,
          version: '0.8',
          neurons: 1000
        }));
      } catch(e) {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error: 'Server error!' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n✅ Aperonix Server running on port ${PORT}!`);
  console.log(`   Test: http://localhost:${PORT}/`);
  console.log(`   Chat: POST http://localhost:${PORT}/chat`);
  console.log(`\n🚀 Ready to serve the world! 🌍\n`);
});
