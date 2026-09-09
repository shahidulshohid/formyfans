import api from "../index";
import { endpoints, USER_ENDPOINTS } from "../endpoints";

export const createAccount = async (data) => {
  return api(endpoints.createAccount, data, "post");
};

export const checkUsernameAvailability = async (data) => {
  return api(USER_ENDPOINTS.CHECK_USERNAME_AVAILABILITY, data, "post");
};

export const suggestUsername = async (data) => {
  return api(USER_ENDPOINTS.SUGGEST_USERNAME, data, "post");
};
