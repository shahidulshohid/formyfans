import api from "../index";
import { AI_CONTENT_ENDPOINTS } from "../endpoints";
import { stripePublishableKey } from "../../config/stripe";

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

export default {
  getCreditPricing,
  calculateCreditPrice,
  purchaseAiCredits,
  confirmStripePaymentIntent,
};
