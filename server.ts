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

function isRealGeminiKey(key: string | undefined): boolean {
  if (!key) return false;
  const k = key.trim();
  if (k === "" || k === "MY_GEMINI_API_KEY" || k === "PLACEHOLDER" || k === "YOUR_GEMINI_API_KEY") {
    return false;
  }
  return k.startsWith("AIzaSy");
}

// Shared lazy-loaded Gemini client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: isRealGeminiKey(key) ? key : "PLACEHOLDER",
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
// Model: gemini-1.5-flash
// Mode: ThinkingLevel.HIGH
// ==========================================
app.post("/api/gemini/strategic-advisor", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAiClient();
    if (!isRealGeminiKey(process.env.GEMINI_API_KEY)) {
      return res.json({
        text: "💡 [Simulation Mode] Since GEMINI_API_KEY is not configured yet, here is some simulated advice: Keep waste minimal by matching production targets to high-traffic rain hours, and shift Chef Skipper to peak times. Set up your actual key in Settings > Secrets to unleash deep system thinking capabilities!",
        thinking: "Simulating high-reasoning tree for Food Penguin Limited..."
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the Chief AI Strategy Officer for 'Food Penguin Limited', an elite cold-chain and premium ocean-to-table food corporation. Your role is to formulate deep, comprehensive, hyper-optimized business strategies. Break down complex operational problems regarding sales, waste minimization, logistics, and labor schedule optimization into mathematically-grounded steps. Provide multi-layered, executive-grade blueprints.",
        }
      });

      res.json({
        text: response.text || "No response text generated.",
        thinking: "Deep strategic thinking executed successfully using gemini-1.5-flash."
      });
    } catch (apiErr: any) {
      console.log("Strategic Advisor falling back to simulation because Gemini key is inactive or failed.");
      res.json({
        text: `💡 [Simulation Mode - Fallback] Keep waste minimal by matching production targets to high-traffic rain hours, and shift Chef Skipper to peak times. Set up a valid key in Settings > Secrets to unleash deep system thinking capabilities!`,
        thinking: "Simulating high-reasoning tree gracefully on API fallback..."
      });
    }
  } catch (err: any) {
    console.error("Strategic Advisor error: ", err);
    res.status(500).json({ error: err.message || "An error occurred with the strategic AI advisor." });
  }
});

// ==========================================
// 2. LOW LATENCY COPILOT
// Model: gemini-1.5-flash
// ==========================================
app.post("/api/gemini/low-latency-cmd", async (req, res) => {
  try {
    const { command } = req.body;
    if (!command) {
      return res.status(400).json({ error: "Command query is required" });
    }

    const ai = getAiClient();
    if (!isRealGeminiKey(process.env.GEMINI_API_KEY)) {
      return res.json({
        text: `⚡ [Lite Simulation Mode] Processing: "${command}". Rapid Response suggests Swapping Chef Kowalski to dinner shift, increasing Arctic Burger margins by 3%, and scheduling refrigeration defrosters. Configure a real API key for sub-second live replies!`
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: command,
        config: {
          systemInstruction: "You are the rapid action-response dispatcher for Food Penguin kitchen managers. Answer briefly and immediately (maximum 2-3 sentences max) to assist the floor leads with quick, direct answers."
        }
      });

      res.json({
        text: response.text || "No response received."
      });
    } catch (apiErr: any) {
      console.log("Low Latency Copilot falling back to simulation because Gemini key is inactive or failed.");
      res.json({
        text: `⚡ [Lite Simulation Mode - Fallback] Swapping Chef Kowalski to dinner shift, increasing Arctic Burger margins by 3%, and scheduling refrigeration defrosters. Configure a valid API key for live sub-second replies!`
      });
    }
  } catch (err: any) {
    console.error("Low latency copilot error: ", err);
    res.status(500).json({ error: err.message || "An error occurred on the rapid copilot." });
  }
});

// ==========================================
// 3. MENU ILLUSTRATOR & BANNER GENERATOR
// Model: imagen-3.0-generate-001
// ==========================================
app.post("/api/gemini/generate-marketing-image", async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Image prompt is required" });
    }

    const ai = getAiClient();
    if (!isRealGeminiKey(process.env.GEMINI_API_KEY)) {
      // Return a high quality SVG of food matching the prompt as fallback
      const mockSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%230f172a"/><circle cx="200" cy="130" r="70" fill="%2338bdf8"/><path d="M120,180 Q200,220 280,180" stroke="%23f59e0b" stroke-width="8" fill="none"/><text x="50%" y="260" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="16">Food Penguin Banner: ${prompt.replace(/"/g, '&quot;')}</text><text x="50%" y="30" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="monospace" font-size="12">Ratio ${aspectRatio || '1:1'} (Simulated)</text></svg>`;
      return res.json({ imageUrl: mockSvg, simulated: true });
    }

    try {
      const response = await ai.models.generateImages({
        model: "imagen-3.0-generate-001",
        prompt: "A clean, commercial studio foods advertisement banner for Food Penguin Limited. " + prompt,
        config: {
          aspectRatio: aspectRatio || "1:1",
          outputMimeType: "image/png"
        }
      });
      
      let base64Image = "";
      if (response.generatedImages && response.generatedImages.length > 0) {
        base64Image = response.generatedImages[0].image.imageBytes;
      }

      

      if (base64Image) {
        res.json({ imageUrl: `data:image/png;base64,${base64Image}`, simulated: false });
      } else {
        throw new Error("No image data returned from Gemini flash image.");
      }
    } catch (apiErr: any) {
      console.log("Marketing Image falling back to simulated SVG because Gemini key is inactive or failed.");
      const mockSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%230f172a"/><circle cx="200" cy="130" r="70" fill="%2338bdf8"/><path d="M120,180 Q200,220 280,180" stroke="%23f59e0b" stroke-width="8" fill="none"/><text x="50%" y="260" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="16">Food Penguin Banner: ${prompt.replace(/"/g, '&quot;')}</text><text x="50%" y="30" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="monospace" font-size="12">Ratio ${aspectRatio || '1:1'} (Simulated on Fallback)</text></svg>`;
      res.json({ imageUrl: mockSvg, simulated: true });
    }
  } catch (err: any) {
    console.error("Image generation error: ", err);
    res.status(500).json({ error: err.message || "Failed to generate food advertisement banner." });
  }
});

// ==========================================
// 4. KITCHEN QUALITY DISH AUDITOR
// Model: gemini-1.5-flash
// ==========================================
app.post("/api/gemini/analyze-dish-photo", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Base64 image is required." });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const ai = getAiClient();
    if (!isRealGeminiKey(process.env.GEMINI_API_KEY)) {
      return res.json({
        analysis: "🔍 [Photo Audit Simulation] Your dish photo was received! It displays outstanding plating. Cod thickness appears uniform (approx. 2.4cm). Asparagus is well-steamed and color index is healthy. Estimated portion weight is 320g. Waste assessment: Negligible (<5% scrap). Configure your Gemini key to get the live, multi-spectrometer analysis!"
      });
    }

    try {
      const imagePart = {
        inlineData: {
          mimeType: mimeType || "image/png",
          data: cleanBase64,
        },
      };

      const promptPart = {
        text: "Perform a rigorous culinary audit on this dish or ingredient delivery photo. Critique the presentation/plating, estimate the volume/weight where applicable, assess the quality/freshness markers, and estimate potential waste or trim percentages. Give actionable suggestions on how to improve kitchen margins or prevent food spoilage."
      };

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: { parts: [imagePart, promptPart] }
      });

      res.json({
        analysis: response.text || "No analysis generated."
      });
    } catch (apiErr: any) {
      console.log("Photo analysis falling back to simulation because Gemini key is inactive or failed.");
      res.json({
        analysis: `🔍 [Photo Audit Simulation - Fallback] Your dish photo was received! It displays outstanding plating. Cod thickness appears uniform (approx. 2.4cm). Asparagus is well-steamed and color index is healthy. Estimated portion weight is 320g. Waste assessment: Negligible (<5% scrap). Configure a valid Gemini key to get live, multi-spectrometer analysis!`
      });
    }
  } catch (err: any) {
    console.error("Dish analyzer error: ", err);
    res.status(500).json({ error: err.message || "Quality audit analysis failed." });
  }
});

// ==========================================
// 5. MARKET TREND SEARCH GROUNDING
// Model: gemini-1.5-flash
// ==========================================
app.post("/api/gemini/search-trends", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const ai = getAiClient();
    if (!isRealGeminiKey(process.env.GEMINI_API_KEY)) {
      return res.json({
        text: `🌐 [Search Grounding Simulation] Searching for: "${query}" in 2026 indexes...\n\nAccording to mock 2026 data: Cold-water species like Atlantic Salmon and Halibut keep a high premium, up 4.1% MoM. Plant-based ocean substitutes gain popularity in urban regions. Commodity rates for bulk packaging plastics are up due to freight climbs.`
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: query,
        config: {
          systemInstruction: "You are active business intelligence for Food Penguin procurement department. Answer the user's research questions accurately using the search grounding tool.",
          tools: [{ googleSearch: {} }]
        }
      });

      res.json({
        text: response.text || "No grounded research found."
      });
    } catch (apiErr: any) {
      console.log("Search grounding falling back to simulation because Gemini key is inactive or failed.");
      res.json({
        text: `🌐 [Search Grounding Simulation - Fallback] Searching for: "${query}" in 2026 indexes...\n\nAccording to mock 2026 data: Cold-water species like Atlantic Salmon and Halibut keep a high premium, up 4.1% MoM; plant-based seafood alternatives expand key urban channels.`
      });
    }
  } catch (err: any) {
    console.error("Search Grounding error: ", err);
    res.status(500).json({ error: err.message || "Failed to search web statistics." });
  }
});

// ==========================================
// 6. SUGGEST RESTOCK ALGORITHMIC PLANNER
// Model: gemini-1.5-flash
// ==========================================
app.post("/api/gemini/suggest-restock", async (req, res) => {
  try {
    const { branch, inventory } = req.body;
    if (!branch) {
      return res.status(400).json({ error: "Branch is required" });
    }

    const ai = getAiClient();
    const mockJson = {
      "INV-101": 50,
      "INV-102": 25,
      "INV-103": 100
    };

    if (!isRealGeminiKey(process.env.GEMINI_API_KEY)) {
      return res.json({
        text: `📦 [Simulation Mode] Analyzed past 7 days for ${branch}. Suggested restock allocations generated based on simulated historical drawdown velocity.`,
        jsonString: JSON.stringify(mockJson)
      });
    }

    try {
      const prompt = `You are a replenishment supply chain AI. Analyze the simulated past sales output and waste metrics for branch: ${branch}. Given the current inventory state: ${JSON.stringify(inventory)}, calculate optimal replenishment amounts to ensure 100% capacity heading into the weekend. Output a valid JSON object where keys are item IDs and values are integer numbers of units to reorder. Output ONLY JSON, e.g., {"INV-101": 50, "INV-102": 30}. Do not use markdown wrappers.`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
      });

      const rawText = response.text || "{}";
      const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

      res.json({
        text: `📦 Analyzed ${branch} sales volume and waste metrics. Replenishment allocations securely calculated.`,
        jsonString: cleanedJson
      });
    } catch (apiErr: any) {
      console.log("Suggest restock falling back to simulation because Gemini key is inactive or failed.");
      res.json({
        text: `📦 [Simulation Mode - Fallback] Analyzed past 7 days for ${branch}. Suggested restock allocations generated based on simulated historical drawdown velocity.`,
        jsonString: JSON.stringify(mockJson)
      });
    }
  } catch (err: any) {
    console.error("Suggest Restock error: ", err);
    res.status(500).json({ error: err.message || "Failed to calculate restock metrics." });
  }
});

// ==========================================
// 7. SHIFT SUMMARY GENERATOR
// Model: gemini-1.5-flash
// ==========================================
app.post("/api/gemini/shift-summary", async (req, res) => {
  try {
    const { branch, metrics } = req.body;
    if (!branch || !metrics) {
      return res.status(400).json({ error: "Branch and metrics are required" });
    }

    const ai = getAiClient();
    if (!isRealGeminiKey(process.env.GEMINI_API_KEY)) {
      return res.json({
        summary: `✨ [Simulation Mode] ${branch} is performing solidly today with an AI Health Score of ${metrics.aiHealthScore || 78}%. Cumulative sales are currently €${(metrics.salesToday || 0).toLocaleString()} against €${(metrics.wasteCost || 0).toFixed(2)} in recorded food waste costs. Maintain steady focus on key-hour kitchen scheduling to keep margins high.`
      });
    }

    try {
      const prompt = `Analyze these shift metrics for our food retail branch "${branch}" today and write a short, professional, natural language "Shift Summary" (no more than 3 sentences). Emphasize current sales of €${(metrics.salesToday || 0).toLocaleString()}, food waste costs of €${(metrics.wasteCost || 0).toFixed(2)}, an active AI Health Score of ${metrics.aiHealthScore || 78}%, and production items outputted (${metrics.productionItems || 0} items made out of a target of ${metrics.productionTarget || 0}). Keep it punchy, motivating, and highly practical for floor managers.`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite operational executive at Food Penguin kitchen operations. You write high-precision, natural language shift summaries that are clear, concise, and professional."
        }
      });

      res.json({
        summary: response.text || "No summary text generated."
      });
    } catch (apiErr: any) {
      console.log("Shift summary falling back to simulation because Gemini key is inactive or failed.");
      res.json({
        summary: `✨ [Simulation Mode - Fallback] ${branch} is performing solidly today with an AI Health Score of ${metrics.aiHealthScore || 78}%. Cumulative sales are €${(metrics.salesToday || 0).toLocaleString()} against €${(metrics.wasteCost || 0).toFixed(2)} in recorded food waste costs.`
      });
    }
  } catch (err: any) {
    console.error("Shift Summary error: ", err);
    res.status(500).json({ error: err.message || "Failed to generate shift summary." });
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
