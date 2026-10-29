import { describe, expect, it } from "vitest";
import { escapeHtml } from "../src/utils.js";

describe("escapeHtml", () => {
  it("convierte los caracteres que el navegador interpretaría como HTML", () => {
    expect(escapeHtml(`<b>Bakugo & "extra"</b>`)).toBe(
      "&lt;b&gt;Bakugo &amp; &quot;extra&quot;&lt;/b&gt;",
    );
  });

  it("convierte un apóstrofo para que no corte el texto", () => {
    expect(escapeHtml("O'Neil")).toBe("O&#39;Neil");
  });
});
