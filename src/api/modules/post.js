import api from "../index";
import { endpoints, POST_ENDPOINTS } from "../endpoints";

const createPost = async (payload) => {
  return api(POST_ENDPOINTS.CREATE, payload, "post");
};

const getPosts = async (params) => {
  return api(POST_ENDPOINTS.LIST, params, "get");
};

const likeDislikePost = async (postId) => {
  return api(
    POST_ENDPOINTS.LIKE_DISLIKE_POST.replace(":postId", postId),
    {},
    "post",
  );
};

const createComment = async (postId, payload) => {
  return api(
    POST_ENDPOINTS.CREATE_COMMENTS.replace(":postId", postId),
    payload,
    "post",
  );
};

const getComments = async (postId, params) => {
  return api(
    POST_ENDPOINTS.GET_COMMENTS.replace(":postId", postId),
    params,
    "get",
  );
};

const getPostLikes = async (postId, params) => {
  return api(
    POST_ENDPOINTS.GET_POST_LIKES.replace(":postId", postId),
    params,
    "get",
  );
};

const deletePost = async (postId) => {
  return api(
    POST_ENDPOINTS.DELETE_POST.replace(":postId", postId),
    {},
    "delete",
  );
};

const updatePost = async (postId, payload) => {
  return api(POST_ENDPOINTS.UPDATE.replace(":postId", postId), payload, "put");
};

const getPostsByUsername = async (username, params) => {
  return api(
    POST_ENDPOINTS.GET_POSTS_BY_USERNAME.replace(":username", username),
    params,
    "get",
  );
};

const likePost = async (payload) => {
  return api(POST_ENDPOINTS.LIKE_POST, payload, "post");
};

const unlikePost = async (postId) => {
  return api(
    POST_ENDPOINTS.UNLIKE_POST.replace(":postId", postId),
    {},
    "delete",
  );
};

const sharePost = async (payload) => {
  return api(POST_ENDPOINTS.SHARE_POST, payload, "post");
};

const getPostById = async (postId) => {
  return api(POST_ENDPOINTS.SINGLE.replace(":postId", postId), {}, "get");
};

export {
  createPost,
  getPosts,
  likeDislikePost,
  createComment,
  getComments,
  getPostLikes,
  deletePost,
  updatePost,
  getPostsByUsername,
  likePost,
  unlikePost,
  sharePost,
  getPostById,
};
