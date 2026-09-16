import { USER_ENDPOINTS } from "../endpoints";
import api from "../index";

const updateProfile = async (payload) => {
  return api(USER_ENDPOINTS.UPDATE_PROFILE, payload, "put");
};

const getProfile = async () => {
  return api(USER_ENDPOINTS.GET_PROFILE, {}, "get");
};

const changePassword = async (payload) => {
  return api(USER_ENDPOINTS.CHANGE_PASSWORD, payload, "put");
};

const getAllCreators = async (params) => {
  return api(USER_ENDPOINTS.ALL_CREATORS, params, "get");
};

const getProfileByUsername = async (username) => {
  return api(
    USER_ENDPOINTS.GET_PROFILE_BY_USERNAME.replace(":username", username),
    {},
    "get",
  );
};

const updateProfileUsername = async (payload) => {
  return api(USER_ENDPOINTS.UPDATE_PROFILE_USERNAME, payload, "patch");
};

const setCreatorSubscriptionPrice = async (payload) => {
  return api(USER_ENDPOINTS.SET_SUBSCRIPTION_PRICE, payload, "post");
};
const getCreatorSubscriptionPrice = async () => {
  return api(USER_ENDPOINTS.GET_SUBSCRIPTION_PRICE, {}, "get");
};
const getFanSubscribeOrNot = async (creatorId) => {
  return api(
    USER_ENDPOINTS.GET_FAN_SUBSCRIBE.replace(":creatorId", creatorId),
    {},
    "get",
  );
};

export {
  updateProfile,
  getProfile,
  changePassword,
  getAllCreators,
  getProfileByUsername,
  updateProfileUsername,
  setCreatorSubscriptionPrice,
  getCreatorSubscriptionPrice,
  getFanSubscribeOrNot,
};
