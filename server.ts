import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up larger limits for uploading base64 images for food audits
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// Shared lazy-loaded Gemini client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not set in environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "PLACEHOLDER",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ==========================================
// 1. STRATEGIC EXECUTIVE THINKER
// Model: gemini-3.1-pro-preview
// Mode: ThinkingLevel.HIGH
// ==========================================
app.post("/api/gemini/strategic-advisor", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAiClient();
    if (process.env.GEMINI_API_KEY === undefined || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      return res.json({
        text: "💡 [Simulation Mode] Since GEMINI_API_KEY is not configured yet, here is some simulated advice: Keep waste minimal by matching nigiri and roll production to peak dinner-rush hours, rotate sushi-grade tuna stock FIFO to protect freshness, and shift Itamae Skipper to the omakase counter at peak times. Set up your actual key in Settings > Secrets to unleash deep system thinking capabilities!",
        thinking: "Simulating high-reasoning tree for Food Penguin Limited sushi operations..."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are the Chief AI Strategy Officer for 'Food Penguin Limited', an elite premium sushi production and cold-chain seafood corporation. Your role is to formulate deep, comprehensive, hyper-optimized business strategies for a high-volume sushi operation. Break down complex operational problems regarding sushi sales, fish freshness and waste minimization, sushi-grade seafood logistics and sourcing, and itamae labor schedule optimization into mathematically-grounded steps. Provide multi-layered, executive-grade blueprints.",
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH
        }
      }
    });

    res.json({
      text: response.text || "No response text generated.",
      thinking: "Deep strategic thinking executed successfully using gemini-3.1-pro-preview."
    });
  } catch (err: any) {
    console.error("Strategic Advisor error: ", err);
    res.status(500).json({ error: err.message || "An error occurred with the strategic AI advisor." });
  }
});

// ==========================================
// 2. LOW LATENCY COPILOT
// Model: gemini-3.1-flash-lite
// ==========================================
app.post("/api/gemini/low-latency-cmd", async (req, res) => {
  try {
    const { command } = req.body;
    if (!command) {
      return res.status(400).json({ error: "Command query is required" });
    }

    const ai = getAiClient();
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      return res.json({
        text: `⚡ [Lite Simulation Mode] Processing: "${command}". Rapid Response suggests swapping Itamae Kowalski to the dinner sushi rush, raising Dragon Roll margins by 3%, and re-icing the neta display case. Configure a real API key for sub-second live replies!`
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: command,
      config: {
        systemInstruction: "You are the rapid action-response dispatcher for Food Penguin sushi bar managers. Answer briefly and immediately (maximum 2-3 sentences max) to assist the itamae and floor leads with quick, direct answers about sushi prep, neta freshness, and service."
      }
    });

    res.json({
      text: response.text || "No response received."
    });
  } catch (err: any) {
    console.error("Low latency copilot error: ", err);
    res.status(500).json({ error: err.message || "An error occurred on the rapid copilot." });
  }
});

// ==========================================
// 3. MENU ILLUSTRATOR & BANNER GENERATOR
// Model: gemini-2.5-flash-image
// ==========================================
app.post("/api/gemini/generate-marketing-image", async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Image prompt is required" });
    }

    const ai = getAiClient();
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      // Return a high quality SVG of food matching the prompt as fallback
      const mockSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%230f172a"/><circle cx="200" cy="130" r="70" fill="%2338bdf8"/><path d="M120,180 Q200,220 280,180" stroke="%23f59e0b" stroke-width="8" fill="none"/><text x="50%" y="260" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="16">Food Penguin Banner: ${prompt.replace(/"/g, '&quot;')}</text><text x="50%" y="30" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="monospace" font-size="12">Ratio ${aspectRatio || '1:1'} (Simulated)</text></svg>`;
      return res.json({ imageUrl: mockSvg, simulated: true });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: `A clean, commercial studio sushi advertisement banner for Food Penguin Limited, a premium sushi brand. Emphasize fresh nigiri, maki rolls and sashimi with appetizing styling. ${prompt}` }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || "1:1"
        }
      }
    });

    let base64Image = "";
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (base64Image) {
      res.json({ imageUrl: `data:image/png;base64,${base64Image}`, simulated: false });
    } else {
      throw new Error("No image data returned from Gemini flash image.");
    }
  } catch (err: any) {
    console.error("Image generation error: ", err);
    res.status(500).json({ error: err.message || "Failed to generate food advertisement banner." });
  }
});

// ==========================================
// 4. KITCHEN QUALITY DISH AUDITOR
// Model: gemini-3.1-pro-preview
// ==========================================
app.post("/api/gemini/analyze-dish-photo", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Base64 image is required." });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const ai = getAiClient();
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      return res.json({
        analysis: "🔍 [Photo Audit Simulation] Your sushi photo was received! It displays outstanding plating. Salmon neta slices appear uniform (approx. 0.8cm, clean 45° angle cut). Rice ball (shari) density looks consistent and the nori is crisp, not damp. Estimated portion weight is 180g. Freshness markers strong, no oxidation banding on the fish. Waste assessment: Negligible (<5% trim). Configure your Gemini key to get the live, multi-spectrometer analysis!"
      });
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/png",
        data: cleanBase64,
      },
    };

    const promptPart = {
      text: "Perform a rigorous sushi culinary audit on this sushi dish or fish delivery photo. Critique the neta slice cuts, rice (shari) shaping and density, nori crispness, and overall plating. Estimate the volume/weight where applicable, assess sushi-grade freshness markers (color, sheen, oxidation), and estimate potential waste or trim percentages on the fish. Give actionable suggestions on how to improve sushi bar margins or prevent seafood spoilage."
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: { parts: [imagePart, promptPart] }
    });

    res.json({
      analysis: response.text || "No analysis generated."
    });
  } catch (err: any) {
    console.error("Dish analyzer error: ", err);
    res.status(500).json({ error: err.message || "Quality audit analysis failed." });
  }
});

// ==========================================
// 5. MARKET TREND SEARCH GROUNDING
// Model: gemini-3.5-flash
// ==========================================
app.post("/api/gemini/search-trends", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const ai = getAiClient();
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      return res.json({
        text: `🌐 [Search Grounding Simulation] Searching for: "${query}" in 2026 indexes...\n\nAccording to mock 2026 data: Sushi-grade Bluefin Tuna and Norwegian Salmon hold a high premium, up 4.1% MoM amid tightening quotas. Demand for Koshihikari sushi rice and nori is rising as sushi consumption grows in urban regions. Bulk wasabi and rice-vinegar rates are up slightly due to freight climbs.`
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: query,
      config: {
        systemInstruction: "You are active business intelligence for the Food Penguin sushi procurement department. Answer the user's research questions accurately using the search grounding tool, focusing on sushi-grade seafood, rice, nori and condiment markets.",
        tools: [{ googleSearch: {} }]
      }
    });

    res.json({
      text: response.text || "No grounded research found."
    });
  } catch (err: any) {
    console.error("Search Grounding error: ", err);
    res.status(500).json({ error: err.message || "Failed to search web statistics." });
  }
});

// Serve static compiled UI or route to Vite dev-server (SPA mode)
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Food Penguin Express Server running on HTTP port ${PORT}`);
  });
};

startServer();
