import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createHmac, timingSafeEqual } from "node:crypto";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 3000);

const app = express();

type JsonRecord = Record<string, unknown>;

class HttpError extends Error {
  status: number;
  publicMessage: string;

  constructor(status: number, publicMessage: string, privateMessage?: string) {
    super(privateMessage || publicMessage);
    this.status = status;
    this.publicMessage = publicMessage;
  }
}

type AuthRole = "User" | "Staff" | "Manager" | "Admin";

const roleRank: Record<AuthRole, number> = {
  User: 0,
  Staff: 1,
  Manager: 2,
  Admin: 3,
};

const workflowMinimumRoles: Record<string, AuthRole> = {
  "low-latency-cmd": "User",
  "strategic-advisor": "Staff",
  "shift-summary": "Staff",
  "search-trends": "Staff",
  "suggest-restock": "Manager",
  "capacity-quickfix": "Manager",
  "menu-engineering-suggestions": "Manager",
  "sustainability-report": "Manager",
  "analyze-dish-photo": "Staff",
  "generate-marketing-image": "Admin",
};

interface AuthenticatedUser {
  sub: string;
  email?: string;
  role: AuthRole;
}

function verifySignature(unsignedToken: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(unsignedToken).digest("base64url");
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function parseSignedBearerToken(header: string | undefined): AuthenticatedUser | null {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  const [encodedHeader, encodedPayload, signature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !signature) return null;

  const secret = process.env.AUTH_TOKEN_SECRET;
  if (!secret) return null;

  try {
    if (!verifySignature(`${encodedHeader}.${encodedPayload}`, signature, secret)) return null;

    const headerPayload = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8")) as { alg?: string };
    if (headerPayload.alg !== "HS256") return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<AuthenticatedUser> & { exp?: number };
    if (!payload.exp || Date.now() >= payload.exp * 1000) return null;
    if (!payload.sub || !payload.role || !(payload.role in roleRank)) return null;
    return { sub: String(payload.sub), email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export function requireRole(minimumRole: AuthRole) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = parseSignedBearerToken(req.header("authorization"));
    if (!user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    if (roleRank[user.role] < roleRank[minimumRole]) {
      res.status(403).json({ error: `${minimumRole} role required.` });
      return;
    }

    res.locals.user = user;
    next();
  };
}

export function requireWorkflowRole(req: express.Request, res: express.Response, next: express.NextFunction) {
  const workflow = String(req.params.workflow || "");
  const minimumRole = workflowMinimumRoles[workflow];
  if (!minimumRole) {
    res.status(404).json({ error: `Unknown workflow: ${workflow}` });
    return;
  }
  return requireRole(minimumRole)(req, res, next);
}

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

function rateLimitExpensiveAiRoute({ limit, windowMs }: RateLimitOptions) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const workflow = req.params.workflow || req.path;
    const identity = (res.locals.user as AuthenticatedUser | undefined)?.sub || req.ip || "anonymous";
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
    req: express.Request,
    res: express.Response,
  ) => Promise<void>,
) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    handler(req, res).catch(next);
  };
}

const geminiRouter = express.Router();
const standardAiJson = express.json({ limit: "256kb" });
const promptAiJson = express.json({ limit: "64kb" });
const imageAiJson = express.json({ limit: "12mb" });
const expensiveAiRateLimit = rateLimitExpensiveAiRoute({ limit: 10, windowMs: 15 * 60 * 1000 });

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
  requireRole("User"),
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
  promptAiJson,
  requireRole("Staff"),
  expensiveAiRateLimit,
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
  promptAiJson,
  requireRole("Admin"),
  expensiveAiRateLimit,
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
  imageAiJson,
  requireRole("Staff"),
  expensiveAiRateLimit,
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
  standardAiJson,
  requireWorkflowRole,
  expensiveAiRateLimit,
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

export async function startServer() {
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

if (process.env.NODE_ENV !== "test") {
  startServer().catch((error) => {
    console.error("Failed to start Food Penguin dashboard.", error);
    process.exit(1);
  });
}

export { app };
