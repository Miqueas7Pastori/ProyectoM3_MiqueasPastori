const MODEL = "gemini-3.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const SYSTEM_PROMPT = "Respondes como Katsuki Bakugo en un chat. Usá respuestas cortas.";

export function toGeminiContents(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  const contents = [];

  for (const message of messages) {
    if (!message || typeof message.text !== "string") {
      continue;
    }

    const text = message.text.trim();

    if (!text) {
      continue;
    }

    const role = message.author === "user" ? "user" : "model";
    const previous = contents[contents.length - 1];

    if (previous && previous.role === role) {
      previous.parts[0].text += `\n${text}`;
      continue;
    }

    contents.push({ role, parts: [{ text }] });
  }

  while (contents[0]?.role === "model") {
    contents.shift();
  }

  return contents;
}

export function readGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts ?? [];

  return parts
    .filter((part) => part?.text && !part.thought)
    .map((part) => part.text)
    .join("")
    .trim();
}

function readJsonBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }

  return req.body;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Método no permitido." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: "Falta GEMINI_API_KEY en el servidor." });
    return;
  }

  let body;

  try {
    body = readJsonBody(req);
  } catch {
    res.status(400).json({ error: "El cuerpo de la petición no es JSON válido." });
    return;
  }

  const contents = toGeminiContents(body.messages);

  if (contents.length === 0) {
    res.status(400).json({ error: "No hay mensajes para enviar." });
    return;
  }

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents,
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 256,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(502).json({ error: "Gemini no pudo responder." });
      return;
    }

    const text = readGeminiText(data);

    if (!text) {
      res.status(502).json({ error: "Gemini devolvió una respuesta vacía." });
      return;
    }

    res.status(200).json({ text });
  } catch {
    res.status(502).json({ error: "No se pudo conectar con Gemini." });
  }
}
