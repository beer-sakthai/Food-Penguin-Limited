import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  getStrategicAdvice,
  getLowLatencyCommand,
  generateMarketingImage,
  analyzeDishPhoto,
  searchTrends,
  suggestRestock,
  getShiftSummary,
  getSustainabilityReport,
  getFinanceAnalysis,
  getAiClient,
  isRealGeminiKey
} from "./src/ai/client";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up larger limits for uploading base64 images for food audits
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

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
    const result = await getStrategicAdvice(prompt);
    res.json(result);
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
    const result = await getLowLatencyCommand(command);
    res.json(result);
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
    const result = await generateMarketingImage(prompt, aspectRatio);
    res.json(result);
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
    const result = await analyzeDishPhoto(imageBase64, mimeType);
    res.json(result);
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
          systemInstruction: "You are Jules, the active business intelligence AI for Food Penguin procurement department. Answer the user's research questions accurately using the search grounding tool.",
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
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are Jules, the AI Strategy Officer. Act as a replenishment supply chain AI. Output strictly structured JSON.",
          temperature: 0.1
        }
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
          systemInstruction: "You are Jules, an elite operational executive at Food Penguin kitchen operations. You write high-precision, natural language shift summaries that are clear, concise, and professional."
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

  

// --- Energy/Sustainability Report API ---
app.post("/api/gemini/sustainability-report", async (req, res) => {
  const ai = getAiClient();
  if (!ai) {
    return res.status(500).json({ error: "Gemini client not initialized" });
  }

  const { data, totalEnergy, totalVolume, avgWhPerUnit } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Analyze the following oven energy usage vs production volume data for this shift:
Total Energy: ${totalEnergy} kWh
Total Volume: ${totalVolume} units
Average Energy per Unit: ${avgWhPerUnit} Wh

Data points (Hour - Energy - Volume - Wh/Unit):
${data.map(d => `${d.time}: ${d.energy}kWh for ${d.volume} units (${d.efficiency} Wh/unit)`).join('\n')}

Please act as Jules, the Chief AI Strategy Officer for 'Food Penguin Limited'. Provide a highly concise, executive-level ESG and sustainability overview. Propose immediate, actionable operational tweaks to lower energy consumption during low-production hours, ensure minimum energy waste, and maintain our premium green standards. Limit to 3 bullet points. Formatting: bold headers, very crisp.`
            }
          ]
        }
      ],
      config: {
        systemInstruction: "You are Jules, the Chief AI Strategy Officer for 'Food Penguin Limited', an elite cold-chain and premium ocean-to-table food corporation. You provide sharp, concise, actionable ESG insights for floor managers.",
        temperature: 0.3
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error (sustainability-report):", error);
    res.status(500).json({ error: "Failed to generate sustainability report." });
  }
});



// --- Finance P&L Analysis API ---
app.post("/api/gemini/finance-analysis", async (req, res) => {
  const ai = getAiClient();
  if (!ai) {
    return res.status(500).json({ error: "Gemini client not initialized" });
  }

  const { plan, actual } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Analyze the structural variance between our Target Plan and Actual Use percentages.

Plan Structure:
${plan.map(p => `${p.name}: ${p.value}%`).join(', ')}

Actual Use Structure:
${actual.map(a => `${a.name}: ${a.value}%`).join(', ')}

As Jules, the AI Strategy Officer for Food Penguin Limited, provide a concise financial insights brief explaining the margin erosion. Suggest 2 operational tweaks to get 'Actual Use' back aligned with 'Plan Structure'. Use bold headings, bullet points, and maintain an executive tone.`
            }
          ]
        }
      ],
      config: {
        systemInstruction: "You are Jules, the rigorous AI Strategy Officer for 'Food Penguin Limited'. You focus on driving efficiency, reducing waste, and recovering profit margins through data-driven operational tweaks.",
        temperature: 0.3
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error (finance-analysis):", error);
    res.status(500).json({ error: "Failed to generate finance report." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Food Penguin Express Server running on HTTP port ${PORT}`);
  });
};

startServer();
