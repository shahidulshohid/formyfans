import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const socketUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    // Connect to socket.io server
    const socketIo = io(socketUrl, {
      transports: ["websocket", "polling"],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
    });
    setSocket(socketIo);

    // Cleanup when component unmounts
    return () => {
      socketIo.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
