let assetBase;

export function asset(path) {
  if (!assetBase) {
    assetBase = new URL("./", window.location.href);
  }

  return new URL(path, assetBase).href;
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
