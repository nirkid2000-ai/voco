import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { word, meaning = "", language, nativeLanguage } = req.body;

    if (!word || typeof word !== "string") {
      return res.status(400).json({ error: "Missing word" });
    }

    const userLanguage = nativeLanguage === "he" ? "hebrew" : "english";

    const prompt = `
You are a creative language-learning assistant.
Your goal is to help me remember vocabulary words using strong, memorable associations.

Word: "${word}"
Meaning: "${meaning}"
Language: "${language}"
User target language: "${userLanguage}"

Instructions:
Generate ONE memory aid in the user target language.
Choose the most effective method:
a) Sound-based mnemonic
b) Vivid visual story
c) Logical/meaning-based explanation

The memory aid must:
- Be up to 180 characters
- Be practical and effective
- Be easy to visualize
- Have a clear connection to the word’s sound, meaning, or both
- Return valid JSON only in this shape:

{
  "tip": "..."
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
