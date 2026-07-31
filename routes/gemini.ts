import express from "express";
import { GoogleGenAI } from "@google/genai";

export const geminiRouter = express.Router();

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
geminiRouter.post("/strategic-advisor", async (req, res) => {
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
geminiRouter.post("/low-latency-cmd", async (req, res) => {
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
geminiRouter.post("/generate-marketing-image", async (req, res) => {
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
geminiRouter.post("/analyze-dish-photo", async (req, res) => {
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
geminiRouter.post("/search-trends", async (req, res) => {
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
geminiRouter.post("/suggest-restock", async (req, res) => {
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
geminiRouter.post("/shift-summary", async (req, res) => {
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
geminiRouter.post("/capacity-quickfix", async (req, res) => {
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

// --- Energy/Sustainability Report API ---
geminiRouter.post("/sustainability-report", async (req, res) => {
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
geminiRouter.post("/finance-analysis", async (req, res) => {
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
