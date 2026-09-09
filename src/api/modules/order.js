import api from "../index";
import { endpoints } from "../endpoints";

export const createOrder = async (data) => {
    return api(endpoints.createOrder, data, "post");
};

/** Buyer — orders I placed */
export const getMyOrders = async (params = {}) => {
    return api(endpoints.getMyOrders, params, "get");
};

/** Creator shop — orders received on my products */
export const getShopOrders = async (params = {}) => {
    return api(endpoints.getShopOrders, params, "get");
};

export const getOrderDetails = async (orderId) => {
    const path = endpoints.getOrderDetails.replace(":orderId", String(orderId));
    return api(path, {}, "get");
};

export const changeOrderStatus = async (orderId, data) => {
    const path = endpoints.changeOrderStatus.replace(":orderId", String(orderId));
    return api(path, data, "patch");
};
