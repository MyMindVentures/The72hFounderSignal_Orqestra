import { Response } from 'express';

const clients = new Set<Response>();

export function registerSseClient(res: Response) {
  clients.add(res);
  res.on('close', () => {
    clients.delete(res);
  });
}

export function broadcastSseEvent(event: { event: string; data: unknown }) {
  const payload = `event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch {
      // Ignore client write failures; connection will be closed.
    }
  }
}

/** Test / chaos cleanup: drop all SSE connections from the hub. */
export function resetSseClients() {
  clients.clear();
}

