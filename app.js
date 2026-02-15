// ==============================
// Aperonix - Professional App JS
// ==============================

// ================== API CONFIG ==================
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const HUGGINGFACE_API_URL =
  "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

const STRICT_IDENTITY_RESPONSE =
  "I am Aperonix, created and owned by Mohammad Khan.";

// ================== GLOBAL STATE ==================
let currentMode = "chat";
let isProcessing = false;

// ================== STORAGE ==================
function getApiKeys() {
  return {
    gemini: localStorage.getItem("GEMINI_API_KEY") || "",
    huggingface: localStorage.getItem("HUGGINGFACE_API_TOKEN") || "",
  };
}

function saveApiKeys(gemini, huggingface) {
  localStorage.setItem("GEMINI_API_KEY", gemini);
  localStorage.setItem("HUGGINGFACE_API_TOKEN", huggingface);
}

// ================== TOAST ==================
function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  toastMessage.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ================== IDENTITY CHECK ==================
function isIdentityQuestion(text) {
  const lower = text.toLowerCase();
  return (
    lower.includes("who are you") ||
    lower.includes("who created you") ||
    lower.includes("who made you") ||
    lower.includes("your creator") ||
    lower.includes("your owner")
  );
}

// ================== CHAT UI ==================
function addMessage(role, text) {
  const container = document.getElementById("messagesContainer");
  const welcome = document.getElementById("welcomeMessage");
  if (welcome) welcome.style.display = "none";

  const messageDiv = document.createElement("div");
  messageDiv.className = "message " + role;

  const avatar =
    role === "assistant"
      ? `<img src="logo.jpg" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid #ffffff;">`
      : "";

  messageDiv.innerHTML = `
        <div class="message-content">
            ${avatar}
            <p>${escapeHtml(text)}</p>
        </div>
    `;

  container.appendChild(messageDiv);
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ================== GEMINI API (Updated & Fixed) ==================
async function callGemini(message) {
  const keys = getApiKeys();
  if (!keys.gemini) {
    alert("Bhai, Settings mein API Key nahi mili!");
    throw new Error("Missing API Key");
  }

  try {
    const response = await fetch(
      `${GEMINI_API_URL}?key=${encodeURIComponent(keys.gemini)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: "System: You are Aperonix, created by Mohammad Khan. User Message: " + message }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini Error Detail:", data);
      throw new Error(data.error?.message || "API Error");
    }

    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Bhai, AI ne koi jawab nahi diya."
    );
  } catch (err) {
    console.error("Fetch Error:", err);
    throw err;
  }
}
// ================== SEND MESSAGE (Updated) ==================
async function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text || isProcessing) return;

  addMessage("user", text);
  input.value = "";

  if (isIdentityQuestion(text)) {
    const aiResponse = STRICT_IDENTITY_RESPONSE;
    addMessage("assistant", aiResponse);
    saveChatToHistory(text, aiResponse); // Identity question bhi save hoga
    return;
  }

  try {
    isProcessing = true;
    const reply = await callGemini(text);
    addMessage("assistant", reply);
    
    // YE LINE HISTORY SAVE KAREGI (Sirf success hone par)
    saveChatToHistory(text, reply); 

  } catch (err) {
    // Agar API fail hui toh ye error dikhega
    addMessage("assistant", "API connection failed. Check your API key.");
    console.error("API Error:", err);
  } finally {
    isProcessing = false;
  }
}
// ================== IMAGE GENERATION ==================
async function generateImage() {
  const input = document.getElementById("imageInput");
  const prompt = input.value.trim();
  if (!prompt || isProcessing) return;

  const keys = getApiKeys();
  if (!keys.huggingface) {
    showToast("Add Hugging Face API Token in Settings.");
    return;
  }

  try {
    isProcessing = true;

    const response = await fetch(HUGGINGFACE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${keys.huggingface}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) throw new Error("Image API Error");

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    const container = document.getElementById("generatedImages");
    const card = document.createElement("div");
    card.className = "image-card";
    card.innerHTML = `<img src="${imageUrl}" style="width:100%;border:1px solid #333;">`;
    container.prepend(card);

    input.value = "";
  } catch (err) {
    showToast("Image generation failed.");
  } finally {
    isProcessing = false;
  }
}

// ================== SETTINGS ==================
function openSettings() {
  const modal = document.getElementById("settingsModal");
  const keys = getApiKeys();

  document.getElementById("geminiKey").value = keys.gemini;
  document.getElementById("huggingfaceKey").value = keys.huggingface;

  modal.style.display = "flex";
}

function closeSettings() {
  document.getElementById("settingsModal").style.display = "none";
}

function saveSettings() {
  const gemini = document.getElementById("geminiKey").value.trim();
  const huggingface = document
    .getElementById("huggingfaceKey")
    .value.trim();

  saveApiKeys(gemini, huggingface);
  closeSettings();
  showToast("Settings saved successfully.");
}

// ================== MODE SWITCH ==================
function switchMode(mode) {
  currentMode = mode;

  document.getElementById("chatSection").classList.toggle(
    "active",
    mode === "chat"
  );
  document.getElementById("imageSection").classList.toggle(
    "active",
    mode === "image"
  );

  document.getElementById("chatTab").classList.toggle(
    "active",
    mode === "chat"
  );
  document.getElementById("imageTab").classList.toggle(
    "active",
    mode === "image"
  );
}

// ================== INITIALIZATION ==================
window.onload = function () {
  // Enable buttons even if disabled in HTML
  document.getElementById("sendBtn").disabled = false;
  document.getElementById("generateBtn").disabled = false;

  // Button listeners
  document.getElementById("sendBtn").onclick = sendMessage;
  document.getElementById("generateBtn").onclick = generateImage;

  document.getElementById("settingsBtn").onclick = openSettings;
  document.getElementById("closeSettings").onclick = closeSettings;
  document.getElementById("cancelSettings").onclick = closeSettings;
  document.getElementById("saveSettings").onclick = saveSettings;

  document.getElementById("chatTab").onclick = () =>
    switchMode("chat");
  document.getElementById("imageTab").onclick = () =>
    switchMode("image");

  // Enter key support
  document
    .getElementById("chatInput")
    .addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

  document
    .getElementById("imageInput")
    .addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        generateImage();
      }
    });
};
// Sabse asaan tarika - Har Button ko uski Class se pakadna
document.addEventListener("click", function(e) {
    // 1. Agar Settings button daba
    if (e.target.closest('.settings-btn') || e.target.id === 'settingsBtn') {
        const modal = document.querySelector('.modal-overlay') || document.getElementById('settingsModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.style.setProperty('display', 'flex', 'important');
            modal.style.zIndex = '99999';
        }
    }

    // 2. Agar Settings band karne ka button daba
    if (e.target.closest('.modal-close') || e.target.id === 'closeSettings' || e.target.closest('.btn-secondary')) {
        const modal = document.querySelector('.modal-overlay') || document.getElementById('settingsModal');
        if (modal) modal.style.display = 'none';
    }

    // 3. Agar New Chat button daba
    if (e.target.closest('.new-chat-btn') || e.target.id === 'newChatBtn') {
        window.location.reload();
    }
});
document.addEventListener("click", function (e) {
    // 1. Settings Button Dabane Par
    if (e.target.closest('#settingsBtn')) {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.style.setProperty('display', 'flex', 'important');
            modal.style.setProperty('visibility', 'visible', 'important');
            modal.style.setProperty('opacity', '1', 'important');
            modal.style.zIndex = "99999";
            console.log("Settings Khul Gaya!");
        }
    }

    // 2. Close Button Dabane Par
    if (e.target.closest('#closeSettings') || e.target.closest('.modal-close')) {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.style.setProperty('display', 'none', 'important');
            modal.style.setProperty('visibility', 'hidden', 'important');
        }
    }
});
// Eye Button ko chalu karne ke liye
document.querySelectorAll('.toggle-visibility').forEach(button => {
    button.onclick = function() {
        // Isse input box ko pakdenge
        const input = this.parentElement.querySelector('input');
        const icon = this.querySelector('svg');

        if (input.type === "password") {
            input.type = "text";
            // Button ka color thoda badal dete hain taaki pata chale ki 'on' hai
            this.style.color = "var(--accent-primary)";
        } else {
            input.type = "password";
            this.style.color = "var(--text-muted)";
        }
    };
});
// 1. History Save karne ka function
function saveChatToHistory(userMsg, aiMsg) {
    let history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    history.unshift({ user: userMsg, ai: aiMsg, time: new Date().toLocaleString() });
    localStorage.setItem('chatHistory', JSON.stringify(history));
    renderHistory(); // Nayi list dikhane ke liye
}

// 2. History dikhane (Render) karne ka function
function renderHistory() {
    const historyList = document.querySelector('.history-list');
    if (!historyList) return;

    let history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    historyList.innerHTML = history.map((item, index) => `
        <button class="history-item" onclick="loadOldChat(${index})">
            <span class="history-item-text">${item.user.substring(0, 20)}...</span>
            <span class="history-item-delete" onclick="deleteHistory(event, ${index})">×</span>
        </button>
    `).join('');
}

// ================== MASTER API & HISTORY FIX ==================

// 1. Gemini API ko sahi tarike se call karne ke liye
async function callGemini(message) {
    const keys = getApiKeys();
    if (!keys.gemini) throw new Error("Settings mein API Key nahi mili!");

    const response = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(keys.gemini)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: `You are Aperonix, created by Mohammad Khan. User says: ${message}` }]
            }]
        })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "API ne mana kar diya");
    
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "AI ne koi jawab nahi diya.";
}

// 2. Message bhejte hi History Save karne ke liye
async function sendMessage() {
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if (!text || isProcessing) return;

    addMessage("user", text);
    input.value = "";

    try {
        isProcessing = true;
        const reply = await callGemini(text);
        addMessage("assistant", reply);
        
        // History yahan save hogi
        saveChatToHistory(text, reply); 
    } catch (err) {
        // Bhai, ab yahan asli error dikhega screen par
        addMessage("assistant", "System Error: " + err.message);
        console.error(err);
    } finally {
        isProcessing = false;
    }
}

// 3. History functions (Save, Show, Load)
function saveChatToHistory(u, a) {
    let h = JSON.parse(localStorage.getItem('chatHistory')) || [];
    h.unshift({ user: u, ai: a });
    localStorage.setItem('chatHistory', JSON.stringify(h.slice(0, 20))); // Max 20 chats
    renderHistory();
}

function renderHistory() {
    const list = document.querySelector('.history-list');
    if (!list) return;
    let h = JSON.parse(localStorage.getItem('chatHistory')) || [];
    list.innerHTML = h.map((item, i) => `
        <button class="history-item" onclick="loadOldChat(${i})">
            <span class="history-item-text">${item.user.substring(0, 20)}...</span>
        </button>
    `).join('');
}

function loadOldChat(i) {
    let h = JSON.parse(localStorage.getItem('chatHistory')) || [];
    const container = document.getElementById("messagesContainer");
    container.innerHTML = ''; 
    addMessage("user", h[i].user);
    addMessage("assistant", h[i].ai);
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', renderHistory);
