import api from "../index";
import { CAMPAIGN_ENDPOINTS } from "../endpoints";

const getCampaignById = async (campaignId) => {
  return api(
    CAMPAIGN_ENDPOINTS.SINGLE.replace(":campaignId", campaignId),
    {},
    "get",
  );
};

const likeCampaign = async (campaignId) => {
  return api(
    CAMPAIGN_ENDPOINTS.LIKE.replace(":campaignId", campaignId),
    {},
    "post",
  );
};

const unlikeCampaign = async (campaignId) => {
  return api(
    CAMPAIGN_ENDPOINTS.UNLIKE.replace(":campaignId", campaignId),
    {},
    "delete",
  );
};

const getCampaignLikes = async (campaignId, params) => {
  return api(
    CAMPAIGN_ENDPOINTS.LIKES.replace(":campaignId", campaignId),
    params,
    "get",
  );
};

const createCampaignComment = async (campaignId, payload) => {
  return api(
    CAMPAIGN_ENDPOINTS.COMMENTS.replace(":campaignId", campaignId),
    payload,
    "post",
  );
};

const getCampaignComments = async (campaignId, params) => {
  return api(
    CAMPAIGN_ENDPOINTS.COMMENTS.replace(":campaignId", campaignId),
    params,
    "get",
  );
};

const shareCampaign = async (payload) => {
  return api(CAMPAIGN_ENDPOINTS.SHARE, payload, "post");
};

export {
  getCampaignById,
  likeCampaign,
  unlikeCampaign,
  getCampaignLikes,
  createCampaignComment,
  getCampaignComments,
  shareCampaign,
};
