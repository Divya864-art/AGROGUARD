const API_KEY = "AIzaSyAOBBjRelTU9FTb1QZXxAKpOHVzqkIKpNs";
const MODEL = "models/gemini-2.5-flash-lite";

export const askGemini = async (question) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `
You are an agriculture assistant for farmers.

RULES:
- Give SHORT answers (5–6 lines max)
- Do NOT explain unless asked
- Use simple farmer-friendly language

Farmer question:
${question}

Respond with:
- Fertilizer / pesticide name
- Dosage
- One short tip
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "❌ No response received"
    );
  } catch (error) {
    console.error(error);
    return "❌ Something went wrong. Try again.";
  }
};
