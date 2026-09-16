import { MESSAGE_ENDPOINTS } from "../endpoints";
import api from "../index";

const getMessages = async (id, params) => {
    return api(MESSAGE_ENDPOINTS.LIST.replace(":id", id), params, "get");
};

export {
    getMessages,
};
