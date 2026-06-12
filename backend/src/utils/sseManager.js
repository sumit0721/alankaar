import { logger } from "./logger.js";

// In-memory Map of userId string → { res, heartbeat }
// Stores both the response object and the heartbeat interval ref
// so we can properly clean up both when a user reconnects or disconnects.
const clients = new Map();

export const addClient = (userId, res, heartbeat) => {
  const id = userId.toString();

  // ── Clean up any existing connection for this user ─────────────────
  // If the browser auto-reconnects (which EventSource does on error),
  // a new entry would be created but the OLD heartbeat interval would
  // keep running forever — a memory leak. Clear it first.
  if (clients.has(id)) {
    const existing = clients.get(id);
    if (existing.heartbeat) {
      clearInterval(existing.heartbeat);
    }
    logger.info(`🔄 SSE reconnect: replacing existing connection for user ${id}`);
  } else {
    logger.info(`🟢 SSE connected: user ${id} (total: ${clients.size + 1})`);
  }

  clients.set(id, { res, heartbeat });
};

export const removeClient = (userId) => {
  const id = userId.toString();
  if (clients.has(id)) {
    const existing = clients.get(id);
    if (existing.heartbeat) {
      clearInterval(existing.heartbeat);
    }
    clients.delete(id);
    logger.info(`🔴 SSE disconnected: user ${id} (total: ${clients.size})`);
  }
};

export const sendToUser = (userId, data) => {
  const id = userId.toString();
  const client = clients.get(id);
  if (client) {
    try {
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      // Client disconnected unexpectedly — remove stale connection
      logger.warn(`⚠️  SSE write failed for user ${id}, removing stale client`);
      removeClient(id);
    }
  }
};

export const getConnectedCount = () => clients.size;

