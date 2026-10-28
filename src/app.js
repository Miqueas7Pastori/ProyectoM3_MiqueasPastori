const assetBase = new URL("./", window.location.href);

const routes = {
  "/home": renderHome,
  "/chat": renderChat,
  "/about": renderAbout,
};

const view = document.querySelector("#view");

function asset(path) {
  return new URL(path, assetBase).href;
}

function normalizePath(pathname) {
  if (pathname.endsWith("/index.html")) {
    pathname = pathname.slice(0, -"index.html".length);
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  if (pathname === "/" || pathname.endsWith("/src")) {
    return "/home";
  }

  return pathname;
}

function renderHome() {
  return `
    <section class="page">
      <img class="hero__photo" src="${asset("assets/bakugo.jpg")}" alt="Katsuki Bakugo">
      <p class="page__kicker">U.A. · Clase 1-A</p>
      <h1 class="page__title">Chateá con Katsuki Bakugo</h1>
      <p class="page__text">
        El de la Gran Explosión Asesina no vino a ser amable. Responde corto,
        en voz alta y sin paciencia para extras. Si vas a preguntarle algo,
        que valga la pena.
      </p>
      <a class="button" href="/chat" data-link>Empezar a chatear</a>
    </section>
  `;
}

function renderChat() {
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

      <main class="thread" id="messages" aria-label="Conversación">
        <article class="message message--character">
          <p class="message__author">Bakugo</p>
          <p class="message__text">¿Qué querés? Si vas a hablar, hablá. No pienso perder el tiempo con un extra.</p>
        </article>
        <article class="message message--user">
          <p class="message__author">Vos</p>
          <p class="message__text">Quiero saber cómo llegaste tan lejos.</p>
        </article>
        <article class="message message--character">
          <p class="message__author">Bakugo</p>
          <p class="message__text">Entrenando hasta reventar. El que se queja se queda atrás. Así de simple.</p>
        </article>
      </main>

      <form class="composer" action="#">
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
        <button class="composer__send" type="button">Enviar</button>
      </form>

      <footer class="footer">
        <p>ComicSansCon · prueba de concepto</p>
      </footer>
    </div>
  `;
}

function renderAbout() {
  return `
    <section class="page">
      <p class="page__kicker">ComicSansCon</p>
      <h1 class="page__title">Acerca de</h1>
      <p class="page__text">
        Esta prueba de concepto muestra un chat con un personaje ficticio.
        El personaje elegido es Katsuki Bakugo, de My Hero Academia, porque
        tiene una forma de hablar imposible de confundir.
      </p>
      <p class="page__text">
        La idea es conversar con él desde el celular, la tablet o el escritorio,
        sin recargar la página al cambiar de sección.
      </p>
    </section>
  `;
}

function updateNav(path) {
  document.querySelectorAll("[data-link]").forEach((link) => {
    if (link.getAttribute("href") === path) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function render() {
  const path = normalizePath(window.location.pathname);
  const active = routes[path] ? path : "/home";

  if (window.location.pathname !== active) {
    history.replaceState(null, "", active);
  }

  updateNav(active);
  view.className = active === "/chat" ? "view view--chat" : "view view--page";
  view.innerHTML = (routes[active] || renderHome)();
}

function navigate(pathname) {
  if (window.location.pathname === pathname) {
    return;
  }

  history.pushState(null, "", pathname);
  render();
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-link]");

  if (!link) {
    return;
  }

  event.preventDefault();
  navigate(link.getAttribute("href"));
});

window.addEventListener("popstate", render);

render();
