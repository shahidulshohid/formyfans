import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import useUserStore from "../zustand/userUserStore";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { token } = useUserStore();

  const socketUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5009";

  useEffect(() => {
    let userToken = token;
    if (!userToken) {
      try {
        userToken = JSON.parse(localStorage.getItem("userData"))?.state?.token;
      } catch (e) {
        console.error("Error reading token:", e);
      }
    }

    // Connect to socket.io server with Authorization headers
    const socketIo = io(socketUrl, {
      auth: {
        token: userToken,
        Authorization: userToken ? `Bearer ${userToken}` : "",
      },
      extraHeaders: {
        ...(userToken && {
          Authorization: `Bearer ${userToken}`,
        }),
      },
      transports: ["websocket", "polling"],
    });

    setSocket(socketIo);

    // Cleanup when component unmounts or token changes
    return () => {
      socketIo.disconnect();
    };
  }, [token, socketUrl]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
