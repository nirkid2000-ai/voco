import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const {
      word,
      meaning = "",
      language,
      nativeLanguage,
      partOfSpeech = "",
    } = req.body;

    if (!word || typeof word !== "string") {
      return res.status(400).json({ error: "Missing word" });
    }

    const userLanguage = nativeLanguage === "he" ? "hebrew" : "english";

    const prompt = `
Create one short, natural example sentence for a language-learning app, and a translation in the user native language.

Word: "${word}"
Meaning: "${meaning}"
Language: "${language}"
Part of speech: "${partOfSpeech}"
User native language: "${userLanguage}"

Rules:
- Use the target word exactly once
- The sentence must sound natural
- Match the given meaning exactly
- Avoid strange, poetic, dramatic, or uncommon situations
- Keep the sentence short and clear
- Generate a new original random sentence each time
- Prefer common everyday situations but not too banal
- Make the translation sound natural, not word-for-word
- Return only valid JSON in this shape:

{
  "sentence": "...",
  "translation": "..."
}
`;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    const cleaned = response.output_text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      message: error.message,
    });
  }
}
