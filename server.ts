import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'workspace-store.json');

// Load or initialize persistent server-side workspace state for Render backend
function readServerStore(): Record<string, unknown> | null {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {
    // ignore read error
  }
  return null;
}

function writeServerStore(payload: unknown): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch {
    // ignore write error
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '5mb' }));

  // CORS middleware so your Vercel frontend (https://your-app.vercel.app) can call your Render backend
  app.use((req, res, next) => {
    const allowedOrigin = process.env.CORS_ORIGIN || '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  // Healthcheck endpoint for Render
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'team-boards-render-api',
      timestamp: new Date().toISOString(),
    });
  });

  // Get shared workspace bundle from Render backend
  app.get('/api/state', (_req, res) => {
    const data = readServerStore();
    res.json({ bundle: data });
  });

  // Save/sync workspace bundle to Render backend
  app.post('/api/state', (req, res) => {
    const { bundle } = req.body || {};
    if (!bundle || typeof bundle !== 'object') {
      res.status(400).json({ error: 'Invalid bundle payload' });
      return;
    }
    writeServerStore(bundle);
    res.json({ status: 'saved', updatedAt: new Date().toISOString() });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
