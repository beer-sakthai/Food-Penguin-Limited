import { chromium } from "playwright";

(async () => {
  const results = {};
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const requests = [];
  const responses = [];
  page.on("request", (r) => requests.push({ url: r.url(), method: r.method() }));
  page.on("response", (r) => responses.push({ url: r.url(), status: r.status() }));

  const url = "https://food-penguin-limited.vercel.app";
  await page.goto(url, { waitUntil: "networkidle" });
  results.page_load = await page.title();

  const probes = await page.evaluate(async () => {
    async function probeEndpoint(name, url, options) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(url, { ...options, signal: controller.signal, mode: "no-cors" });
        clearTimeout(id);
        return { name, status: res.status, ok: res.ok, reachable: true };
      } catch (e) {
        return { name, error: (e && e.message) || String(e), reachable: false };
      }
    }
    return await Promise.all([
      probeEndpoint("hf_inference", "https://api-inference.huggingface.co/models/Nanthasit/sakthai-context-1.5b-merged", { method: "HEAD" }),
      probeEndpoint("hf_meta", "https://huggingface.co/api/models/Nanthasit/sakthai-context-1.5b-merged", { method: "GET" }),
      probeEndpoint("gemini", "https://generativelanguage.googleapis.com/v1beta/models", { method: "GET" }),
      probeEndpoint("groq", "https://api.groq.com/openai/v1/models", { method: "GET", headers: { Authorization: "Bearer dummy" } }),
      probeEndpoint("openrouter", "https://openrouter.ai/api/v1/models", { method: "GET" }),
      probeEndpoint("cloudflare_ai", "https://api.cloudflare.com/client/v4/ai/models", { method: "GET" }),
    ]);
  });
  results.endpoint_probes = probes;

  try {
    const advisorTab = await page.locator("text=SakThai Advisor").first();
    await advisorTab.waitFor({ timeout: 3000 });
    await advisorTab.click();
    await page.waitForTimeout(1500);
    results.advisor_tab_clicked = true;

    const inputBox = await page.locator('input[placeholder*="Ask"], textarea[placeholder*="Ask"]').first();
    if (await inputBox.count() > 0) {
      await inputBox.fill("What should I fix first?");
      const sendBtn = await page.locator('button:has-text("Send"), button:has([data-icon="send"])').first();
      if (await sendBtn.count() > 0) {
        await sendBtn.click();
        await page.waitForTimeout(3000);
        results.advisor_response = await page.evaluate(() => document.body.innerText);
      }
    }
  } catch (e) {
    results.advisor_error = String(e);
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})();
