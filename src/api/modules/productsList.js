import api from "../index";
import { endpoints } from "../endpoints";

export const fetchProductListApi = async () => {
  return api(endpoints.fetchProductList, {}, "get");
};

export const fetchProductVariantsApi = async (productCodeOrId) => {
  const id = String(productCodeOrId);
  return api(endpoints.fetchProductVariants.replace(":id", id), {}, "get");
};
