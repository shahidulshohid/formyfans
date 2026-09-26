import api from "../index";
import { AI_CONTENT_ENDPOINTS } from "../endpoints";

/**
 * Get AI credit pricing details
 * @param {Object} params - Query params if any
 * @returns {Promise<Object>} API response
 */
export const getCreditPricing = async (params) => {
  return api(AI_CONTENT_ENDPOINTS.CREDIT_PRICING, params, "get");
};

export default {
  getCreditPricing,
};
