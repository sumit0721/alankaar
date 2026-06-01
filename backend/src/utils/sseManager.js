// In-memory Map of userId string → SSE response object
// Works perfectly on single-instance Railway/Render deployment
const clients = new Map();

export const addClient = (userId, res) => {
  clients.set(userId.toString(), res);
};

export const removeClient = (userId) => {
  clients.delete(userId.toString());
};

export const sendToUser = (userId, data) => {
  const client = clients.get(userId.toString());
  if (client) {
    try {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      // Client disconnected unexpectedly — remove stale connection
      clients.delete(userId.toString());
    }
  }
};

export const getConnectedCount = () => clients.size;
