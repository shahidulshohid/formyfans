import api from "../index";
import { endpoints } from "../endpoints";


export const forgotPassword = async (data) => {
    return api(endpoints.forgotEmail, data, "post");
}