import { CONVERSATION_ENDPOINTS } from "../endpoints";
import api from "../index";

const createConversation = async (payload) => {
    return api(CONVERSATION_ENDPOINTS.CREATE, payload, "post");
};

const getConversations = async (params) => {
    return api(CONVERSATION_ENDPOINTS.LIST, params, "get");
};


export {
    createConversation,
    getConversations,
};
