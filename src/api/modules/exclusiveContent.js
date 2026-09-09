import api from "../index";
import { EXCLUSIVE_CONTENT } from "../endpoints";

const createExclusiveContent = async (payload) => {
  return api(EXCLUSIVE_CONTENT.CREATE, payload, "post");
};

const getExclusiveContentByUsername = async (username, params) => {
  return api(
    EXCLUSIVE_CONTENT.GET_EXCLUSIVE_CONTENT.replace(":username", username),
    params,
    "get",
  );
};

const updateExclusiveContent = async (id, payload) => {
  return api(
    EXCLUSIVE_CONTENT.UPDATE_EXCLUSIVE_CONTENT.replace(":id", id),
    payload,
    "put",
  );
};

const deleteExclusiveContent = async (id) => {
  return api(
    EXCLUSIVE_CONTENT.DELETE_EXCLUSIVE_CONTENT.replace(":id", id),
    {},
    "delete",
  );
};

const getExclusiveContentById = async (id) => {
  return api(EXCLUSIVE_CONTENT.SINGLE.replace(":id", id), {}, "get");
};

const getExclusiveContentComments = async (id, params) => {
  return api(
    EXCLUSIVE_CONTENT.GET_COMMENTS.replace(":postId", id),
    params,
    "get",
  );
};

const createExclusiveContentComment = async (id, payload) => {
  return api(
    EXCLUSIVE_CONTENT.CREATE_COMMENTS.replace(":postId", id),
    payload,
    "post",
  );
};

const getExclusiveContentLikes = async (postId, params) => {
  return api(
    EXCLUSIVE_CONTENT.GET_PO.replace(":postId", postId),
    params,
    "get",
  );
};

const likeExclusiveContent = async (payload) => {
  return api(EXCLUSIVE_CONTENT.LIKE_POST, payload, "post");
};

const unlikeExclusiveContent = async (postId) => {
  return api(
    EXCLUSIVE_CONTENT.UNLIKE_POST.replace(":postId", postId),
    {},
    "delete",
  );
};

export {
  createExclusiveContent,
  getExclusiveContentByUsername,
  updateExclusiveContent,
  deleteExclusiveContent,
  getExclusiveContentById,
  getExclusiveContentComments,
  createExclusiveContentComment,
  likeExclusiveContent,
  unlikeExclusiveContent,
  getExclusiveContentLikes,
};
