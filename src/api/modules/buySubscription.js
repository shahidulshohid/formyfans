import api from "../index";
import { endpoints } from "../endpoints";


export const buySubscription = async (data) => {
    return api(endpoints.buySubscription, data, "post");
}