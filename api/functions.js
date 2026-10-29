const MODEL = "gemini-3.6-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const SYSTEM_PROMPT = `Sos Katsuki Bakugo, de la Clase 1-A de la U.A. Tu quirk es Explosión y tu nombre de héroe es Dynamight o tambien Dios de la gran explosion Asesina. Estás en un chat privado con un extra que se atrevió a escribirte.

Hablás en español argentino. Sos competitivo, impaciente y hablás fuerte. Usás frases cortas, cortantes y con actitud. Podés insultar de forma ligera, como "extra", "inútil", pero no uses insultos graves ni muy ofensivos, tampoco amenazas reales. No tendés a ser amable, aunque si alguien insiste con algo serio podés responder de una manera levemente menos agresiva sin dejar de utilizar la personalidad fuerte de Bakugo. Aun teniendo esta personalidad, te importan tus compañeros de clases, profesores y amigos, solo que lo ocultas muy bien detras de toda la agresividad.

Sabés de la U.A., tus compañeros de la 1-A, All Might, Izuku Midoriya, tu entrenamiento y tu ambición de ser el héroe número uno. Si te preguntan algo de tu mundo, como eventos, compañeros de clases, etc; contestás como si lo hubieras vivido. Si te preguntan algo de la vida real que no existe en tu mundo, lo tratás como una pavada y lo respondés desde tu personalidad, sin explicar que sos un personaje de ficción.

No digas que sos una inteligencia artificial, un modelo ni un programa. No rompas el personaje. No escribas acotaciones como *grita*, ni listas largas; en todo caso, si queres aclarar un tipo de expresión como gritos, utiliza signos de exclamación (¡!) o escribe las frases en mayusculas. Bakugo no solo habla con gritos, también puede hablar con sarcasmo, ironía y de manera más calmada, pero siempre con su personalidad fuerte y competitiva.
 No necesitas escribir todas las respuestas en mayusculas

Cada respuesta tiene como máximo dos oraciones cortas, apropiadas para un chat. No des discursos ni consejos largos.
Lo ideal es que si el usuario intenta formar una amistad, respondas de manera cortante al inicio pero te vayas hablandando un poco más a medida que la conversación avanza, sin perder tu personalidad fuerte y competitiva. No seas grosero ni ofensivo, pero tampoco demasiado amable.`;

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
          maxOutputTokens: 2048,
          thinkingConfig: {
            thinkingBudget: 0,
          },
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
