import axios from "axios";

export const AI_CHATBOT_BASE_URL =
  import.meta.env.VITE_AI_API_BASE_URL || "http://206.162.244.175:8025/api/v1";

/**
 * Fetch AI Chat History for a user
 * GET /chat/history?user_id={userId}
 * @param {string} userId
 * @returns {Promise<{ user_id: string, total_messages: number, messages: Array<{ role: string, message: string, created_at: string }> }>}
 */
export const getAiChatHistory = async (userId) => {
  try {
    const response = await axios.get(`${AI_CHATBOT_BASE_URL}/chat/history`, {
      params: { user_id: userId },
      timeout: 15000,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching AI chat history:", error);
    throw error;
  }
};

/**
 * Send a message to AI Chat Assistant
 * POST /chat
 * @param {string} userId
 * @param {string} userMessage
 * @returns {Promise<{ user_id: string, AI_response: string, openAI_token_cost?: object }>}
 */
export const sendAiChatMessage = async (userId, userMessage) => {
  try {
    const response = await axios.post(
      `${AI_CHATBOT_BASE_URL}/chat`,
      {
        user_id: userId,
        user_message: userMessage,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending AI chat message:", error);
    throw error;
  }
};

export default {
  getAiChatHistory,
  sendAiChatMessage,
};
