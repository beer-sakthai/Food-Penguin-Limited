import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 3000);

const app = express();

app.use(express.json({ limit: "15mb" }));

type JsonRecord = Record<string, unknown>;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({ apiKey });
}

function getStringBodyValue(body: JsonRecord, key: string, fallback = "") {
  const value = body[key];
  return typeof value === "string" ? value : fallback;
}

function stripDataUrlPrefix(dataUrl: string) {
  const [, base64] = dataUrl.split(",");
  return base64 || dataUrl;
}

async function generateText(contents: unknown, systemInstruction?: string) {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: contents as any,
    config: systemInstruction ? { systemInstruction } : undefined,
  });

  return response.text || "";
}

function asyncRoute(
  handler: (
    req: express.Request,
    res: express.Response,
  ) => Promise<void>,
) {
  return (req: express.Request, res: express.Response) => {
    handler(req, res).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[api]", message);
      res.status(message.includes("GEMINI_API_KEY") ? 503 : 500).json({
        error: message,
      });
    });
  };
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    mode: isProduction ? "production" : "development",
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.post(
  "/api/gemini/low-latency-cmd",
  asyncRoute(async (req, res) => {
    const command = getStringBodyValue(req.body, "command");
    if (!command.trim()) {
      res.status(400).json({ error: "Missing command." });
      return;
    }

    const text = await generateText(command, "Answer concisely for a restaurant operations dashboard.");
    res.json({ text });
  }),
);

app.post(
  "/api/gemini/strategic-advisor",
  asyncRoute(async (req, res) => {
    const prompt = getStringBodyValue(req.body, "prompt");
    if (!prompt.trim()) {
      res.status(400).json({ error: "Missing prompt." });
      return;
    }

    const text = await generateText(
      prompt,
      "You are Jules, a senior Food Penguin operations advisor. Provide practical, structured recommendations.",
    );
    res.json({ text });
  }),
);

app.post(
  "/api/gemini/:workflow",
  asyncRoute(async (req, res) => {
    const workflow = String(req.params.workflow);
    const body = req.body as JsonRecord;

    if (workflow === "generate-marketing-image") {
      const prompt = getStringBodyValue(body, "prompt");
      const aspectRatio = getStringBodyValue(body, "aspectRatio", "1:1");
      const model = getStringBodyValue(body, "model", "imagen-4.0-generate-001");

      if (!prompt.trim()) {
        res.status(400).json({ error: "Missing prompt." });
        return;
      }

      const ai = getAiClient();
      const response = await ai.models.generateImages({
        model,
        prompt,
        config: {
          numberOfImages: 1,
          aspectRatio,
        },
      });
      const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
      if (!imageBytes) {
        res.status(502).json({ error: "Image generation did not return an image." });
        return;
      }
      res.json({ imageUrl: `data:image/png;base64,${imageBytes}` });
      return;
    }

    if (workflow === "analyze-dish-photo") {
      const imageBase64 = getStringBodyValue(body, "imageBase64");
      const mimeType = getStringBodyValue(body, "mimeType", "image/jpeg");
      if (!imageBase64.trim()) {
        res.status(400).json({ error: "Missing imageBase64." });
        return;
      }

      const analysis = await generateText(
        [
          {
            inlineData: {
              mimeType,
              data: stripDataUrlPrefix(imageBase64),
            },
          },
          {
            text: "Audit this food image for presentation, freshness markers, portion control, trim waste, and margin improvement actions.",
          },
        ],
        "You are a culinary quality auditor for a sushi and prepared-food production business.",
      );
      res.json({ analysis });
      return;
    }

    const workflowPrompts: Record<string, string> = {
      "capacity-quickfix": "Recommend immediate capacity fixes using the supplied dashboard context.",
      "menu-engineering-suggestions":
        "Analyze menu item profitability and popularity. Return concise recommendations and, if possible, JSON-like price/cost adjustments.",
      "shift-summary": "Summarize the shift data and highlight operational risks.",
      "search-trends": "Return concise food-demand search trend insights.",
      "suggest-restock": "Recommend restock priorities from the supplied inventory context.",
      "sustainability-report": "Create a sustainability and energy-efficiency report from the supplied production data.",
    };

    const systemInstruction = workflowPrompts[workflow];
    if (!systemInstruction) {
      res.status(404).json({ error: `Unknown Gemini workflow: ${workflow}` });
      return;
    }

    const text = await generateText(JSON.stringify(body, null, 2), systemInstruction);
    if (workflow === "menu-engineering-suggestions") {
      res.json({ recommendations: text });
      return;
    }
    res.json({ text });
  }),
);

async function startServer() {
  if (isProduction) {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method !== "GET") {
        next();
        return;
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Food Penguin dashboard listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start Food Penguin dashboard.", error);
  process.exit(1);
});
