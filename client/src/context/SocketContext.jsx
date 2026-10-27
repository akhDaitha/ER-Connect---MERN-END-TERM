import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '../socket/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      const s = connectSocket();
      setSocket(s);

      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);

      s.on('connect', onConnect);
      s.on('disconnect', onDisconnect);

      if (s.connected) {
        setIsConnected(true);
      }

      return () => {
        s.off('connect', onConnect);
        s.off('disconnect', onDisconnect);
      };
    } else {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context;
};
