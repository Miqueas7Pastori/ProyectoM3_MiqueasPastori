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

function paintMessages(thread) {
  thread.innerHTML = renderMessageList(messages);
  thread.scrollTop = thread.scrollHeight;
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

      <main class="thread" id="messages" aria-label="Conversación"></main>

      <form class="composer">
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
      </form>

      <footer class="footer">
        <p>ComicSansCon · prueba de concepto</p>
      </footer>
    </div>
  `;
}

export function bindChat(root) {
  const thread = root.querySelector("#messages");
  const form = root.querySelector(".composer");
  const input = root.querySelector("#message-input");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();

    if (!text) {
      return;
    }

    messages.push({ author: "user", text });
    input.value = "";
    paintMessages(thread);
    input.focus();
  });

  paintMessages(thread);
}
