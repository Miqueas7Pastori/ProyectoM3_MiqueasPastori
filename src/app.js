import { bindChat, renderChat } from "./chat.js";
import { asset } from "./utils.js";

const routes = {
  "/home": renderHome,
  "/chat": renderChat,
  "/about": renderAbout,
};

const view = document.querySelector("#view");

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

  if (active === "/chat") {
    bindChat(view);
  }
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
