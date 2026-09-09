import api from "../index";
import { FOLLOW_UNFOLLOW_ENDPOINTS } from "../endpoints";


export const follow = async (data) => {
    return api(FOLLOW_UNFOLLOW_ENDPOINTS.FOLLOW, data, "post");
}

export const unfollow = async (userId) => {
    return api(
        FOLLOW_UNFOLLOW_ENDPOINTS.UNFOLLOW.replace(":userId", userId),
        null,
        "delete",
    );
};

export const isFollowing = async (userId) => {
    return api(
        FOLLOW_UNFOLLOW_ENDPOINTS.IS_FOLLOWING.replace(":userId", userId),
        null,
        "get",
    );
};

export const getFollowers = async (params) => {
    return api(
        FOLLOW_UNFOLLOW_ENDPOINTS.GET_FOLLOWERS,
        params,
        "get",
    );
};

export const getFollowing = async (params) => {
    return api(
        FOLLOW_UNFOLLOW_ENDPOINTS.GET_FOLLOWING,
        params,
        "get",
    );
};

export const getFollowersSuggestions = async (params) => {
    return api(
        FOLLOW_UNFOLLOW_ENDPOINTS.GET_FOLLOWERS_SUGGESTIONS,
        params,
        "get",
    );
};

export const dismissFollowersSuggestion = async (payload) => {
    return api(
        FOLLOW_UNFOLLOW_ENDPOINTS.DISMISS_FOLLOWERS_SUGGESTION,
        payload,
        "post",
    );
};