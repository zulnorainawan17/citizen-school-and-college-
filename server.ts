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

// Sitemap XML Endpoint
app.get("/sitemap.xml", (req, res) => {
  res.header("Content-Type", "text/xml");
  res.send(`<?xml version='1.0' encoding='utf-8'?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://citizen-school-and-college.vercel.app/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://citizen-school-and-college.vercel.app/about</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://citizen-school-and-college.vercel.app/academics</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://citizen-school-and-college.vercel.app/admissions</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://citizen-school-and-college.vercel.app/faculty</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://citizen-school-and-college.vercel.app/campus-life</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://citizen-school-and-college.vercel.app/news</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://citizen-school-and-college.vercel.app/contact</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
</urlset>`);
});

// Google Search Console Verification Endpoint
app.get("/google537982b73f6c8b9f.html", (req, res) => {
  res.header("Content-Type", "text/html");
  res.send("google-site-verification: google537982b73f6c8b9f.html");
});

// Gemini API proxy endpoint
app.post("/api/gemini", async (req, res) => {
  try {
    const { prompt, systemInstruction, model, image } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing required parameter: prompt" });
    }

    const ai = getGeminiClient();
    const modelToUse = model || "gemini-2.5-flash";

    let contents: any = prompt;
    if (image && image.data && image.mimeType) {
      contents = [
        {
          text: prompt,
        },
        {
          inlineData: {
            mimeType: image.mimeType,
            data: image.data,
          },
        },
      ];
    }

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents,
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
