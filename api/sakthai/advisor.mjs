import https from "https";

const HF_ADVISOR_MODEL = process.env.HF_ADVISOR_MODEL || "Nanthasit/sakthai-context-1.5b-merged";
const HF_ADVISOR_ENDPOINT = process.env.HF_ADVISOR_ENDPOINT || `https://api-inference.huggingface.co/models/${HF_ADVISOR_MODEL}`;
const HF_TOKEN = process.env.HF_TOKEN;

function ruleBasedAdvice(metrics) {
  const recs = [];
  if (metrics.cogsPct > 0.32) recs.push("COGS is high — renegotiate supplier prices or reduce portion sizes.");
  if (metrics.wastePct > 0.12) recs.push("Waste is above target — lower tomorrow's production target by 10–15%.");
  if (metrics.sales < (metrics.target || 0) * 0.9) recs.push("Sales are below target — run a lunch promotion or push best sellers.");
  if (metrics.hoursPer100Sales > 8) recs.push("Labor hours per sale are high — review staffing schedule.");
  if (!recs.length) recs.push("Metrics look healthy. Maintain current targets and monitor end-of-day waste.");
  return recs.map((r) => `- ${r}`).join("\n");
}

function buildHFChatPrompt(metrics, question) {
  const system = "You are SakThai, an operational advisor for Food Penguin Limited, a sushi business in Cork, Ireland. Answer with exactly 3 short bullet points. Each bullet must start with '- ' and be one sentence. No numbering, no bold, no markdown, no repeated ideas, no extra text.";
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

function cleanHFResponse(text) {
  const cleaned = String(text || "").replace(/\*\*/g, "").replace(/[*#]/g, "").trim();
  const lines = cleaned.split("\n").map((l) => l.replace(/^[-•*\s]+/, "").trim()).filter((l) => l.length >= 10);
  const seen = new Set();
  const out = [];
  for (const line of lines) {
    const key = line.toLowerCase().slice(0, 40);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(`- ${line}`);
    if (out.length >= 3) break;
  }
  return out.join("\n") || "- No specific recommendation generated.";
}

function askHuggingFace(metrics, question) {
  const url = new URL(HF_ADVISOR_ENDPOINT);
  const payload = JSON.stringify({
    inputs: buildHFChatPrompt(metrics, question),
    parameters: { max_new_tokens: 240, temperature: 0.35, top_p: 0.8, repetition_penalty: 1.25, return_full_text: false },
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          ...(HF_TOKEN ? { Authorization: "Bearer " + HF_TOKEN } : {}),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const data = JSON.parse(body);
              const generated = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
              resolve(cleanHFResponse(generated));
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

async function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        resolve({});
      }
    });
  });
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = await readBody(req);
    const metrics = body.metrics || {};
    const question = body.question || "Give 3 operational recommendations";
    const engine = body.engine || "auto";

    if (engine === "rules") {
      return res.json({ text: ruleBasedAdvice(metrics), engine: "rule-based" });
    }

    if (engine === "auto" || engine === "hf") {
      try {
        const text = await askHuggingFace(metrics, question);
        return res.json({ text, engine: "sakthai-hf" });
      } catch (e) {
        console.warn("HF advisor failed:", e.message || e);
        if (engine === "hf") {
          return res.json({ text: ruleBasedAdvice(metrics), engine: "rule-based-fallback" });
        }
      }
    }

    return res.json({ text: ruleBasedAdvice(metrics), engine: "rule-based-fallback" });
  } catch (outer) {
    console.error("Advisor function error:", outer);
    return res.status(500).json({ error: outer.message || "Advisor failed" });
  }
}
