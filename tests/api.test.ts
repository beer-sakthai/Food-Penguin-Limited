import { test, describe } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "../server";

describe("Food Penguin Limited API Endpoints Test", () => {
  
  test("GET / should return 404 in test env", async () => {
    const res = await request(app).get("/");
    assert.strictEqual(res.status, 404);
  });

  test("POST /api/gemini/strategic-advisor - simulation mode", async () => {
    const res = await request(app)
      .post("/api/gemini/strategic-advisor")
      .send({ prompt: "What are the key optimization steps for our sushi stock?" });
    assert.strictEqual(res.status, 200);
    const data = res.body as { text: string; thinking: string };
    assert.ok(data.text);
    assert.ok(data.thinking);
    assert.match(data.text, /Simulation Mode/);
  });

  test("POST /api/gemini/low-latency-cmd - simulation mode", async () => {
    const res = await request(app)
      .post("/api/gemini/low-latency-cmd")
      .send({ command: "itamae shifts" });
    assert.strictEqual(res.status, 200);
    const data = res.body as { text: string };
    assert.ok(data.text);
    assert.match(data.text, /Lite Simulation Mode/);
  });

  test("POST /api/gemini/generate-marketing-image - simulation mode", async () => {
    const res = await request(app)
      .post("/api/gemini/generate-marketing-image")
      .send({ prompt: "Fresh glacier salmon roll", aspectRatio: "16:9" });
    assert.strictEqual(res.status, 200);
    const data = res.body as { imageUrl: string; simulated: boolean };
    assert.strictEqual(data.simulated, true);
    assert.match(data.imageUrl, /^data:image\/svg\+xml;/);
  });

  test("POST /api/gemini/analyze-dish-photo - simulation mode", async () => {
    const res = await request(app)
      .post("/api/gemini/analyze-dish-photo")
      .send({ imageBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", mimeType: "image/png" });
    assert.strictEqual(res.status, 200);
    const data = res.body as { analysis: string };
    assert.ok(data.analysis);
    assert.match(data.analysis, /Photo Audit Simulation/);
  });

  test("POST /api/gemini/search-trends - simulation mode", async () => {
    const res = await request(app)
      .post("/api/gemini/search-trends")
      .send({ query: "tuna prices" });
    assert.strictEqual(res.status, 200);
    const data = res.body as { text: string };
    assert.ok(data.text);
    assert.match(data.text, /Search Grounding Simulation/);
  });
});
