const API_URL = "https://libretranslate.com/translate";

const cache = {};

export async function translateText(text, targetLang) {
  if (!text || targetLang === "en") return text;

  const key = `${text}_${targetLang}`;
  if (cache[key]) return cache[key];

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "en",
        target: targetLang,
        format: "text",
      }),
    });

    const data = await res.json();
    cache[key] = data.translatedText;
    return data.translatedText;
  } catch {
    return text;
  }
}
