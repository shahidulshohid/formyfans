import api from "../index";
import { endpoints, SUBSCRIPTION_ENDPOINTS } from "../endpoints";

export const fetchSubscriptionPlans = async () => {
  return api(endpoints.fetchSubscriptionPlans, {}, "get");
};

export const createSubscriptionClientSecret = async (data) => {
  return api(endpoints.createSubscriptionClientSecret, data, "post");
};

export const createSubscription = async (data) => {
  return api(SUBSCRIPTION_ENDPOINTS.CREATE, data, "post");
};

export const initiateSubscriptionSetup = async (data) => {
  return api(SUBSCRIPTION_ENDPOINTS.INITIATE_SETUP, data, "post");
};

export const confirmSubscriptionSetup = async (data) => {
  return api(SUBSCRIPTION_ENDPOINTS.CONFIRM_SETUP, data, "post");
};

export const cancelSubscription = async (data) => {
  return api(SUBSCRIPTION_ENDPOINTS.CANCEL, data, "post");
};

export const resumeSubscription = async (data) => {
  return api(SUBSCRIPTION_ENDPOINTS.RESUME, data, "post");
};

export const getCurrentSubscription = async (params) => {
  return api(SUBSCRIPTION_ENDPOINTS.CURRENT, params, "get");
};

export const getPaymentHistory = async (params) => {
  return api(SUBSCRIPTION_ENDPOINTS.HISTORY, params, "get");
};
