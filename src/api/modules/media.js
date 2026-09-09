import api from "../index";
import { MEDIA_ENDPOINTS } from "../endpoints";


export const uploadMedia = async (data) => {
    return api(MEDIA_ENDPOINTS.UPLOAD, data, "post");
}

export const getMediaByUsername = async (username, params) => {
    return api(MEDIA_ENDPOINTS.GET_MEDIA_BY_USERNAME.replace(":username", username), params, "get");
}

export const deleteMedia = async (id) => {
    return api(MEDIA_ENDPOINTS.DELETE.replace(":id", id), {}, "delete");
}

