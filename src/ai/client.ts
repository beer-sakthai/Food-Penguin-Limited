
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export function isRealGeminiKey(key: string | undefined): boolean {
  if (!key) return false;
  const k = key.trim();
  if (k === "" || k === "MY_GEMINI_API_KEY" || k === "PLACEHOLDER" || k === "YOUR_GEMINI_API_KEY") {
    return false;
  }
  return k.startsWith("AIzaSy");
}

// Shared lazy-loaded Gemini client
let aiClient: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI {
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

export async function getStrategicAdvice(prompt: string): Promise<{text: string, thinking: string}> {
    const ai = getAiClient();
    if (!isRealGeminiKey(process.env.GEMINI_API_KEY)) {
      return {
        text: "💡 [Simulation Mode] Since GEMINI_API_KEY is not configured yet, here is some simulated advice: Keep waste minimal by matching production targets to high-traffic rain hours, and shift Chef Skipper to peak times. Set up your actual key in Settings > Secrets to unleash deep system thinking capabilities!",
        thinking: "Simulating high-reasoning tree for Food Penguin Limited..."
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Jules, the Chief AI Strategy Officer for 'Food Penguin Limited', an elite cold-chain and premium ocean-to-table food corporation. Your role is to formulate deep, comprehensive, hyper-optimized business strategies. Break down complex operational problems regarding sales, waste minimization, logistics, and labor schedule optimization into mathematically-grounded steps. Provide multi-layered, executive-grade blueprints.",
        }
      });

      return {
        text: response.text || "No response text generated.",
        thinking: "Deep strategic thinking executed successfully using gemini-1.5-flash."
      };
    } catch (apiErr: any) {
      console.log("Strategic Advisor falling back to simulation because Gemini key is inactive or failed.");
      return {
        text: `💡 [Simulation Mode - Fallback] Keep waste minimal by matching production targets to high-traffic rain hours, and shift Chef Skipper to peak times. Set up a valid key in Settings > Secrets to unleash deep system thinking capabilities!`,
        thinking: "Simulating high-reasoning tree gracefully on API fallback..."
      };
    }
}

export async function getLowLatencyCommand(command: string): Promise<{text: string}> {
    const ai = getAiClient();
    if (!isRealGeminiKey(process.env.GEMINI_API_KEY)) {
      return {
        text: `⚡ [Lite Simulation Mode] Processing: "${command}". Rapid Response suggests Swapping Chef Kowalski to dinner shift, increasing Arctic Burger margins by 3%, and scheduling refrigeration defrosters. Configure a real API key for sub-second live replies!`
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: command,
        config: {
          systemInstruction: "You are Jules, the rapid action-response dispatcher for Food Penguin kitchen managers. Answer briefly and immediately (maximum 2-3 sentences max) to assist the floor leads with quick, direct answers."
        }
      });

      return {
        text: response.text || "No response received."
      };
    } catch (apiErr: any) {
        console.log("Low Latency Copilot falling back to simulation because Gemini key is inactive or failed.");
        return {
            text: `⚡ [Lite Simulation Mode - Fallback] Swapping Chef Kowalski to dinner shift, increasing Arctic Burger margins by 3%, and scheduling refrigeration defrosters. Configure a valid API key for live sub-second replies!`
        };
    }
}

export async function generateMarketingImage(prompt: string, aspectRatio: string): Promise<{imageUrl: string, simulated: boolean}> {
    const ai = getAiClient();
    if (!isRealGeminiKey(process.env.GEMINI_API_KEY)) {
      // Return a high quality SVG of food matching the prompt as fallback
      const mockSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%230f172a"/><circle cx="200" cy="130" r="70" fill="%2338bdf8"/><path d="M120,180 Q200,220 280,180" stroke="%23f59e0b" stroke-width="8" fill="none"/><text x="50%" y="260" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="16">Food Penguin Banner: ${prompt.replace(/"/g, '&quot;')}</text><text x="50%" y="30" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="monospace" font-size="12">Ratio ${aspectRatio || '1:1'} (Simulated)</text></svg>`;
      return { imageUrl: mockSvg, simulated: true };
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
            return { imageUrl: `data:image/png;base64,${base64Image}`, simulated: false };
        } else {
            throw new Error("No image data returned from Gemini flash image.");
        }
    } catch (apiErr: any) {
        console.log("Marketing Image falling back to simulated SVG because Gemini key is inactive or failed.");
        const mockSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%230f172a"/><circle cx="200" cy="130" r="70" fill="%2338bdf8"/><path d="M120,180 Q200,220 280,180" stroke="%23f59e0b" stroke-width="8" fill="none"/><text x="50%" y="260" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="16">Food Penguin Banner: ${prompt.replace(/"/g, '&quot;')}</text><text x="50%" y="30" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="monospace" font-size="12">Ratio ${aspectRatio || '1:1'} (Simulated on Fallback)</text></svg>`;
        return { imageUrl: mockSvg, simulated: true };
    }
}

export async function analyzeDishPhoto(imageBase64: string, mimeType: string): Promise<{analysis: string}> {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const ai = getAiClient();
    if (!isRealGeminiKey(process.env.GEMINI_API_KEY)) {
      return {
        analysis: "🔍 [Photo Audit Simulation] Your dish photo was received! It displays outstanding plating. Cod thickness appears uniform (approx. 2.4cm). Asparagus is well-steamed and color index is healthy. Estimated portion weight is 320g. Waste assessment: Negligible (<5% scrap). Configure your Gemini key to get the live, multi-spectrometer analysis!"
      };
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
        contents: { parts: [imagePart, promptPart] },
        config: {
          systemInstruction: "You are Jules, the rigorous AI Strategy Officer for 'Food Penguin Limited'. Perform highly precise culinary audits, extracting quality and waste metrics.",
          temperature: 0.1
        }
      });

      return {
        analysis: response.text || "No analysis generated."
      };
    } catch (apiErr: any) {
        console.log("Photo analysis falling back to simulation because Gemini key is inactive or failed.");
        return {
            analysis: `🔍 [Photo Audit Simulation - Fallback] Your dish photo was received! It displays outstanding plating. Cod thickness appears uniform (approx. 2.4cm). Asparagus is well-steamed and color index is healthy. Estimated portion weight is 320g. Waste assessment: Negligible (<5% scrap). Configure a valid Gemini key to get live, multi-spectrometer analysis!`
        };
    }
}

export async function searchTrends(query: string): Promise<{text: string}> {
    const ai = getAiClient();
    if (!isRealGeminiKey(process.env.GEMINI_API_KEY)) {
      return {
        text: `🌐 [Search Grounding Simulation] Searching for: "${query}" in 2026 indexes...

According to mock 2026 data: Cold-water species like Atlantic Salmon and Halibut keep a high premium, up 4.1% MoM. Plant-based ocean substitutes gain popularity in urban regions. Commodity rates for bulk packaging plastics are up due to freight climbs.`
      };
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

      return {
        text: response.text || "No grounded research found."
      };
    } catch (apiErr: any) {
        console.log("Search grounding falling back to simulation because Gemini key is inactive or failed.");
        return {
            text: `🌐 [Search Grounding Simulation - Fallback] Searching for: "${query}" in 2026 indexes...

According to mock 2026 data: Cold-water species like Atlantic Salmon and Halibut keep a high premium, up 4.1% MoM; plant-based seafood alternatives expand key urban channels.`
        };
    }
}

export async function suggestRestock(branch: string, inventory: any): Promise<{text: string, jsonString: string}> {
    const ai = getAiClient();
    const mockJson = {
      "INV-101": 50,
      "INV-102": 25,
      "INV-103": 100
    };

    if (!isRealGeminiKey(process.env.GEMINI_API_KEY)) {
      return {
        text: `📦 [Simulation Mode] Analyzed past 7 days for ${branch}. Suggested restock allocations generated based on simulated historical drawdown velocity.`,
        jsonString: JSON.stringify(mockJson)
      };
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

      return {
        text: `📦 Analyzed ${branch} sales volume and waste metrics. Replenishment allocations securely calculated.`,
        jsonString: cleanedJson
      };
    } catch (apiErr: any) {
        console.log("Suggest restock falling back to simulation because Gemini key is inactive or failed.");
        return {
            text: `📦 [Simulation Mode - Fallback] Analyzed past 7 days for ${branch}. Suggested restock allocations generated based on simulated historical drawdown velocity.`,
            jsonString: JSON.stringify(mockJson)
        };
    }
}

export async function getShiftSummary(branch: string, metrics: any): Promise<{summary: string}> {
    const ai = getAiClient();
    if (!isRealGeminiKey(process.env.GEMINI_API_KEY)) {
      return {
        summary: `✨ [Simulation Mode] ${branch} is performing solidly today with an AI Health Score of ${metrics.aiHealthScore || 78}%. Cumulative sales are currently €${(metrics.salesToday || 0).toLocaleString()} against €${(metrics.wasteCost || 0).toFixed(2)} in recorded food waste costs. Maintain steady focus on key-hour kitchen scheduling to keep margins high.`
      };
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

      return {
        summary: response.text || "No summary text generated."
      };
    } catch (apiErr: any) {
        console.log("Shift summary falling back to simulation because Gemini key is inactive or failed.");
        return {
            summary: `✨ [Simulation Mode - Fallback] ${branch} is performing solidly today with an AI Health Score of ${metrics.aiHealthScore || 78}%. Cumulative sales are €${(metrics.salesToday || 0).toLocaleString()} against €${(metrics.wasteCost || 0).toFixed(2)} in recorded food waste costs.`
        };
    }
}

export async function getSustainabilityReport(data: any[], totalEnergy: number, totalVolume: number, avgWhPerUnit: number): Promise<{text: string}> {
    const ai = getAiClient();

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
${data.map(d => `${d.time}: ${d.energy}kWh for ${d.volume} units (${d.efficiency} Wh/unit)`).join('\\n')}

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

        return { text: response.text };
    } catch (error: any) {
        console.error("Gemini API Error (sustainability-report):", error);
        throw new Error("Failed to generate sustainability report.");
    }
}

export async function getFinanceAnalysis(plan: any[], actual: any[]): Promise<{text: string}> {
    const ai = getAiClient();

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

        return { text: response.text };
    } catch (error: any) {
        console.error("Gemini API Error (finance-analysis):", error);
        throw new Error("Failed to generate finance report.");
    }
}
