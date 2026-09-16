import api from "../index";
import { ACTIVITY_ENDPOINTS } from "../endpoints";

export const getActivityLogs = async (params) => {
    return api(ACTIVITY_ENDPOINTS.GET_ACTIVITY_LOGS, params, "get");
};