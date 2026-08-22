import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { initDb } from './db.js';
import productsRouter from './routes/products.js';
import verdictsRouter from './routes/verdicts.js';
import agentRouter from './routes/agent.js';
import dealsRouter from './routes/deals.js';
import compareRouter from './routes/compare.js';
import settingsRouter from './routes/settings.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
const allowedOrigins = FRONTEND_URL.split(',').map((u) => u.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (FRONTEND_URL === '*' || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.includes('localhost')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback for deployment previews
    },
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/products', productsRouter);
app.use('/api/verdicts', verdictsRouter);
app.use('/api/agent', agentRouter);
app.use('/api/deals', dealsRouter);
app.use('/api/compare', compareRouter);
app.use('/api/settings', settingsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create HTTP server and attach WebSocket
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/agent-events' });

// Track connected clients for broadcasting agent events
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`WebSocket client connected (${clients.size} total)`);

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`WebSocket client disconnected (${clients.size} remaining)`);
  });

  // Send a welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to PrizeIncubator agent event stream',
    timestamp: new Date().toISOString(),
  }));
});

// Export broadcast function for use by agent runner (Phase 2)
export function broadcastAgentEvent(event: {
  type: string;
  run_id?: number;
  message: string;
  timestamp?: string;
  status?: 'info' | 'success' | 'warning' | 'error';
}) {
  const payload = JSON.stringify({
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// Initialize DB then start server
async function main() {
  try {
    await initDb();
    console.log('Database initialized');

    server.listen(PORT, () => {
      console.log(`PrizeIncubator backend running on http://localhost:${PORT}`);
      console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws/agent-events`);
      console.log(`Frontend CORS origin: ${FRONTEND_URL}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

main();
