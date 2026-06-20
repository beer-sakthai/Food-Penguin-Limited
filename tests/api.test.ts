import { test, describe } from "node:test";
import assert from "node:assert";

const BASE_URL = "http://localhost:3000";

describe("Food Penguin Limited API Endpoints Test", () => {
  
  test("GET / should serve the React SPA index", async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert.match(text, /<!DOCTYPE html>/i);
  });

  test("POST /api/gemini/strategic-advisor - simulation mode", async () => {
    const res = await fetch(`${BASE_URL}/api/gemini/strategic-advisor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: "What are the key optimization steps for our sushi stock?" })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json() as { text: string; thinking: string };
    assert.ok(data.text);
    assert.ok(data.thinking);
    assert.match(data.text, /Simulation Mode/);
  });

  test("POST /api/gemini/low-latency-cmd - simulation mode", async () => {
    const res = await fetch(`${BASE_URL}/api/gemini/low-latency-cmd`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ command: "itamae shifts" })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json() as { text: string };
    assert.ok(data.text);
    assert.match(data.text, /Lite Simulation Mode/);
  });

  test("POST /api/gemini/generate-marketing-image - simulation mode", async () => {
    const res = await fetch(`${BASE_URL}/api/gemini/generate-marketing-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: "Fresh glacier salmon roll", aspectRatio: "16:9" })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json() as { imageUrl: string; simulated: boolean };
    assert.strictEqual(data.simulated, true);
    assert.match(data.imageUrl, /^data:image\/svg\+xml;/);
  });

  test("POST /api/gemini/analyze-dish-photo - simulation mode", async () => {
    const res = await fetch(`${BASE_URL}/api/gemini/analyze-dish-photo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ imageBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", mimeType: "image/png" })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json() as { analysis: string };
    assert.ok(data.analysis);
    assert.match(data.analysis, /Photo Audit Simulation/);
  });

  test("POST /api/gemini/search-trends - simulation mode", async () => {
    const res = await fetch(`${BASE_URL}/api/gemini/search-trends`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: "tuna prices" })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json() as { text: string };
    assert.ok(data.text);
    assert.match(data.text, /Search Grounding Simulation/);
  });
});
