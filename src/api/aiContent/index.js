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

/**
 * Calculate AI credit price
 * @param {Object} data - { credits: number }
 * @returns {Promise<Object>} API response
 */
export const calculateCreditPrice = async (data) => {
  return api(AI_CONTENT_ENDPOINTS.CALCULATE_PRICE, data, "post");
};

/**
 * Purchase AI credits (creates PaymentIntent)
 * @param {Object} data - { credits: number }
 * @returns {Promise<Object>} API response with clientSecret, paymentIntentId, etc.
 */
export const purchaseAiCredits = async (data) => {
  return api(AI_CONTENT_ENDPOINTS.PURCHASE_CREDITS, data, "post");
};

export default {
  getCreditPricing,
  calculateCreditPrice,
  purchaseAiCredits,
};
