import { FAVORITE_ENDPOINTS } from "../endpoints";
import api from "../index";

export const addToFavorites = async (data) => {
    return api(FAVORITE_ENDPOINTS.ADD_TO_FAVORITES, data, "post");
}

export const removeFromFavorites = async (favouriteId) => {
    return api(FAVORITE_ENDPOINTS.REMOVE_FROM_FAVORITES.replace(":favouriteId", favouriteId), null, "delete");
}

export const getFavorites = async () => {
    return api(FAVORITE_ENDPOINTS.GET_FAVORITES, null, "get");
}