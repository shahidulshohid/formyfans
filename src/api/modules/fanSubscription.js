import { FAN_SUBSCRIPTION } from "../endpoints";
import api from "../index";

const initialFanSubscription = async (username) => {
  return api(
    FAN_SUBSCRIPTION.INITIAL_FAN_SUBSCRIPTION.replace(":username", username),
    {},
    "post",
  );
};

const confirmFanSubscription = async (username, payload) => {
  return api(
    FAN_SUBSCRIPTION.CONFIRM_FAB_SUBSCRIPTION.replace(":username", username),
    payload,
    "post",
  );
};

const cancelFanSubscription = async (username) => {
  return api(
    FAN_SUBSCRIPTION.CANCEL_FAN_SUBSCRIPTION.replace(":username", username),
    {},
    "post",
  );
};

const resumeFanSubscription = async (username) => {
  return api(
    FAN_SUBSCRIPTION.RESUME_FAB_SUBSCRIPTION.replace(":username", username),
    {},
    "post",
  );
};

const getFanSubscriptionStatus = async (username) => {
  return api(
    FAN_SUBSCRIPTION.GET_FAN_SUBSCRIPTION_STATUS.replace(":username", username),
    {},
    "get",
  );
};

export {
  initialFanSubscription,
  confirmFanSubscription,
  cancelFanSubscription,
  resumeFanSubscription,
  getFanSubscriptionStatus,
};
