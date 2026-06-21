import type { Express, Request, Response } from 'express';
import type { GoogleGenAI } from '@google/genai';

const LANGUAGE_MODEL = 'gemini-1.5-flash';
const IMAGE_MODEL = 'imagen-3.0-generate-001';

interface GeminiRouteDependencies {
  getAiClient: () => GoogleGenAI;
  hasValidGeminiKey: () => boolean;
}

export function registerGeminiRoutes(app: Express, { getAiClient, hasValidGeminiKey }: GeminiRouteDependencies): void {
  app.post('/api/gemini/strategic-advisor', async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (!hasValidGeminiKey()) {
        return res.json({
          text: '💡 [Simulation Mode] Since GEMINI_API_KEY is not configured yet, here is some simulated advice: Keep waste minimal by matching production targets to high-traffic rain hours, and shift Chef Skipper to peak times. Set up your actual key in Settings > Secrets to unlock live strategic guidance.',
          thinking: `Simulated strategic reasoning using ${LANGUAGE_MODEL}.`,
        });
      }

      try {
        const response = await getAiClient().models.generateContent({
          model: LANGUAGE_MODEL,
          contents: prompt,
          config: {
            systemInstruction: "You are the Chief AI Strategy Officer for 'Food Penguin Limited', an elite cold-chain and premium ocean-to-table food corporation. Your role is to formulate deep, comprehensive, hyper-optimized business strategies. Break down complex operational problems regarding sales, waste minimization, logistics, and labor schedule optimization into mathematically-grounded steps. Provide multi-layered, executive-grade blueprints.",
          },
        });

        return res.json({
          text: response.text || 'No response text generated.',
          thinking: `Strategic reasoning executed successfully using ${LANGUAGE_MODEL}.`,
        });
      } catch (error) {
        console.log('Strategic Advisor falling back to simulation because Gemini failed.');
        return res.json({
          text: '💡 [Simulation Mode - Fallback] Keep waste minimal by matching production targets to high-traffic rain hours, and shift Chef Skipper to peak times. Set up a valid key in Settings > Secrets to unlock live strategic guidance.',
          thinking: `Simulated strategic reasoning using ${LANGUAGE_MODEL} after API fallback.`,
        });
      }
    } catch (error) {
      console.error('Strategic Advisor error:', error);
      return res.status(500).json({ error: 'An internal error occurred while processing the strategic advice.' });
    }
  });

  app.post('/api/gemini/low-latency-cmd', async (req: Request, res: Response) => {
    try {
      const { command } = req.body;
      if (!command) {
        return res.status(400).json({ error: 'Command query is required' });
      }

      if (!hasValidGeminiKey()) {
        return res.json({
          text: `⚡ [Lite Simulation Mode] Processing: "${command}". Rapid Response suggests swapping Chef Kowalski to dinner shift, increasing Arctic Burger margins by 3%, and scheduling refrigeration defrosters. Configure a real API key for live replies.`,
        });
      }

      try {
        const response = await getAiClient().models.generateContent({
          model: LANGUAGE_MODEL,
          contents: command,
          config: {
            systemInstruction: 'You are the rapid action-response dispatcher for Food Penguin kitchen managers. Answer briefly and immediately (maximum 2-3 sentences max) to assist the floor leads with quick, direct answers.',
          },
        });

        return res.json({ text: response.text || 'No response received.' });
      } catch (error) {
        console.log('Low Latency Copilot falling back to simulation because Gemini failed.');
        return res.json({
          text: '⚡ [Lite Simulation Mode - Fallback] Swap Chef Kowalski to dinner shift, increase Arctic Burger margins by 3%, and schedule refrigeration defrosters. Configure a valid API key for live replies.',
        });
      }
    } catch (error) {
      console.error('Low latency copilot error:', error);
      return res.status(500).json({ error: 'Failed to execute command due to an internal error.' });
    }
  });

  app.post('/api/gemini/generate-marketing-image', async (req: Request, res: Response) => {
    try {
      const { prompt, aspectRatio } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Image prompt is required' });
      }

      if (!hasValidGeminiKey()) {
        const mockSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%230f172a"/><circle cx="200" cy="130" r="70" fill="%2338bdf8"/><path d="M120,180 Q200,220 280,180" stroke="%23f59e0b" stroke-width="8" fill="none"/><text x="50%" y="260" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="16">Food Penguin Banner: ${prompt.replace(/"/g, '&quot;')}</text><text x="50%" y="30" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="monospace" font-size="12">Ratio ${aspectRatio || '1:1'} (Simulated)</text></svg>`;
        return res.json({ imageUrl: mockSvg, simulated: true });
      }

      try {
        const response = await getAiClient().models.generateImages({
          model: IMAGE_MODEL,
          prompt: `A clean, commercial studio foods advertisement banner for Food Penguin Limited. ${prompt}`,
          config: {
            aspectRatio: aspectRatio || '1:1',
            outputMimeType: 'image/png',
          },
        });

        const base64Image = response.generatedImages?.[0]?.image.imageBytes;
        if (!base64Image) {
          throw new Error('No image data returned from image generation.');
        }

        return res.json({ imageUrl: `data:image/png;base64,${base64Image}`, simulated: false });
      } catch (error) {
        console.log('Marketing Image falling back to simulated SVG because image generation failed.');
        const mockSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%230f172a"/><circle cx="200" cy="130" r="70" fill="%2338bdf8"/><path d="M120,180 Q200,220 280,180" stroke="%23f59e0b" stroke-width="8" fill="none"/><text x="50%" y="260" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="16">Food Penguin Banner: ${prompt.replace(/"/g, '&quot;')}</text><text x="50%" y="30" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="monospace" font-size="12">Ratio ${aspectRatio || '1:1'} (Simulated on Fallback)</text></svg>`;
        return res.json({ imageUrl: mockSvg, simulated: true });
      }
    } catch (error) {
      console.error('Image generation error:', error);
      return res.status(500).json({ error: 'Failed to generate advertisement banner.' });
    }
  });

  app.post('/api/gemini/analyze-dish-photo', async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'Base64 image is required.' });
      }

      if (!hasValidGeminiKey()) {
        return res.json({
          analysis: '🔍 [Photo Audit Simulation] Your dish photo was received! It displays outstanding plating. Cod thickness appears uniform (approx. 2.4cm). Asparagus is well-steamed and color index is healthy. Estimated portion weight is 320g. Waste assessment: Negligible (<5% scrap). Configure your Gemini key to get the live analysis.',
        });
      }

      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const response = await getAiClient().models.generateContent({
          model: LANGUAGE_MODEL,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'image/png',
                  data: cleanBase64,
                },
              },
              {
                text: 'Perform a rigorous culinary audit on this dish or ingredient delivery photo. Critique the presentation/plating, estimate the volume/weight where applicable, assess the quality/freshness markers, and estimate potential waste or trim percentages. Give actionable suggestions on how to improve kitchen margins or prevent food spoilage.',
              },
            ],
          },
        });

        return res.json({ analysis: response.text || 'No analysis generated.' });
      } catch (error) {
        console.log('Photo analysis falling back to simulation because Gemini failed.');
        return res.json({
          analysis: '🔍 [Photo Audit Simulation - Fallback] Your dish photo was received! It displays outstanding plating. Cod thickness appears uniform (approx. 2.4cm). Asparagus is well-steamed and color index is healthy. Estimated portion weight is 320g. Waste assessment: Negligible (<5% scrap). Configure a valid Gemini key to get live analysis.',
        });
      }
    } catch (error) {
      console.error('Dish analyzer error:', error);
      return res.status(500).json({ error: 'Quality audit analysis failed due to an internal error.' });
    }
  });

  // Search grounded market and procurement trends for planning workflows.
  app.post('/api/gemini/search-trends', async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      if (!hasValidGeminiKey()) {
        return res.json({
          text: `🌐 [Search Grounding Simulation] Searching for: "${query}" in 2026 indexes...\n\nAccording to mock 2026 data: Cold-water species like Atlantic Salmon and Halibut keep a high premium, up 4.1% MoM. Plant-based ocean substitutes gain popularity in urban regions. Commodity rates for bulk packaging plastics are up due to freight climbs.`,
        });
      }

      try {
        const response = await getAiClient().models.generateContent({
          model: LANGUAGE_MODEL,
          contents: query,
          config: {
            systemInstruction: 'You are active business intelligence for Food Penguin procurement department. Answer the user\'s research questions accurately using the search grounding tool.',
            tools: [{ googleSearch: {} }],
          },
        });

        return res.json({ text: response.text || 'No grounded research found.' });
      } catch (error) {
        console.log('Search grounding falling back to simulation because Gemini failed.');
        return res.json({
          text: `🌐 [Search Grounding Simulation - Fallback] Searching for: "${query}" in 2026 indexes...\n\nAccording to mock 2026 data: Cold-water species like Atlantic Salmon and Halibut keep a high premium, up 4.1% MoM; plant-based seafood alternatives expand key urban channels.`,
        });
      }
    } catch (error) {
      console.error('Search Grounding error:', error);
      return res.status(500).json({ error: 'Failed to retrieve market trends.' });
    }
  });

  app.post('/api/gemini/suggest-restock', async (req: Request, res: Response) => {
    try {
      const { branch, inventory } = req.body;
      if (!branch || typeof inventory !== 'object') {
        return res.status(400).json({ error: 'Branch and valid inventory are required' });
      }

      const mockJson = { 'INV-101': 50, 'INV-102': 25, 'INV-103': 100 };

      if (!hasValidGeminiKey()) {
        return res.json({
          text: `📦 [Simulation Mode] Analyzed past 7 days for ${branch}. Suggested restock allocations generated based on simulated historical drawdown velocity.`,
          jsonString: JSON.stringify(mockJson),
        });
      }

      try {
        const prompt = `You are a replenishment supply chain AI. Analyze the simulated past sales output and waste metrics for branch: ${branch}. Given the current inventory state: ${JSON.stringify(inventory)}, calculate optimal replenishment amounts to ensure 100% capacity heading into the weekend. Output a valid JSON object where keys are item IDs and values are integer numbers of units to reorder. Output ONLY JSON, e.g., {\"INV-101\": 50, \"INV-102\": 30}. Do not use markdown wrappers.`;
        const response = await getAiClient().models.generateContent({
          model: LANGUAGE_MODEL,
          contents: prompt,
        });

        return res.json({
          text: `📦 Analyzed ${branch} sales volume and waste metrics. Replenishment allocations securely calculated.`,
          jsonString: (response.text || '{}').replace(/```json/g, '').replace(/```/g, '').trim(),
        });
      } catch (error) {
        console.log('Suggest restock falling back to simulation because Gemini failed.');
        return res.json({
          text: `📦 [Simulation Mode - Fallback] Analyzed past 7 days for ${branch}. Suggested restock allocations generated based on simulated historical drawdown velocity.`,
          jsonString: JSON.stringify(mockJson),
        });
      }
    } catch (error) {
      console.error('Suggest Restock error:', error);
      return res.status(500).json({ error: 'Failed to calculate restock metrics due to an internal error.' });
    }
  });

  app.post('/api/gemini/shift-summary', async (req: Request, res: Response) => {
    try {
      const { branch, metrics } = req.body;
      if (!branch || !metrics || typeof metrics !== 'object') {
        return res.status(400).json({ error: 'Branch and metrics are required' });
      }

      if (!hasValidGeminiKey()) {
        return res.json({
          summary: `✨ [Simulation Mode] ${branch} is performing solidly today with an AI Health Score of ${metrics.aiHealthScore || 78}%. Cumulative sales are currently €${(metrics.salesToday || 0).toLocaleString()} against €${(metrics.wasteCost || 0).toFixed(2)} in recorded food waste costs. Maintain steady focus on key-hour kitchen scheduling to keep margins high.`,
        });
      }

      try {
        const prompt = `Analyze these shift metrics for our food retail branch "${branch}" today and write a short, professional, natural language "Shift Summary" (no more than 3 sentences). Emphasize current sales of €${(metrics.salesToday || 0).toLocaleString()}, food waste costs of €${(metrics.wasteCost || 0).toFixed(2)}, an active AI Health Score of ${metrics.aiHealthScore || 78}%, and production items outputted (${metrics.productionItems || 0} items made out of a target of ${metrics.productionTarget || 0}). Keep it punchy, motivating, and highly practical for floor managers.`;
        const response = await getAiClient().models.generateContent({
          model: LANGUAGE_MODEL,
          contents: prompt,
          config: {
            systemInstruction: 'You are an elite operational executive at Food Penguin kitchen operations. You write high-precision, natural language shift summaries that are clear, concise, and professional.',
          },
        });

        return res.json({ summary: response.text || 'No summary text generated.' });
      } catch (error) {
        console.log('Shift summary falling back to simulation because Gemini failed.');
        return res.json({
          summary: `✨ [Simulation Mode - Fallback] ${branch} is performing solidly today with an AI Health Score of ${metrics.aiHealthScore || 78}%. Cumulative sales are €${(metrics.salesToday || 0).toLocaleString()} against €${(metrics.wasteCost || 0).toFixed(2)} in recorded food waste costs.`,
        });
      }
    } catch (error) {
      console.error('Shift Summary error:', error);
      return res.status(500).json({ error: 'Failed to generate shift summary due to an internal error.' });
    }
  });
}
