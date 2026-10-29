import { asset, escapeHtml } from "./utils.js";

const messages = [
  {
    author: "character",
    text: "¿Qué querés? Si vas a hablar, hablá. No pienso perder el tiempo con un extra.",
  },
  {
    author: "user",
    text: "Quiero saber cómo llegaste tan lejos.",
  },
  {
    author: "character",
    text: "Entrenando hasta reventar. El que se queja se queda atrás. Así de simple.",
  },
];

const labels = {
  character: "Bakugo",
  user: "Vos",
};

export function renderMessageList(items) {
  return items
    .map((message) => {
      const author = message.author === "user" ? "user" : "character";

      return `
        <article class="message message--${author}">
          <p class="message__author">${labels[author]}</p>
          <p class="message__text">${escapeHtml(message.text)}</p>
        </article>
      `;
    })
    .join("");
}

let phase = "idle";
let errorText = "";
let sending = false;

function chatControls() {
  return {
    thread: document.querySelector("#messages"),
    input: document.querySelector("#message-input"),
    button: document.querySelector(".composer__send"),
    error: document.querySelector(".chat__error"),
  };
}

function paintMessages() {
  const { thread, input, button, error } = chatControls();

  if (!thread) {
    return;
  }

  thread.innerHTML = renderMessageList(messages);

  if (phase === "typing") {
    thread.insertAdjacentHTML(
      "beforeend",
      `
        <article class="message message--character message--typing">
          <p class="message__author">Bakugo</p>
          <p class="message__text">Está escribiendo…</p>
        </article>
      `,
    );
  }

  thread.scrollTop = thread.scrollHeight;

  const busy = phase === "typing";

  if (input) {
    input.disabled = busy;
  }

  if (button) {
    button.disabled = busy;
  }

  if (error) {
    error.hidden = phase !== "error";
    error.textContent = phase === "error" ? errorText : "";
  }
}

export function renderChat() {
  return `
    <div class="chat">
      <aside class="profile">
        <img class="profile__photo" src="${asset("assets/bakugo.jpg")}" alt="">
        <p class="profile__kicker">U.A. · Clase 1-A</p>
        <h2 class="profile__name">Katsuki Bakugo</h2>
        <p class="profile__role">Gran Explosión Asesina</p>
        <p class="profile__bio">Respuestas cortas, cero paciencia y mucho volumen. Si vas a hablar, que valga la pena.</p>
      </aside>

      <header class="header">
        <div class="avatar">
          <img class="avatar__photo" src="${asset("assets/bakugo.jpg")}" alt="Katsuki Bakugo">
        </div>
        <div class="header__text">
          <p class="header__kicker">U.A. · Clase 1-A</p>
          <h1 class="header__title">Katsuki Bakugo</h1>
          <p class="header__status">
            <span class="header__dot" aria-hidden="true"></span>
            En línea
          </p>
        </div>
      </header>

      <main class="thread" id="messages" aria-label="Conversación" aria-live="polite"></main>

      <form class="composer">
        <p class="chat__error" role="alert" hidden></p>
        <div class="composer__row">
          <label class="sr-only" for="message-input">Mensaje</label>
          <input
            id="message-input"
            class="composer__input"
            type="text"
            name="message"
            placeholder="Decile algo a Bakugo…"
            autocomplete="off"
            maxlength="500"
          >
          <button class="composer__send" type="submit">Enviar</button>
        </div>
      </form>

      <footer class="footer">
        <p>ComicSansCon · prueba de concepto</p>
      </footer>
    </div>
  `;
}

async function requestReply() {
  const response = await fetch("/api/functions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || typeof data.text !== "string" || !data.text.trim()) {
    throw new Error(data.error || "Bakugo no pudo responder. Intentá de nuevo.");
  }

  return data.text.trim();
}

export function bindChat(root) {
  const form = root.querySelector(".composer");
  const input = root.querySelector("#message-input");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const text = input.value.trim();

    if (!text || sending) {
      return;
    }

    messages.push({ author: "user", text });
    input.value = "";
    sending = true;
    phase = "typing";
    errorText = "";
    paintMessages();

    try {
      const reply = await requestReply();
      messages.push({ author: "character", text: reply });
      phase = "idle";
    } catch (error) {
      phase = "error";
      errorText = error.message || "Bakugo no pudo responder. Intentá de nuevo.";
    } finally {
      sending = false;
      paintMessages();
      chatControls().input?.focus();
    }
  });

  paintMessages();
}
