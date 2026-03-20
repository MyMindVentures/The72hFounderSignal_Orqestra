import { Router } from 'express';
import { registerSseClient } from '../realtime/sseHub';

export const streamRouter = Router();

streamRouter.get('/', (req, res) => {
  // Server-Sent Events endpoint.
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  // CORS-safe for demos; production should scope origins carefully.
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.write('retry: 10000\n\n');
  registerSseClient(res);

  // Initial keep-alive ping.
  res.write(`event: hello\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  // Keep request open.
  req.on('close', () => {
    // cleanup is handled by registerSseClient
  });
});

