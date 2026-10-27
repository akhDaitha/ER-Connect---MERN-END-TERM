import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io('/', {
      withCredentials: true,
      autoConnect: false,
      transports: ['polling'],
      auth: async (callback) => {
        try {
          const response = await fetch('/api/auth/socket-token', {
            credentials: 'same-origin',
            headers: { Accept: 'application/json' }
          });
          const result = await response.json();
          callback({ token: response.ok ? result.token : null });
        } catch {
          callback({ token: null });
        }
      }
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
