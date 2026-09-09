import api from "../index";
import { endpoints } from "../endpoints";

export const resetPassword = async (data) => {
  return api(endpoints.resetPassword, data, "post");
};
