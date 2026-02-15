// =====================================================
// Aperonix AI - FULL FINAL WORKING VERSION
// Gemini 1.5 Flash API Integration
// =====================================================

// ===== DOM Elements =====
const chatContainer = document.getElementById("chatContainer");
const chatInput = document.getElementById("chatInput");
const sendBtn =
  document.getElementById("sendBtn") ||
  document.querySelector(".send-button");

const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");

// ===== API Endpoint =====
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// ===== Save API Key =====
if (saveKeyBtn) {
  saveKeyBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      localStorage.setItem("gemini_api_key", key);
      alert("API Key Saved Successfully ✅");
      apiKeyInput.value = "";
    }
  });
}

// ===== Scroll Function =====
function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ===== Add Message =====
function addMessage(role, text) {
  const div = document.createElement("div");
  div.classList.add("message", role);
  div.textContent = text;
  chatContainer.appendChild(div);
  scrollToBottom();
  return div;
}

// ===== Main Send Function =====
async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  const apiKey = localStorage.getItem("gemini_api_key");

  if (!apiKey) {
    alert("⚠ Please save your Gemini API Key first.");
    return;
  }

  addMessage("user", message);
  chatInput.value = "";

  const thinking = addMessage("ai", "Thinking...");

  try {
    const response = await fetch(`${API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: message }]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Unknown API error");
    }

    const aiText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response received.";

    thinking.textContent = aiText;

  } catch (error) {
    thinking.textContent = "❌ Error: " + error.message;
    console.error("API Error:", error);
  }

  scrollToBottom();
}

// ===== Button Click =====
if (sendBtn) {
  sendBtn.addEventListener("click", sendMessage);
} else {
  console.error("Send button not found!");
}

// ===== Enter Key Support =====
if (chatInput) {
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
}

console.log("🚀 Aperonix AI Fully Loaded");
