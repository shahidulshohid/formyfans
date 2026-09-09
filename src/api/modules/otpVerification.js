import api from "../index";
import { endpoints } from "../endpoints";



export const otpVerification = async (data) => {
    return api(endpoints.otpVerification, data, "post");
};

export const verifyForgotPasswordOtp = otpVerification;