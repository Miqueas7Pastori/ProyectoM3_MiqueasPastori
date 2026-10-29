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
    <section class="page page--home">
      <div class="hero">
        <img class="hero__photo" src="${asset("assets/bakugo.jpg")}" alt="Katsuki Bakugo">
        <div class="hero__copy">
          <p class="page__kicker">U.A. · Clase 1-A</p>
          <p class="page__eyebrow">Chateá con</p>
          <h1 class="page__title">Katsuki<br><span>Bakugo</span></h1>
          <p class="page__lead">
            No vino a ser amable. Responde corto, fuerte y sin paciencia para extras.
          </p>
          <a class="button" href="/chat" data-link>Empezar a chatear</a>
        </div>
      </div>
      <ul class="facts">
        <li>
          <span>Quirk</span>
          <strong>Explosión</strong>
        </li>
        <li>
          <span>Héroe</span>
          <strong>Dynamight</strong>
        </li>
        <li>
          <span>Meta</span>
          <strong>N.º 1</strong>
        </li>
      </ul>
    </section>
  `;
}

function renderAbout() {
  return `
    <section class="page page--about">
      <header class="about__intro">
        <p class="page__kicker">ComicSansCon</p>
        <h1 class="page__title">Charlando<br><span>con Bakugo</span></h1>
        <p class="page__lead">
          La agencia busca armar experiencias para fans de series, películas y videojuegos.
          Esta es una charla con un personaje ficticio, para ver si la idea se sostiene.
        </p>
      </header>
      <div class="about__grid">
        <article class="panel panel--alt">
          <p class="panel__index"/p>
          <h2>Bakugo</h2>
          <p>
            El personaje utilizado fue Katsuki Bakugo, de My Hero Academia. Tiene una personalidad chocante y muy competitiva.
             Le suele gustar hablar de sus logros y presumir su fuerza, pero también es un personaje con un trasfondo interesante.
          </p>
        </article>
      </div>
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
