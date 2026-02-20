const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatContainer = document.getElementById("chatContainer");
const logo = document.getElementById("mainLogo");

const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

function addMessage(content, type) {
    const div = document.createElement("div");
    div.className = `message ${type}`;
    div.textContent = content;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage() {
    const text = userInput.value.trim();
    if(!text) return alert("Message empty");

    const apiKey = localStorage.getItem("gemini_api_key");
    if(!apiKey) return alert("Add API key in settings");

    addMessage(text,"user");
    userInput.value="";
    logo.classList.add("spin");

    try {
        const response = await fetch(`${API_URL}?key=${apiKey}`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
                contents:[{
                    parts:[{text:text}]
                }]
            })
        });

        const data = await response.json();
        logo.classList.remove("spin");

        if(data.error) {
            addMessage("API Error: "+data.error.message,"ai");
            return;
        }

        const reply = data.candidates[0].content.parts[0].text;
        addMessage(reply,"ai");

    } catch(err) {
        logo.classList.remove("spin");
        addMessage("Network error occurred.","ai");
    }
}

sendBtn.addEventListener("click",sendMessage);
userInput.addEventListener("keypress",e=>{
    if(e.key==="Enter") sendMessage();
});

// SETTINGS
document.getElementById("openSettings").onclick=()=>{
    document.getElementById("settingsModal").style.display="flex";
};
document.getElementById("closeSettings").onclick=()=>{
    document.getElementById("settingsModal").style.display="none";
};

document.getElementById("saveApiKey").onclick=()=>{
    const key=document.getElementById("apiKeyInput").value.trim();
    if(!key) return alert("Invalid Key");
    localStorage.setItem("gemini_api_key",key);
    alert("API Key Saved");
};

document.querySelectorAll("[data-theme]").forEach(btn=>{
    btn.addEventListener("click",()=>{
        document.body.setAttribute("data-theme",btn.dataset.theme);
        localStorage.setItem("theme",btn.dataset.theme);
    });
});

window.onload=()=>{
    const savedTheme=localStorage.getItem("theme");
    if(savedTheme) document.body.setAttribute("data-theme",savedTheme);
};
