import { STORY_ENDPOINTS } from "../endpoints";
import api from "../index";

export const createStory = async (data) => {
  return api(STORY_ENDPOINTS.CREATE, data, "post");
};

export const getActiveStories = async () => {
  return api(STORY_ENDPOINTS.ACTIVE_STORIES, {}, "get");
};
