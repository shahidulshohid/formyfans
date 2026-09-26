import api from "../index";
import { AI_CONTENT_ENDPOINTS } from "../endpoints";

/**
 * Refine AI Prompt
 * POST /ai/prompts/refine
 * @param {Object} payload
 * @param {string} payload.type - "IMAGE" | "VIDEO" | "VIDEO_EDIT"
 * @param {string} payload.prompt - User's input prompt description
 * @param {string} [payload.style] - Style description e.g. "Cinematic, Photorealistic"
 * @param {Object} [payload.settings] - Settings like { resolution: "1080p", aspectRatio: "16:9" }
 * @returns {Promise<Object>} API response with { promptId, type, originalPrompt, refinedPrompt, style, ... }
 */
export const refineAiPrompt = async (payload) => {
  return api(AI_CONTENT_ENDPOINTS.REFINE_PROMPT, payload, "post");
};

export default {
  refineAiPrompt,
};
