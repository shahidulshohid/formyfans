import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import useUserStore from "../zustand/userUserStore";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const token = useUserStore((state) => state.token);
  const socketUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    // If user is not logged in / token does not exist, disconnect any active socket
    if (!token) {
      setSocket((prevSocket) => {
        if (prevSocket) {
          try {
            prevSocket.disconnect();
          } catch (err) {
            console.error("Socket disconnect error:", err);
          }
        }
        return null;
      });
      return;
    }

    const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

    // Connect to socket.io server with JWT Bearer token in auth object
    const socketIo = io(socketUrl, {
      auth: {
        token: authToken,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    setSocket(socketIo);

    // Cleanup and disconnect when token changes or unmounts
    return () => {
      try {
        socketIo.disconnect();
      } catch (err) {
        console.error("Socket cleanup error:", err);
      }
    };
  }, [token, socketUrl]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

