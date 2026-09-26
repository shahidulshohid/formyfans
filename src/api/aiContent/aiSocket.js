import { io } from "socket.io-client";

let aiSocketInstance = null;

/**
 * Get the current user auth token from localStorage
 */
export const getAiUserToken = () => {
  try {
    const rawUserData = localStorage.getItem("userData");
    if (rawUserData) {
      const parsed = JSON.parse(rawUserData);
      return (
        parsed?.state?.token ||
        parsed?.token ||
        parsed?.state?.user?.token ||
        parsed?.user?.token ||
        ""
      );
    }
  } catch (err) {
    console.error("Error reading userData token:", err);
  }
  return "";
};

/**
 * Connect to AI Generation WebSocket / Socket.io server
 * Server URL: http://46.202.130.209:18081
 * Headers: Authorization: Bearer {{userToken}}
 * Events:
 * - user_connected
 * - ai:generation_failed
 * - ai:generation_completed
 * - ai:generation_progress
 * - authenticated
 * @returns {Socket}
 */
export const connectAiSocket = () => {
  const token = getAiUserToken();
  const socketUrl =
    import.meta.env.VITE_BASE_URL || "http://46.202.130.209:18081";

  // If already connected, reuse existing instance
  if (aiSocketInstance && aiSocketInstance.connected) {
    return aiSocketInstance;
  }

  // If instance exists but not connected, disconnect cleanly first
  if (aiSocketInstance) {
    try {
      aiSocketInstance.disconnect();
    } catch (e) {}
  }

  console.log("[AI Socket] Connecting to:", socketUrl, "with Authorization header");

  aiSocketInstance = io(socketUrl, {
    extraHeaders: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
  });

  aiSocketInstance.on("connect", () => {
    console.log("[AI Socket] Connected successfully to:", socketUrl);
  });

  // 1. user_connected event listener
  aiSocketInstance.on("user_connected", (data) => {
    console.log("[AI Socket] Event 'user_connected':", data);
  });

  // 2. authenticated event listener
  aiSocketInstance.on("authenticated", (data) => {
    console.log("[AI Socket] Event 'authenticated':", data);
  });

  // 3. ai:generation_failed event listener
  aiSocketInstance.on("ai:generation_failed", (data) => {
    console.log("[AI Socket] Event 'ai:generation_failed':", data);
  });

  // 4. ai:generation_completed event listener
  aiSocketInstance.on("ai:generation_completed", (data) => {
    console.log("[AI Socket] Event 'ai:generation_completed':", data);
  });

  // 5. ai:generation_progress event listener
  aiSocketInstance.on("ai:generation_progress", (data) => {
    console.log("[AI Socket] Event 'ai:generation_progress':", data);
  });

  aiSocketInstance.on("connect_error", (error) => {
    console.warn("[AI Socket] Connection error:", error?.message);
  });

  aiSocketInstance.on("disconnect", (reason) => {
    console.log("[AI Socket] Disconnected:", reason);
  });

  return aiSocketInstance;
};

/**
 * Get existing socket or establish connection
 */
export const getAiSocket = () => {
  if (!aiSocketInstance || !aiSocketInstance.connected) {
    return connectAiSocket();
  }
  return aiSocketInstance;
};

/**
 * Disconnect AI Socket
 */
export const disconnectAiSocket = () => {
  if (aiSocketInstance) {
    try {
      aiSocketInstance.disconnect();
      aiSocketInstance = null;
    } catch (err) {
      console.error("[AI Socket] Disconnect error:", err);
    }
  }
};

/**
 * Helper to extract media/image URL from any nested response or socket payload
 */
export const extractAiMediaUrl = (payload) => {
  if (!payload) return null;
  if (
    typeof payload === "string" &&
    (payload.startsWith("http://") ||
      payload.startsWith("https://") ||
      payload.startsWith("data:") ||
      payload.startsWith("blob:"))
  ) {
    return payload;
  }

  const obj = payload?.data || payload;
  return (
    obj?.mediaUrl ||
    obj?.media_url ||
    obj?.imageUrl ||
    obj?.image_url ||
    obj?.outputUrl ||
    obj?.output_url ||
    obj?.resultUrl ||
    obj?.result_url ||
    obj?.url ||
    obj?.image ||
    obj?.media ||
    obj?.fileUrl ||
    obj?.downloadUrl ||
    obj?.data?.mediaUrl ||
    obj?.data?.media_url ||
    obj?.data?.imageUrl ||
    obj?.data?.outputUrl ||
    obj?.data?.url ||
    obj?.data?.resultUrl ||
    payload?.mediaUrl ||
    payload?.imageUrl ||
    payload?.outputUrl ||
    payload?.url ||
    null
  );
};

/**
 * Subscribe to AI Generation socket events:
 * - ai:generation_progress
 * - ai:generation_completed
 * - ai:generation_failed
 *
 * @param {string} targetGenerationId
 * @param {Object} callbacks
 * @param {Function} [callbacks.onProgress]
 * @param {Function} [callbacks.onCompleted]
 * @param {Function} [callbacks.onFailed]
 * @returns {Function} Unsubscribe cleanup function
 */
export const subscribeToAiGeneration = (
  targetGenerationId,
  { onProgress, onCompleted, onFailed } = {}
) => {
  const socket = getAiSocket();
  if (!socket) return () => {};

  const matchGeneration = (payload) => {
    if (!targetGenerationId) return true;
    const data = payload?.data || payload;
    const incomingId =
      payload?.generationId ||
      payload?.id ||
      payload?._id ||
      payload?.contentId ||
      data?.generationId ||
      data?.id ||
      data?._id ||
      data?.contentId;

    if (!incomingId) return true;
    return String(incomingId) === String(targetGenerationId);
  };

  const handleProgress = (payload) => {
    if (matchGeneration(payload)) {
      const data = payload?.data || payload;
      if (onProgress) onProgress(data);
    }
  };

  const handleCompleted = (payload) => {
    if (matchGeneration(payload)) {
      const data = payload?.data || payload;
      const mediaUrl = extractAiMediaUrl(payload);
      if (onCompleted) {
        onCompleted({
          ...data,
          mediaUrl: mediaUrl || data?.mediaUrl,
        });
      }
    }
  };

  const handleFailed = (payload) => {
    if (matchGeneration(payload)) {
      const data = payload?.data || payload;
      if (onFailed) onFailed(data);
    }
  };

  socket.on("ai:generation_progress", handleProgress);
  socket.on("ai:generation_completed", handleCompleted);
  socket.on("ai:generation_failed", handleFailed);

  return () => {
    socket.off("ai:generation_progress", handleProgress);
    socket.off("ai:generation_completed", handleCompleted);
    socket.off("ai:generation_failed", handleFailed);
  };
};

export default {
  connectAiSocket,
  getAiSocket,
  disconnectAiSocket,
  extractAiMediaUrl,
  subscribeToAiGeneration,
};
