import api from "../index";
import { AI_CONTENT_ENDPOINTS } from "../endpoints";
import { stripePublishableKey } from "../../config/stripe";

/**
 * Get current user credit balance
 * GET /credits/balance
 * @param {Object} params - Query params if any
 * @returns {Promise<Object>} API response with balance, availableBalance, reserved, totalPurchased, totalSpent
 */
export const getCreditBalance = async (params) => {
  return api(AI_CONTENT_ENDPOINTS.CREDIT_BALANCE, params, "get");
};

/**
 * Get AI credit pricing details
 * GET /credits/pricing
 * @param {Object} params - Query params if any
 * @returns {Promise<Object>} API response
 */
export const getCreditPricing = async (params) => {
  return api(AI_CONTENT_ENDPOINTS.CREDIT_PRICING, params, "get");
};

/**
 * Calculate AI credit price
 * POST /credits/calculate-price
 * @param {Object} data - { credits: number }
 * @returns {Promise<Object>} API response
 */
export const calculateCreditPrice = async (data) => {
  return api(AI_CONTENT_ENDPOINTS.CALCULATE_PRICE, data, "post");
};

/**
 * Purchase AI credits (creates PaymentIntent)
 * POST /credits/purchase
 * @param {Object} data - { credits: number }
 * @returns {Promise<Object>} API response with clientSecret, paymentIntentId, etc.
 */
export const purchaseAiCredits = async (data) => {
  return api(AI_CONTENT_ENDPOINTS.PURCHASE_CREDITS, data, "post");
};

/**
 * Confirm Stripe PaymentIntent directly via Stripe API:
 * POST https://api.stripe.com/v1/payment_intents/{{paymentIntentId}}/confirm
 * @param {string} paymentIntentId
 * @param {Object} data - { payment_method, return_url, client_secret }
 * @returns {Promise<{ status: number, ok: boolean, data: Object }>}
 */
export const confirmStripePaymentIntent = async (paymentIntentId, data = {}) => {
  const url = `https://api.stripe.com/v1/payment_intents/${paymentIntentId}/confirm`;
  const paymentMethod = data.payment_method || data.paymentMethod || "pm_card_visa";
  const returnUrl =
    data.return_url ||
    data.returnUrl ||
    (typeof window !== "undefined" ? `${window.location.origin}/return` : "https://localhost:5009/return");
  const clientSecret = data.client_secret || data.clientSecret;

  const bodyParams = new URLSearchParams();
  bodyParams.append("payment_method", paymentMethod);
  if (returnUrl) {
    bodyParams.append("return_url", returnUrl);
  }
  if (clientSecret) {
    bodyParams.append("client_secret", clientSecret);
  }

  const authHeader = clientSecret
    ? `Bearer ${clientSecret}`
    : stripePublishableKey
    ? `Bearer ${stripePublishableKey}`
    : "";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(authHeader && { Authorization: authHeader }),
    },
    body: bodyParams.toString(),
  });

  const resJson = await response.json();
  return {
    status: response.status,
    ok: response.ok,
    data: resJson,
  };
};

/**
 * Update AI credit pricing (Admin)
 * PUT /credits/pricing
 * @param {Object} data - { reservationSafetyMultiplier: number, pricePerCredit?: number, ... }
 * @returns {Promise<Object>} API response
 */
export const updateCreditPricing = async (data) => {
  const payload = { ...data };
  if (payload.reservationSafetyMultiplier !== undefined) {
    const multiplier = Number(payload.reservationSafetyMultiplier);
    if (isNaN(multiplier) || multiplier < 1 || multiplier > 10) {
      throw new Error("reservationSafetyMultiplier must be between 1 and 10.");
    }
    payload.reservationSafetyMultiplier = multiplier;
  }
  return api(AI_CONTENT_ENDPOINTS.CREDIT_PRICING, payload, "put");
};

export default {
  getCreditBalance,
  getCreditPricing,
  updateCreditPricing,
  calculateCreditPrice,
  purchaseAiCredits,
  confirmStripePaymentIntent,
};

