async function sendMessage() {

  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");

  const message = input.value;
  if (!message) return;

  chatBox.innerHTML += `<div><b>You:</b> ${message}</div>`;

  const res = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  const data = await res.json();

  chatBox.innerHTML += `<div><b>AI:</b> ${data.reply}</div>`;

  input.value = "";
}

function newChat() {
  document.getElementById("chatBox").innerHTML = "";
}
