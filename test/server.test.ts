import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../server";

async function request(app: ReturnType<typeof createApp>, path: string, body: unknown) {
  const server = app.listen(0);
  try {
    const address = server.address();
    assert(address && typeof address === "object");
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  } finally {
    await new Promise<void>((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  }
}

test("strategic advisor rejects missing prompts", async () => {
  const result = await request(createApp(), "/api/gemini/strategic-advisor", { prompt: "   " });
  assert.equal(result.status, 400);
  assert.equal(result.body.error, "Missing prompt.");
});

test("unknown Gemini workflows return 404", async () => {
  const result = await request(createApp(), "/api/gemini/not-real", { prompt: "hello" });
  assert.equal(result.status, 404);
  assert.match(result.body.error, /Unknown Gemini workflow/);
});

test("configured workflows report missing API keys before AI calls", async () => {
  const original = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    const result = await request(createApp(), "/api/gemini/shift-summary", { sales: 10 });
    assert.equal(result.status, 503);
    assert.match(result.body.error, /GEMINI_API_KEY/);
  } finally {
    if (original === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = original;
  }
});

test("successful mocked AI responses return workflow-specific JSON", async () => {
  const calls: any[] = [];
  const app = createApp({
    aiClientFactory: () => ({
      models: {
        generateContent: async (args: any) => {
          calls.push(args);
          return { text: "Mocked recommendation" };
        },
        generateImages: async () => ({ generatedImages: [{ image: { imageBytes: "abc123" } }] }),
      },
    }),
  });

  const result = await request(app, "/api/gemini/menu-engineering-suggestions", { margin: 0.4 });
  assert.equal(result.status, 200);
  assert.equal(result.body.recommendations, "Mocked recommendation");
  assert.equal(calls[0].model, "gemini-1.5-flash");
  assert.match(calls[0].config.systemInstruction, /profitability/);
});
