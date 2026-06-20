import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, GenerateContentResponse, GenerateContentRequest } from "@google/genai";
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

/**
 * Configuration for a generic Gemini API handler.
 */
interface GeminiHandlerConfig {
  endpointName: string;
  model: string;
  validator: (body: any) => string | null;
  simulationResponse: (body: any) => object;
  buildContents: (body: any) => GenerateContentRequest['contents'];
  buildConfig?: (body: any) => GenerateContentRequest['config'];
  processResponse: (response: GenerateContentResponse, body: any) => object;
}

/**
 * A higher-order function that creates an Express request handler for a Gemini API endpoint.
 * It abstracts away validation, simulation mode, error handling, and the core API call.
 * @param config - The specific configuration for this Gemini endpoint.
 * @returns An async Express request handler.
 */
function createGeminiHandler(config: GeminiHandlerConfig) {
  return async (req: Request, res: Response) => {
    try {
      const validationError = config.validator(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
        return res.json(config.simulationResponse(req.body));
      }

      const ai = getAiClient();
      const contents = config.buildContents(req.body);
      const modelConfig = config.buildConfig ? config.buildConfig(req.body) : {};

      const response = await ai.models.generateContent({
        model: config.model,
        contents,
        config: modelConfig,
      });

      const finalResponse = config.processResponse(response, req.body);
      res.json(finalResponse);

    } catch (err: any) {
      console.error(`${config.endpointName} error: `, err);
      res.status(500).json({ error: err.message || `An error occurred with the ${config.endpointName}.` });
    }
  };
}

// ==========================================
// API Endpoint Definitions
// ==========================================

app.post("/api/gemini/strategic-advisor", createGeminiHandler({
  endpointName: "Strategic Advisor",
  model: "gemini-3.1-pro-preview",
  validator: (body) => body.prompt ? null : "Prompt is required",
  simulationResponse: () => ({
    text: "💡 [Simulation Mode] Since GEMINI_API_KEY is not configured yet, here is some simulated advice: Keep waste minimal by matching nigiri and roll production to peak dinner-rush hours, rotate sushi-grade tuna stock FIFO to protect freshness, and shift Itamae Skipper to the omakase counter at peak times. Set up your actual key in Settings > Secrets to unleash deep system thinking capabilities!",
    thinking: "Simulating high-reasoning tree for Food Penguin Limited sushi operations..."
  }),
  buildContents: (body) => body.prompt,
  buildConfig: () => ({
    systemInstruction: "You are the Chief AI Strategy Officer for 'Food Penguin Limited', an elite premium sushi production and cold-chain seafood corporation. Your role is to formulate deep, comprehensive, hyper-optimized business strategies for a high-volume sushi operation. Break down complex operational problems regarding sushi sales, fish freshness and waste minimization, sushi-grade seafood logistics and sourcing, and itamae labor schedule optimization into mathematically-grounded steps. Provide multi-layered, executive-grade blueprints.",
    thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
  }),
  processResponse: (response) => ({
    text: response.text || "No response text generated.",
    thinking: "Deep strategic thinking executed successfully using gemini-3.1-pro-preview."
  }),
}));

app.post("/api/gemini/low-latency-cmd", createGeminiHandler({
  endpointName: "Low-Latency Copilot",
  model: "gemini-3.1-flash-lite",
  validator: (body) => body.command ? null : "Command query is required",
  simulationResponse: (body) => ({
    text: `⚡ [Lite Simulation Mode] Processing: "${body.command}". Rapid Response suggests swapping Itamae Kowalski to the dinner sushi rush, raising Dragon Roll margins by 3%, and re-icing the neta display case. Configure a real API key for sub-second live replies!`
  }),
  buildContents: (body) => body.command,
  buildConfig: () => ({
    systemInstruction: "You are the rapid action-response dispatcher for Food Penguin sushi bar managers. Answer briefly and immediately (maximum 2-3 sentences max) to assist the itamae and floor leads with quick, direct answers about sushi prep, neta freshness, and service."
  }),
  processResponse: (response) => ({ text: response.text || "No response received." }),
}));

app.post("/api/gemini/generate-marketing-image", createGeminiHandler({
  endpointName: "Marketing Image Generator",
  model: "gemini-2.5-flash-image",
  validator: (body) => body.prompt ? null : "Image prompt is required",
  simulationResponse: (body) => {
    const mockSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%230f172a"/><circle cx="200" cy="130" r="70" fill="%2338bdf8"/><path d="M120,180 Q200,220 280,180" stroke="%23f59e0b" stroke-width="8" fill="none"/><text x="50%" y="260" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="16">Food Penguin Banner: ${body.prompt.replace(/"/g, '&quot;')}</text><text x="50%" y="30" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="monospace" font-size="12">Ratio ${body.aspectRatio || '1:1'} (Simulated)</text></svg>`;
    return { imageUrl: mockSvg, simulated: true };
  },
  buildContents: (body) => ({
    parts: [{ text: `A clean, commercial studio sushi advertisement banner for Food Penguin Limited, a premium sushi brand. Emphasize fresh nigiri, maki rolls and sashimi with appetizing styling. ${body.prompt}` }]
  }),
  buildConfig: (body) => ({
    imageConfig: { aspectRatio: body.aspectRatio || "1:1" }
  }),
  processResponse: (response) => {
    let base64Image = "";
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }
    if (!base64Image) throw new Error("No image data returned from Gemini flash image.");
    return { imageUrl: `data:image/png;base64,${base64Image}`, simulated: false };
  },
}));

app.post("/api/gemini/analyze-dish-photo", createGeminiHandler({
  endpointName: "Dish Auditor",
  model: "gemini-3.1-pro-preview",
  validator: (body) => body.imageBase64 ? null : "Base64 image is required.",
  simulationResponse: () => ({
    analysis: "🔍 [Photo Audit Simulation] Your sushi photo was received! It displays outstanding plating. Salmon neta slices appear uniform (approx. 0.8cm, clean 45° angle cut). Rice ball (shari) density looks consistent and the nori is crisp, not damp. Estimated portion weight is 180g. Freshness markers strong, no oxidation banding on the fish. Waste assessment: Negligible (<5% trim). Configure your Gemini key to get the live, multi-spectrometer analysis!"
  }),
  buildContents: (body) => {
    const cleanBase64 = body.imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imagePart = { inlineData: { mimeType: body.mimeType || "image/png", data: cleanBase64 } };
    const promptPart = { text: "Perform a rigorous sushi culinary audit on this sushi dish or fish delivery photo. Critique the neta slice cuts, rice (shari) shaping and density, nori crispness, and overall plating. Estimate the volume/weight where applicable, assess sushi-grade freshness markers (color, sheen, oxidation), and estimate potential waste or trim percentages on the fish. Give actionable suggestions on how to improve sushi bar margins or prevent seafood spoilage." };
    return { parts: [imagePart, promptPart] };
  },
  processResponse: (response) => ({ analysis: response.text || "No analysis generated." }),
}));

app.post("/api/gemini/search-trends", createGeminiHandler({
  endpointName: "Search Trends",
  model: "gemini-3.5-flash",
  validator: (body) => body.query ? null : "Query is required",
  simulationResponse: (body) => ({
    text: `🌐 [Search Grounding Simulation] Searching for: "${body.query}" in 2026 indexes...\n\nAccording to mock 2026 data: Sushi-grade Bluefin Tuna and Norwegian Salmon hold a high premium, up 4.1% MoM amid tightening quotas. Demand for Koshihikari sushi rice and nori is rising as sushi consumption grows in urban regions. Bulk wasabi and rice-vinegar rates are up slightly due to freight climbs.`
  }),
  buildContents: (body) => body.query,
  buildConfig: () => ({
    systemInstruction: "You are active business intelligence for the Food Penguin procurement department. Answer the user's research questions accurately using the search grounding tool, focusing on sushi-grade seafood, rice, nori and condiment markets.",
    tools: [{ googleSearch: {} }]
  }),
  processResponse: (response) => ({ text: response.text || "No grounded research found." }),
}));

app.post("/api/gemini/summarize-sales", createGeminiHandler({
  endpointName: "Sales Report Summarizer",
  model: "gemini-3.5-flash",
  validator: (body) => (body.orders && Array.isArray(body.orders) && body.orders.length > 0) ? null : "A non-empty array of orders is required.",
  simulationResponse: () => ({
    summary: "📈 [Sales Summary Simulation] Analysis of today's sales data reveals strong performance in 'Nigiri' and 'Signature Rolls' categories, contributing to over 60% of total revenue. A significant sales spike was observed around 19:00 UTC. Recommendation: Increase prep for Dragon Rolls during the evening rush. Configure your API key for a live, detailed breakdown."
  }),
  buildContents: (body) => {
    const prompt = `Please analyze the following daily sales data (JSON format) and provide a summary:\n\n${JSON.stringify(body.orders, null, 2)}`;
    return prompt;
  },
  buildConfig: () => ({
    systemInstruction: "You are a senior financial analyst for Food Penguin Limited. Your task is to analyze a JSON array of daily sales orders and provide a concise, insightful summary. Focus on total revenue, sales by category, peak hours, and any notable trends or outliers. Present the summary in clear, professional language with bullet points."
  }),
  processResponse: (response) => ({
    summary: response.text || "No summary could be generated."
  }),
}));

// Serve static compiled UI or route to Vite dev-server (SPA mode)
const startServer = async () => {
  try {
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
  } catch (err: any) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
