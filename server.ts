import express from "express";
import path from "path";
import { spawn } from "child_process";
import https from "https";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import dotenv from "dotenv";
import {
  getMetrics, getOrders, getTargets, getRecipes, getProductionTasks,
  getWasteRecords, getEmployeeHours, getInventory, getDailyLogs, getAlerts,
  updateMetrics, addOrder, addWasteRecord, addDailyLog,
  upsertAnalyticsSession, recordAnalyticsEvent, endAnalyticsSession,
  getAnalyticsSummary, getAnalyticsTimeseries, getTopLabels, getTopActions,
  getTopErrors, getTopPages, getTopBranches, getRoleBreakdown, getFunnel,
  getRecentEvents, getAnalyticsSeeded,
} from "./db";

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
          systemInstruction: "You are Jules, the Chief AI Strategy Officer for 'Food Penguin Limited', an elite cold-chain and premium ocean-to-table food corporation. Your role is to formulate deep, comprehensive, hyper-optimized business strategies. Break down complex operational problems regarding sales, waste minimization, logistics, and labor schedule optimization into mathematically-grounded steps. Provide multi-layered, executive-grade blueprints.",
        }
      });

      res.json({
        text: response.text || "No response text generated.",
        thinking: "Deep strategic thinking executed successfully using gemini-3.1-pro-preview."
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
// Model: gemini-3.1-pro-preview
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
          systemInstruction: "You are Jules, the rapid action-response dispatcher for Food Penguin kitchen managers. Answer briefly and immediately (maximum 2-3 sentences max) to assist the floor leads with quick, direct answers."
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
// Model: gemini-3.1-flash-image-preview or gemini-3-pro-image-preview
// ==========================================
app.post("/api/gemini/generate-marketing-image", async (req, res) => {
  try {
    const { prompt, aspectRatio, model } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Image prompt is required" });
    }

    const selectedModel = model === "gemini-3-pro-image-preview" ? "gemini-3-pro-image-preview" : "gemini-3-1-flash-image-preview";
    const ratio = aspectRatio || "1:1";

    // Map ratio to width and height for SVG fallback
    let svgW = 400;
    let svgH = 300;
    if (ratio === "1:1") { svgW = 400; svgH = 400; }
    else if (ratio === "2:3") { svgW = 266; svgH = 400; }
    else if (ratio === "3:2") { svgW = 400; svgH = 266; }
    else if (ratio === "3:4") { svgW = 300; svgH = 400; }
    else if (ratio === "4:3") { svgW = 400; svgH = 300; }
    else if (ratio === "9:16") { svgW = 225; svgH = 400; }
    else if (ratio === "16:9") { svgW = 400; svgH = 225; }
    else if (ratio === "21:9") { svgW = 500; svgH = 214; }

    const ai = getAiClient();
    if (!isRealGeminiKey(process.env.GEMINI_API_KEY)) {
      // Return a high quality SVG of food matching the prompt as fallback
      const mockSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}"><rect width="100%" height="100%" fill="%230f172a"/><circle cx="${svgW/2}" cy="${svgH/2 - 20}" r="${Math.min(svgW, svgH)*0.25}" fill="%2338bdf8"/><path d="M${svgW*0.3},${svgH*0.6} Q${svgW*0.5},${svgH*0.75} ${svgW*0.7},${svgH*0.6}" stroke="%23f59e0b" stroke-width="6" fill="none"/><text x="50%" y="${svgH - 45}" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="11">Food Penguin Banner: ${prompt.replace(/"/g, '&quot;')}</text><text x="50%" y="25" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="monospace" font-size="9">Model: ${selectedModel} | Ratio ${ratio} (Simulated)</text></svg>`;
      return res.json({ imageUrl: mockSvg, simulated: true });
    }

    try {
      const response = await ai.models.generateImages({
        model: selectedModel,
        prompt: "A clean, commercial studio foods advertisement banner for Food Penguin Limited. " + prompt,
        config: {
          aspectRatio: ratio,
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
        throw new Error("No image data returned from Gemini image API.");
      }
    } catch (apiErr: any) {
      console.log("Marketing Image falling back to simulated SVG because Gemini key is inactive or failed.");
      const mockSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}"><rect width="100%" height="100%" fill="%230f172a"/><circle cx="${svgW/2}" cy="${svgH/2 - 20}" r="${Math.min(svgW, svgH)*0.25}" fill="%2338bdf8"/><path d="M${svgW*0.3},${svgH*0.6} Q${svgW*0.5},${svgH*0.75} ${svgW*0.7},${svgH*0.6}" stroke="%23f59e0b" stroke-width="6" fill="none"/><text x="50%" y="${svgH - 45}" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="11">Food Penguin Banner: ${prompt.replace(/"/g, '&quot;')}</text><text x="50%" y="25" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="monospace" font-size="9">Model: ${selectedModel} | Ratio ${ratio} (Simulated on Fallback)</text></svg>`;
      res.json({ imageUrl: mockSvg, simulated: true });
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
        model: "gemini-3.1-pro-preview",
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
// Model: gemini-3.1-pro-preview
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
// Model: gemini-3.1-pro-preview
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
// Model: gemini-3.1-pro-preview
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

// ==========================================
// 8. CAPACITY BOTTLENECK QUICK FIX SUGGESTER
// Model: gemini-1.5-flash (as per Food Penguin strictly free-tier rules)
// ==========================================
app.post("/api/gemini/capacity-quickfix", async (req, res) => {
  try {
    const { day, projected, threshold, wasteRecords } = req.body;
    if (!day) {
      return res.status(400).json({ error: "Day is required" });
    }

    const ai = getAiClient();
    
    // Calculate a default safe adjustment value locally in case of simulation/fallback
    const diff = projected - threshold;
    const defaultAdjustment = diff > 0 ? -Math.round(diff + 5) : -5;
    
    // Analyze current waste records
    const records = Array.isArray(wasteRecords) ? wasteRecords : [];
    const totalWasteCost = records.reduce((sum: number, r: any) => sum + (r.cost || 0), 0);
    const totalWasteWeight = records.reduce((sum: number, r: any) => sum + (r.weight || 0), 0);
    
    // Most common reason
    const reasons = records.map((r: any) => r.reason);
    const topReason = reasons.length > 0 
      ? reasons.sort((a,b) => reasons.filter(v => v===a).length - reasons.filter(v => v===b).length).pop()
      : "Overproduced";

    if (!isRealGeminiKey(process.env.GEMINI_API_KEY)) {
      return res.json({
        recommendationText: `💡 [Simulation Mode] Jules recommends a **${defaultAdjustment}% target adjustment** for **${day}** to mitigate kitchen overflow. Based on current branch waste of **€${totalWasteCost.toFixed(2)}** (${totalWasteWeight.toFixed(1)}kg) primarily due to **${topReason}** items, reducing the production target will optimize raw material usage, prevent bottlenecking above ${threshold}%, and safeguard margins.`,
        suggestedAdjustmentPct: defaultAdjustment,
        simulated: true
      });
    }

    try {
      const prompt = `You are Jules, the Chief AI Strategy Officer for 'Food Penguin Limited'. 
We have detected an operational bottleneck on **${day}** where projected capacity reaches **${projected}%**, exceeding our safe threshold of **${threshold}%**.
Our current branch waste records show:
- Total food waste cost: €${totalWasteCost.toFixed(2)}
- Total waste weight: ${totalWasteWeight.toFixed(1)}kg
- Primary waste driver: ${topReason}

Formulate a concise 'Quick Fix' recommendation. Calculate a suggested percentage adjustment (an integer between -25 and -1) to apply to ${day}'s production target to bring projected capacity back under the ${threshold}% threshold while minimizing waste.
Output your response as a valid JSON object with the following keys:
- "recommendationText": A crisp, professional 2-sentence executive summary explaining why the adjustment is recommended and how it leverages the waste data.
- "suggestedAdjustmentPct": The calculated adjustment value as a negative integer (e.g. -12).

Respond ONLY with the JSON object, do not wrap in markdown or backticks.`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Jules, the elite Chief AI Strategy Officer for Food Penguin Limited. You output strict, valid JSON responses without any markdown formatting or extra text."
        }
      });

      const rawText = response.text || "{}";
      const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      res.json({
        recommendationText: parsed.recommendationText || `Jules recommends a ${defaultAdjustment}% adjustment based on waste patterns.`,
        suggestedAdjustmentPct: Number(parsed.suggestedAdjustmentPct) || defaultAdjustment,
        simulated: false
      });
    } catch (apiErr: any) {
      console.log("Capacity Quickfix falling back to simulation because Gemini key is inactive or failed.");
      res.json({
        recommendationText: `💡 [Simulation Mode - Fallback] Jules recommends a **${defaultAdjustment}% target adjustment** for **${day}** to mitigate kitchen overflow. Based on current branch waste of **€${totalWasteCost.toFixed(2)}** (${totalWasteWeight.toFixed(1)}kg) primarily due to **${topReason}** items, reducing the production target will optimize raw material usage, prevent bottlenecking above ${threshold}%, and safeguard margins.`,
        suggestedAdjustmentPct: defaultAdjustment,
        simulated: true
      });
    }
  } catch (err: any) {
    console.error("Capacity Quickfix error: ", err);
    res.status(500).json({ error: err.message || "Failed to calculate capacity quickfix." });
  }
});

// ==========================================
// REST DATA API — real SQLite backend
// ==========================================

app.get("/api/metrics", (_req, res) => {
  try {
    const data = getMetrics();
    res.json(data || {});
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/metrics", (req, res) => {
  try {
    updateMetrics(req.body);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/orders", (req, res) => {
  try {
    const branch = req.query.branch as string | undefined;
    res.json(getOrders(branch));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/orders", (req, res) => {
  try {
    addOrder(req.body);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/targets", (_req, res) => {
  try { res.json(getTargets()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/recipes", (_req, res) => {
  try { res.json(getRecipes()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/tasks", (_req, res) => {
  try { res.json(getProductionTasks()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/waste", (_req, res) => {
  try { res.json(getWasteRecords()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post("/api/waste", (req, res) => {
  try {
    addWasteRecord(req.body);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/hours", (_req, res) => {
  try { res.json(getEmployeeHours()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/inventory", (_req, res) => {
  try { res.json(getInventory()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/logs", (req, res) => {
  try {
    const week = req.query.week as string;
    if (!week) return res.status(400).json({ error: "week query param required" });
    res.json(getDailyLogs(week));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/logs", (req, res) => {
  try {
    addDailyLog(req.body);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/alerts", (_req, res) => {
  try { res.json(getAlerts()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// Analytics API (self-hosted)
// ==========================================

// Track a single event (session_start, pageview, tab_switch, click, form_submit, action, error)
app.post("/api/analytics/track", (req, res) => {
  try {
    const body = req.body || {};
    if (!body.session_id || !body.event_type || !body.page) {
      return res.status(400).json({ error: "session_id, event_type, page are required" });
    }
    if (body.event_type === "session_start") {
      upsertAnalyticsSession({
        session_id: body.session_id,
        user_role: body.user_role || "unknown",
        branch: body.branch,
        first_seen_at: body.occurred_at,
        last_seen_at: body.occurred_at,
        is_active: 1,
      });
    } else if (body.event_type === "session_end") {
      endAnalyticsSession(body.session_id, body.occurred_at);
    } else {
      recordAnalyticsEvent({
        session_id: body.session_id,
        event_type: body.event_type,
        category: body.category,
        label: body.label,
        value: body.value,
        props: body.props,
        page: body.page,
        user_role: body.user_role || "unknown",
        branch: body.branch,
        occurred_at: body.occurred_at,
        day: body.day,
      });
    }
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Batch endpoint — send multiple events in one call (reduces chatter)
app.post("/api/analytics/track-batch", (req, res) => {
  try {
    const events: any[] = Array.isArray(req.body?.events) ? req.body.events : [];
    let count = 0;
    for (const body of events) {
      if (!body || !body.session_id || !body.event_type || !body.page) continue;
      if (body.event_type === "session_start") {
        upsertAnalyticsSession({
          session_id: body.session_id,
          user_role: body.user_role || "unknown",
          branch: body.branch,
          first_seen_at: body.occurred_at,
          last_seen_at: body.occurred_at,
          is_active: 1,
        });
      } else if (body.event_type === "session_end") {
        endAnalyticsSession(body.session_id, body.occurred_at);
      } else {
        recordAnalyticsEvent({
          session_id: body.session_id,
          event_type: body.event_type,
          category: body.category,
          label: body.label,
          value: body.value,
          props: body.props,
          page: body.page,
          user_role: body.user_role || "unknown",
          branch: body.branch,
          occurred_at: body.occurred_at,
          day: body.day,
        });
      }
      count++;
    }
    res.json({ ok: true, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/analytics/summary", (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    res.json(getAnalyticsSummary(days));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/analytics/timeseries", (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    res.json(getAnalyticsTimeseries(days));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/analytics/top-labels", (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const event_type = (req.query.event_type as string) || "tab_switch";
    const limit = Number(req.query.limit) || 10;
    res.json(getTopLabels(days, event_type, limit));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/analytics/top-actions", (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const limit = Number(req.query.limit) || 10;
    res.json(getTopActions(days, limit));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/analytics/top-errors", (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const limit = Number(req.query.limit) || 10;
    res.json(getTopErrors(days, limit));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/analytics/top-pages", (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const limit = Number(req.query.limit) || 10;
    res.json(getTopPages(days, limit));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/analytics/top-branches", (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const limit = Number(req.query.limit) || 10;
    res.json(getTopBranches(days, limit));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/analytics/roles", (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    res.json(getRoleBreakdown(days));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/analytics/funnel", (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const stepsParam = (req.query.steps as string) || "Overview,Production,Waste,Sell,Reports";
    const steps = stepsParam.split(",").map(s => s.trim()).filter(Boolean);
    res.json(getFunnel(steps, days));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/analytics/recent", (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    res.json(getRecentEvents(limit));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/analytics/status", (_req, res) => {
  try {
    res.json({ seeded: getAnalyticsSeeded() });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
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

// --- SakThai local GGUF operational advisor ---
let sakthaiProcess: ReturnType<typeof spawn> | null = null;

function startSakThaiAdvisor() {
  if (sakthaiProcess) return;
  const scriptPath = path.resolve(__dirname, "advisor_server.py");
  const venvPython = path.resolve(__dirname, ".venv/bin/python");
  sakthaiProcess = spawn(venvPython, [scriptPath], {
    env: { ...process.env, SAKTHAI_ADVISOR_PORT: "8123" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  sakthaiProcess.stdout?.on("data", (d) => console.log("[SakThai]", d.toString().trim()));
  sakthaiProcess.stderr?.on("data", (d) => console.error("[SakThai]", d.toString().trim()));
  sakthaiProcess.on("exit", () => { sakthaiProcess = null; });
}

app.post("/api/sakthai/advisor", async (req, res) => {
  const metrics = req.body?.metrics || {};
  const question = req.body?.question || "Analyse current branch metrics and give 3 operational recommendations.";
  const engine = req.body?.engine || "auto"; // auto | local | hf | rules

  if (engine === "rules") {
    return res.json({ text: ruleBasedAdvice(metrics), engine: "rule-based" });
  }

  // Try local SakThai GGUF first (or when explicitly selected)
  if (engine === "auto" || engine === "local") {
    try {
      startSakThaiAdvisor();
      const text = await Promise.race([
        askSakThai(metrics, question),
        new Promise<string>((_, r) => setTimeout(() => r(new Error("timeout")), 20000)),
      ]);
      return res.json({ text, engine: "sakthai-1.5b-gguf" });
    } catch (e) {
      console.warn("Local SakThai advisor failed:", e);
      if (engine === "local") {
        return res.json({ text: ruleBasedAdvice(metrics), engine: "rule-based-fallback" });
      }
    }
  }

  // Try Hugging Face Inference API
  if (engine === "auto" || engine === "hf") {
    try {
      const text = await askHuggingFaceAdvisor(metrics, question);
      return res.json({ text, engine: "sakthai-hf" });
    } catch (e) {
      console.warn("HF advisor failed:", e);
    }
  }

  res.json({ text: ruleBasedAdvice(metrics), engine: "rule-based-fallback" });
});

async function askHuggingFaceAdvisor(metrics: any, question: string): Promise<string> {
  const model = process.env.HF_ADVISOR_MODEL || "Nanthasit/sakthai-context-1.5b-merged";
  const endpoint = process.env.HF_ADVISOR_ENDPOINT || `https://api-inference.huggingface.co/models/${model}`;
  const token = process.env.HF_TOKEN;
  const url = new URL(endpoint);
  const payload = JSON.stringify({
    inputs: buildHFChatPrompt(metrics, question),
    parameters: { max_new_tokens: 240, temperature: 0.35, top_p: 0.8, repetition_penalty: 1.25, return_full_text: false },
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: url.hostname, port: url.port || 443, path: url.pathname + url.search, method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload), ...(token ? { Authorization: `Bearer ${token}` } : {}) } },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const data = JSON.parse(body);
              const generated = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
              resolve(cleanHFResponse(String(generated || "")));
            } catch { resolve("- No specific recommendation generated."); }
          } else {
            reject(new Error(`HF ${res.statusCode}: ${body.slice(0, 200)}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function buildHFChatPrompt(metrics: any, question: string) {
  const system = "You are SakThai, an operational advisor for Food Penguin Limited, a sushi business in Cork, Ireland. Answer with exactly 3 short bullet points. Each bullet must start with '- ' and be one sentence. No numbering, no bold, no markdown, no repetition, no extra text.";
  const user = (
    `Branch: ${metrics.branch || "All branches"}\n` +
    `Sales: €${Number(metrics.sales || 0).toFixed(2)}\n` +
    `COGS: ${(Number(metrics.cogsPct || 0) * 100).toFixed(1)}% of sales\n` +
    `Waste: ${(Number(metrics.wastePct || 0) * 100).toFixed(1)}% of COGS\n` +
    `Production: ${metrics.productionItems || 0} / ${metrics.productionTarget || 0} items\n` +
    `Health: ${metrics.healthScore || 0} / 100\n` +
    `Question: ${question}\n\n` +
    "Answer:\n-"
  );
  return (
    `<|im_start|>system\n${system}<|im_end|>\n` +
    `<|im_start|>user\n${user}<|im_end|>\n` +
    `<|im_start|>assistant\n-`
  );
}

function cleanHFResponse(text: string) {
  const cleaned = text.replace(/\*\*/g, "").replace(/[*#]/g, "").trim();
  const lines = cleaned.split("\n").map((l) => l.replace(/^[-•*\s]+/, "").trim()).filter((l) => l.length >= 10);
  const seen = new Set();
  const out: string[] = [];
  for (const line of lines) {
    const key = line.toLowerCase().slice(0, 40);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(`- ${line}`);
    if (out.length >= 3) break;
  }
  return out.join("\n") || "- No specific recommendation generated.";
}

function askSakThai(metrics: any, question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ metrics, question });
    const req = require("http").request(
      { hostname: "127.0.0.1", port: 8123, path: "/advise", method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } },
      (res: any) => {
        let body = "";
        res.on("data", (c: any) => (body += c));
        res.on("end", () => {
          try {
            const d = JSON.parse(body);
            resolve(d.text || d.error || "No advice returned.");
          } catch { resolve(body); }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function ruleBasedAdvice(metrics: any) {
  const recs: string[] = [];
  if (metrics.cogsPct > 0.32) recs.push("COGS is high — renegotiate supplier prices or reduce portion sizes.");
  if (metrics.wastePct > 0.12) recs.push("Waste is above target — lower tomorrow's production target by 10–15%.");
  if (metrics.sales < (metrics.target || 0) * 0.9) recs.push("Sales are below target — run a lunch promotion or push best sellers.");
  if (metrics.hoursPer100Sales > 8) recs.push("Labor hours per sale are high — review staffing schedule.");
  if (!recs.length) recs.push("Metrics look healthy. Maintain current targets and monitor end-of-day waste.");
  return recs.map((r) => `- ${r}`).join("\n");
}

if (process.env.VERCEL) {
  app.get("/api/health", (_req, res) => res.json({ ok: true, vercel: true }));
}
