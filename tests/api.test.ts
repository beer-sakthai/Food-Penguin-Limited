/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server';

describe('Food Penguin Limited API Endpoints Test', () => {
  it('GET / should return 404 in test env', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(404);
  });

  it('POST /api/gemini/strategic-advisor - simulation mode', async () => {
    const res = await request(app)
      .post('/api/gemini/strategic-advisor')
      .send({ prompt: 'What are the key optimization steps for our sushi stock?' });
    expect(res.status).toBe(200);
    const data = res.body as { text: string; thinking: string };
    expect(data.text).toBeDefined();
    expect(data.thinking).toBeDefined();
    expect(data.text).toMatch(/Simulation Mode/);
  });

  it('POST /api/gemini/low-latency-cmd - simulation mode', async () => {
    const res = await request(app)
      .post('/api/gemini/low-latency-cmd')
      .send({ command: 'itamae shifts' });
    expect(res.status).toBe(200);
    const data = res.body as { text: string };
    expect(data.text).toBeDefined();
    expect(data.text).toMatch(/Lite Simulation Mode/);
  });

  it('POST /api/gemini/generate-marketing-image - simulation mode', async () => {
    const res = await request(app)
      .post('/api/gemini/generate-marketing-image')
      .send({ prompt: 'Fresh glacier salmon roll', aspectRatio: '16:9' });
    expect(res.status).toBe(200);
    const data = res.body as { imageUrl: string; simulated: boolean };
    expect(data.simulated).toBe(true);
    expect(data.imageUrl).toMatch(/^data:image\/svg\+xml;/);
  });

  it('POST /api/gemini/analyze-dish-photo - simulation mode', async () => {
    const res = await request(app)
      .post('/api/gemini/analyze-dish-photo')
      .send({ imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', mimeType: 'image/png' });
    expect(res.status).toBe(200);
    const data = res.body as { analysis: string };
    expect(data.analysis).toBeDefined();
    expect(data.analysis).toMatch(/Photo Audit Simulation/);
  });

  it('POST /api/gemini/search-trends - simulation mode', async () => {
    const res = await request(app)
      .post('/api/gemini/search-trends')
      .send({ query: 'tuna prices' });
    expect(res.status).toBe(200);
    const data = res.body as { text: string };
    expect(data.text).toBeDefined();
    expect(data.text).toMatch(/Search Grounding Simulation/);
  });
});
