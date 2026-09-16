import { endpoints } from "../endpoints";
import api from "../index";

export const createProduct = (data) => {
    return api(endpoints.createProduct, data, "post");
};

export const getProducts = ({ creatorId, page = 1, limit = 10 } = {}) => {
    const path = endpoints.getProducts.replace(":creatorId", String(creatorId));
    return api(path, { page, limit }, "get");
};

export const updateProduct = (productId, data) => {
    const path = endpoints.updateProduct.replace(":id", String(productId));
    return api(path, data, "put");
};

export const deleteProduct = (productId) => {
    const path = endpoints.deleteProduct.replace(":id", String(productId));
    return api(path, {}, "delete");
};

export const updateProductStatus = (productId, data) => {
    const path = endpoints.updateProductStatus.replace(":id", String(productId));
    return api(path, data, "patch");
};
