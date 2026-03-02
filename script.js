async function askAI() {
    const inputField = document.getElementById("userInput");
    const input = inputField.value.trim();
    const chatBox = document.getElementById("messages");

    if (!input) return;

    chatBox.innerHTML += `<div class="user-msg"><b>Aap:</b> ${input}</div>`;
    inputField.value = "";

    try {
        // Aapke local Python server se baat karna
        const response = await fetch('http://127.0.0.1:5000/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: input })
        });

        const data = await response.json();
        chatBox.innerHTML += `<div class="bot-msg"><b>Aperonix AI:</b> ${data.answer}</div>`;
    } catch (error) {
        chatBox.innerHTML += `<p style="color: red;"><b>Error:</b> Bhai, pehle 'app.py' ko run karo!</p>`;
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}
