const API_BASE = "https://twodots-rag.onrender.com/";

const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const chat = document.getElementById("chat");



function addMessage(text, role, citations = []) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const body = document.createElement("div");
  body.className = "message-body";
  body.textContent = typeof text === "string" ? text : JSON.stringify(text, null, 2);
  wrapper.appendChild(body);

  if (citations.length > 0) {
    const cites = document.createElement("div");
    cites.className = "citations";

    const title = document.createElement("div");
    title.className = "citations-title";
    title.textContent = "Sources";
    cites.appendChild(title);

    citations.forEach((url) => {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = url;
      cites.appendChild(a);
    });

    wrapper.appendChild(cites);
  }

  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
}
async function sendMessage(message) {
  console.log("sending message:", message, typeof message);

  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: message }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("backend response:", text);
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";
  input.disabled = true;

  const loadingEl = document.createElement("div");
  loadingEl.className = "message assistant";
  loadingEl.textContent = "Thinking...";
  chat.appendChild(loadingEl);
  chat.scrollTop = chat.scrollHeight;

  try {
    const data = await sendMessage(message);
    loadingEl.remove();
    console.log("frontend received:", data);
    console.log("answer field =", data.answer, typeof data.answer);
    addMessage(data.response, "assistant", data.citations || []);
  } catch (err) {
    loadingEl.remove();
    addMessage("Something went wrong talking to the API.", "assistant");
    console.error(err);
  } finally {
    input.disabled = false;
    input.focus();
  }
});