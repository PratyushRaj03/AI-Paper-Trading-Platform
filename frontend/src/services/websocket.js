let ws = null;
const subscribers = new Set();

export const initWebSocket = () => {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('WebSocket connected to market stream');
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      subscribers.forEach((cb) => cb(data));
    } catch (err) {
      console.error('WS Parse Error:', err);
    }
  };

  ws.onclose = () => {
    console.log('WS connection closed. Reconnecting in 5s...');
    setTimeout(initWebSocket, 5000);
  };
};

export const subscribeMarketStream = (callback) => {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
};
