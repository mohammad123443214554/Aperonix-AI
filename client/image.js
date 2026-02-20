async function generateImage() {

  const prompt = document.getElementById("prompt").value;

  const res = await fetch("http://localhost:5000/api/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();

  document.getElementById("result").innerHTML =
    `<p>${data.reply}</p>`;
}
