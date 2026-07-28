import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { requireAuth, authRouter } from "./routes/auth";
import { geminiRouter } from "./routes/gemini";
import { sakthaiRouter } from "./routes/sakthai";
import { metricsRouter } from "./routes/metrics";
import { analyticsRouter } from "./routes/analytics";

dotenv.config();

const app = express();
const PORT = 3000;

// contentSecurityPolicy is left off: the bundle relies on the Vite dev
// server's inline scripts and a Tailwind/inline-style pipeline that a
// default CSP would break. The rest of helmet's headers (frameguard,
// nosniff, HSTS, etc.) still apply.
app.use(helmet({ contentSecurityPolicy: false }));

// Set up larger limits for uploading base64 images for food audits
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));
app.use(cookieParser());

// The Gemini and SakThai routes proxy to paid/external inference APIs —
// throttle them separately from the plain CRUD endpoints below.
const aiRouteLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI requests, please slow down." },
});
app.use(["/api/gemini", "/api/sakthai"], aiRouteLimiter);

// AUTH — session cookie is an HMAC-signed, httpOnly token (see ./auth.ts and
// ./routes/auth.ts). requireAuth gates every /api/* route except the
// login/logout/me/health paths it exempts internally.
app.use("/api/auth", authRouter);
app.use(requireAuth);

app.use("/api/gemini", geminiRouter);
app.use("/api/sakthai", sakthaiRouter);
app.use("/api", metricsRouter);
app.use("/api/analytics", analyticsRouter);

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

// Skipped under the test runner — tests import `app` directly via
// supertest instead of binding a real port or booting the Vite middleware.
if (process.env.NODE_ENV !== "test") {
  startServer();
}

if (process.env.VERCEL) {
  app.get("/api/health", (_req, res) => res.json({ ok: true, vercel: true }));
}

export { app };
