import api from "../index";
import { endpoints } from "../endpoints";

/** POST orders/create-client-secret — body: { amount, orderId } */
export const createOrderClientSecret = async (data) => {
    return api(endpoints.createOrderClientSecret, data, "post");
};

/** POST orders/confirm-payment/:orderId — body: { paymentIntentId } */
export const confirmOrderPayment = async (orderId, data) => {
    const path = endpoints.confirmOrderPayment.replace(":orderId", String(orderId));
    return api(path, data, "post");
};
