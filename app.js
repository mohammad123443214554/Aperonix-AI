// 1. Apni Gemini Key yahan dalo
const GEMINI_API_KEY = "YAHAN_APNI_GEMINI_KEY_DALO"; 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// 2. Chat function
async function sendMessage() {
    const input = document.getElementById('userInput'); // Check karo index.html mein ye ID ho
    const text = input.value.trim();
    if (!text) return;

    // Welcome message ko gayab karo
    const welcome = document.getElementById('welcomeMessage');
    if (welcome) welcome.style.display = 'none';

    // User ka message screen par dikhao
    addMessageToScreen(text, 'user');
    input.value = "";

    // 3. IMAGE GENERATION LOGIC (Nano Banana System)
    if (text.toLowerCase().includes("photo") || text.toLowerCase().includes("banao") || text.toLowerCase().includes("generate")) {
        const seed = Math.floor(Math.random() * 1000);
        const imgUrl = `https://pollinations.ai/p/${encodeURIComponent(text)}?width=1024&height=1024&seed=${seed}&model=flux`;
        addMessageToScreen("Bhai, aapke liye image ban rahi hai...", 'ai', imgUrl);
        return;
    }

    // 4. GEMINI TEXT LOGIC
    try {
        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: text }] }] })
        });
        
        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        addMessageToScreen(aiResponse, 'ai');
    } catch (error) {
        addMessageToScreen("Network Error: Bhai, Gemini connect nahi ho raha. API Key check karo!", 'ai');
    }
}

// 5. Message dikhane ka professional tarika
function addMessageToScreen(txt, sender, imgUrl = null) {
    const container = document.getElementById('messagesContainer');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    
    // Design aur Content
    let label = sender === 'user' ? "<b>You</b>" : "<b>Aperonix</b>";
    msgDiv.innerHTML = `${label}<br>${txt.replace(/\n/g, '<br>')}`;
    
    // Agar image hai toh use bhi dikhao
    if (imgUrl) {
        msgDiv.innerHTML += `<br><img src="${imgUrl}" style="width:100%; max-width:400px; border-radius:15px; margin-top:10px; border: 2px solid #00d2ff;">`;
    }
    
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight; // Auto scroll niche
}

// 6. Buttons ko active karo
document.getElementById('sendBtn').onclick = sendMessage;

document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
