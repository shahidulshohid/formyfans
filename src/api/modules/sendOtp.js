import api from "../index";
import { endpoints } from "../endpoints";

export const sendOtp = async (data) => {
  return api(endpoints.sendOtp, data, "post");
};
