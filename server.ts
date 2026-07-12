import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 3000);

const app = express();

type JsonRecord = Record<string, unknown>;
type AuthContext = {
  userId: string;
  roles: Set<string>;
  permissions: Set<string>;
};
type AuthenticatedRequest = express.Request & { auth?: AuthContext };

type WorkflowAccess = {
  permissions: string[];
  roles: string[];
};

class HttpError extends Error {
  status: number;
  publicMessage: string;

  constructor(status: number, publicMessage: string, privateMessage?: string) {
    super(privateMessage || publicMessage);
    this.status = status;
    this.publicMessage = publicMessage;
  }
}

const workflowAccess: Record<string, WorkflowAccess> = {
  "generate-marketing-image": {
    permissions: ["ai:image:generate", "ai:*"],
    roles: ["admin", "manager", "marketing"],
  },
  "analyze-dish-photo": {
    permissions: ["ai:image:analyze", "ai:*"],
    roles: ["admin", "manager", "chef", "quality"],
  },
  "strategic-advisor": {
    permissions: ["ai:strategic", "ai:*"],
    roles: ["admin", "manager"],
  },
};

const defaultGeminiAccess: WorkflowAccess = {
  permissions: ["ai:workflow", "ai:*"],
  roles: ["admin", "manager", "staff"],
};

function parseCsv(value?: string) {
  return new Set(
    (value || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

function getConfiguredApiKeys() {
  return new Set(
    (process.env.AI_API_KEYS || process.env.AI_API_KEY || "")
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean),
  );
}

function getBearerToken(req: express.Request) {
  const authorization = req.header("authorization") || "";
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() === "bearer" && token) {
    return token.trim();
  }
  return undefined;
}

function authenticateGeminiRequest(
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction,
) {
  const configuredApiKeys = getConfiguredApiKeys();
  if (configuredApiKeys.size === 0) {
    const message = "AI API authentication is not configured.";
    if (isProduction) {
      res.status(503).json({ error: message });
      return;
    }
    console.warn(`[security] ${message} Allowing local development Gemini request.`);
  } else {
    const suppliedToken = getBearerToken(req) || req.header("x-api-key") || "";
    if (!configuredApiKeys.has(suppliedToken)) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }
  }

  const roles = parseCsv(req.header("x-fpl-user-roles") || req.header("x-fpl-user-role"));
  const permissions = parseCsv(req.header("x-fpl-permissions"));
  if (configuredApiKeys.size === 0 && !isProduction) {
    roles.add("admin");
    permissions.add("ai:*");
  }
  const userId =
    req.header("x-fpl-user-id") ||
    req.header("x-forwarded-user") ||
    req.ip ||
    "anonymous";

  req.auth = {
    userId,
    roles,
    permissions,
  };
  next();
}

function requireWorkflowAccess(workflow: string) {
  return (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
    const access = workflowAccess[workflow] || defaultGeminiAccess;
    const auth = req.auth;

    if (!auth) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const hasRole = access.roles.some((role) => auth.roles.has(role));
    const hasPermission = access.permissions.some((permission) => auth.permissions.has(permission));

    if (!hasRole && !hasPermission) {
      res.status(403).json({ error: "Insufficient permission for this AI workflow." });
      return;
    }

    next();
  };
}

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

function rateLimitExpensiveAiRoute({ limit, windowMs }: RateLimitOptions) {
  return (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
    const workflow = req.params.workflow || req.path;
    const identity = req.auth?.userId || req.ip || "anonymous";
    const bucketKey = `${identity}:${workflow}`;
    const now = Date.now();
    const bucket = rateLimitBuckets.get(bucketKey);

    if (!bucket || bucket.resetAt <= now) {
      rateLimitBuckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    const remaining = Math.max(0, limit - bucket.count);
    res.setHeader("RateLimit-Limit", String(limit));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count >= limit) {
      res.status(429).json({ error: "AI workflow rate limit exceeded. Please retry later." });
      return;
    }

    bucket.count += 1;
    next();
  };
}

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new HttpError(503, "AI provider is not configured.", "GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({ apiKey });
}

function getStringBodyValue(body: JsonRecord, key: string, fallback = "") {
  if (!body) return fallback;
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

function sanitizeApiError(error: unknown) {
  if (error instanceof HttpError) {
    return { status: error.status, message: error.publicMessage };
  }
  if (error instanceof SyntaxError && "body" in error) {
    return { status: 400, message: "Invalid JSON request body." };
  }
  if (typeof error === "object" && error && "type" in error && (error as { type?: string }).type === "entity.too.large") {
    return { status: 413, message: "Request body is too large for this workflow." };
  }
  return { status: 500, message: "AI workflow failed. Please retry later." };
}

function asyncRoute(
  handler: (
    req: AuthenticatedRequest,
    res: express.Response,
  ) => Promise<void>,
) {
  return (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
    handler(req, res).catch(next);
  };
}

const geminiRouter = express.Router();
const standardAiJson = express.json({ limit: "256kb" });
const promptAiJson = express.json({ limit: "64kb" });
const imageAiJson = express.json({ limit: "12mb" });
const expensiveAiRateLimit = rateLimitExpensiveAiRoute({ limit: 10, windowMs: 15 * 60 * 1000 });

geminiRouter.use(authenticateGeminiRequest);

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    mode: isProduction ? "production" : "development",
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

geminiRouter.post(
  "/low-latency-cmd",
  promptAiJson,
  requireWorkflowAccess("low-latency-cmd"),
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

geminiRouter.post(
  "/strategic-advisor",
  expensiveAiRateLimit,
  promptAiJson,
  requireWorkflowAccess("strategic-advisor"),
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

geminiRouter.post(
  "/generate-marketing-image",
  expensiveAiRateLimit,
  promptAiJson,
  requireWorkflowAccess("generate-marketing-image"),
  asyncRoute(async (req, res) => {
    const body = req.body as JsonRecord;
    const prompt = getStringBodyValue(body, "prompt");
    const aspectRatio = getStringBodyValue(body, "aspectRatio", "1:1");
    const model = getStringBodyValue(body, "model", "imagen-3.0-generate-001");

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
      throw new HttpError(502, "Image generation did not return an image.");
    }
    res.json({ imageUrl: `data:image/png;base64,${imageBytes}` });
  }),
);

geminiRouter.post(
  "/analyze-dish-photo",
  expensiveAiRateLimit,
  imageAiJson,
  requireWorkflowAccess("analyze-dish-photo"),
  asyncRoute(async (req, res) => {
    const body = req.body as JsonRecord;
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
  }),
);

geminiRouter.post(
  "/:workflow",
  expensiveAiRateLimit,
  standardAiJson,
  (req, res, next) => requireWorkflowAccess(String(req.params.workflow))(req, res, next),
  asyncRoute(async (req, res) => {
    const workflow = String(req.params.workflow);
    const body = req.body as JsonRecord;

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

app.use("/api/gemini", geminiRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const safeError = sanitizeApiError(error);
  const privateMessage = error instanceof Error ? error.stack || error.message : String(error);
  console.error("[api]", privateMessage);
  if (res.headersSent) {
    return;
  }
  res.status(safeError.status).json({ error: safeError.message });
});

async function startServer() {
  if (isProduction) {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method !== "GET" || req.path.startsWith("/api/")) {
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
