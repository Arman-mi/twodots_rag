const API_BASE = "https://onrender.com";

const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const chat = document.getElementById("chat");

function addMessage(text, role, citations = []) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const textNode = document.createElement("div");
  textNode.textContent = text;
  wrapper.appendChild(textNode);

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
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
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
    addMessage(data.answer, "assistant", data.citations || []);
  } catch (err) {
    loadingEl.remove();
    addMessage("Something went wrong talking to the API.", "assistant");
    console.error(err);
  } finally {
    input.disabled = false;
    input.focus();
  }
});