import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: "Say hello in one word",
    });

    res.status(200).json({
      success: true,
      answer: response.output_text,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
