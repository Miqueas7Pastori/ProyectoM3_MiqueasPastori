import { describe, expect, it } from "vitest";
import { readGeminiText, toGeminiContents } from "../api/functions.js";

describe("toGeminiContents", () => {
  it("traduce los autores al formato de Gemini y descarta el mensaje inicial del personaje", () => {
    const contents = toGeminiContents([
      { author: "character", text: "Hola" },
      { author: "user", text: " Primera " },
      { author: "character", text: "Respuesta" },
    ]);

    expect(contents).toEqual([
      { role: "user", parts: [{ text: "Primera" }] },
      { role: "model", parts: [{ text: "Respuesta" }] },
    ]);
  });

  it("une los mensajes seguidos del mismo autor e ignora los vacíos", () => {
    const contents = toGeminiContents([
      { author: "user", text: "Uno" },
      { author: "user", text: "Dos" },
      { author: "character", text: "   " },
    ]);

    expect(contents).toEqual([{ role: "user", parts: [{ text: "Uno\nDos" }] }]);
  });

  it("devuelve una lista vacía si no recibe un array", () => {
    expect(toGeminiContents(null)).toEqual([]);
  });
});

describe("readGeminiText", () => {
  it("lee el texto de Gemini y omite el pensamiento interno", () => {
    const text = readGeminiText({
      candidates: [
        {
          content: {
            parts: [
              { thought: true, text: "pensar" },
              { text: " ¡Morí! " },
            ],
          },
        },
      ],
    });

    expect(text).toBe("¡Morí!");
  });

  it("devuelve un texto vacío si no hay candidatos", () => {
    expect(readGeminiText({})).toBe("");
  });
});
