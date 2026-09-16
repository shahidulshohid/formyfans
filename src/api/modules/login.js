import api from "../index";
import { endpoints } from "../endpoints";



export const login = async (data) => {
    return api(endpoints.login, data, "post");
}