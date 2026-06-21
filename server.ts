import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { registerGeminiRoutes } from './server/geminiRoutes';

dotenv.config();

const app = express();
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

const PORT = 3000;

app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

function isRealGeminiKey(key: string | undefined): boolean {
  if (!key) return false;

  const trimmedKey = key.trim();
  if (
    trimmedKey === '' ||
    trimmedKey === 'MY_GEMINI_API_KEY' ||
    trimmedKey === 'PLACEHOLDER' ||
    trimmedKey === 'YOUR_GEMINI_API_KEY'
  ) {
    return false;
  }

  return trimmedKey.startsWith('AIzaSy');
}

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: isRealGeminiKey(process.env.GEMINI_API_KEY) ? process.env.GEMINI_API_KEY : 'PLACEHOLDER',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  return aiClient;
}

registerGeminiRoutes(app, {
  getAiClient,
  hasValidGeminiKey: () => isRealGeminiKey(process.env.GEMINI_API_KEY),
});

async function startServer(): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Food Penguin Express Server running on HTTP port ${PORT}`);
  });
}

void startServer();
