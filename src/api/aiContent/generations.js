import api from "../index";
import { AI_CONTENT_ENDPOINTS } from "../endpoints";

/**
 * Start AI Content Generation
 * POST /ai/generations
 * @param {Object} payload
 * @param {string} payload.type - "IMAGE" | "VIDEO" | "VIDEO_EDIT"
 * @param {string} payload.prompt - Prompt / script text to generate
 * @param {string} payload.resolution - "480p" | "720p" | "1080p"
 * @param {string} payload.aspectRatio - "1:1" | "16:9" | "9:16" | "4:5"
 * @returns {Promise<Object>} API response with { generationId, contentId, type, status, progress, reservedCredits, prompt, ... }
 */
export const createAiGeneration = async (payload) => {
  return api(AI_CONTENT_ENDPOINTS.GENERATIONS, payload, "post");
};

/**
 * Get AI Generation Status / Result
 * GET /ai/generations/:id
 * @param {string} generationId
 * @returns {Promise<Object>} API response
 */
export const getAiGenerationStatus = async (generationId) => {
  const endpoint = AI_CONTENT_ENDPOINTS.GET_GENERATION
    ? AI_CONTENT_ENDPOINTS.GET_GENERATION.replace(":id", generationId)
    : `ai/generations/${generationId}`;
  return api(endpoint, null, "get");
};

export default {
  createAiGeneration,
  getAiGenerationStatus,
};
