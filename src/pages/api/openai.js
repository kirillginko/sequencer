import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { prompt } = req.body;

  try {
    // Correct the API call to OpenAI
    const response = await openai.createImage({
      prompt: prompt,
      n: 1, // number of images to generate
      size: "1024x1024", // image size
    });

    const imageUrl = response.data.data[0].url; // URL of generated image
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error(
      "OpenAI API Error:",
      error.response?.data || error.message || error
    );
    res.status(500).json({
      message: "Something went wrong",
      error: error.response?.data || error.message,
    });
  }
}
