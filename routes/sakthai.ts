import express from "express";
import path from "path";
import https from "https";
import { spawn } from "child_process";

export const sakthaiRouter = express.Router();

let sakthaiProcess: ReturnType<typeof spawn> | null = null;

function startSakThaiAdvisor() {
  if (sakthaiProcess) return;
  const scriptPath = path.resolve(__dirname, "..", "advisor_server.py");
  const venvPython = path.resolve(__dirname, "..", ".venv/bin/python");
  sakthaiProcess = spawn(venvPython, [scriptPath], {
    env: { ...process.env, SAKTHAI_ADVISOR_PORT: "8123" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  sakthaiProcess.stdout?.on("data", (d) => console.log("[SakThai]", d.toString().trim()));
  sakthaiProcess.stderr?.on("data", (d) => console.error("[SakThai]", d.toString().trim()));
  sakthaiProcess.on("exit", () => { sakthaiProcess = null; });
}

sakthaiRouter.post("/advisor", async (req, res) => {
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
