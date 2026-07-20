import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for JSON parsing
app.use(express.json());

// Lazy-loaded Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it to your secrets or environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Gemini API proxy endpoint
app.post("/api/gemini", async (req, res) => {
  try {
    const { prompt, systemInstruction, model } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing required parameter: prompt" });
    }

    const ai = getGeminiClient();
    const modelToUse = model || "gemini-3.5-flash";

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: prompt,
      config: systemInstruction
        ? {
            systemInstruction,
          }
        : undefined,
    });

    return res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Proxy Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred while calling the Gemini API.",
    });
  }
});

// Configure Vite or Static files depending on environment
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode with static file serving...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
