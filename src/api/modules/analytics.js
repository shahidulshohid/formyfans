import { ANALYTICS_ENDPOINTS, BOOST_ENDPOINTS } from "../endpoints";
import api from "../index";

/**
 * Track impressions for visible feed posts (batch).
 * @param {string[]} postIds
 */
export const trackImpressions = (postIds) => {
  api(ANALYTICS_ENDPOINTS.TRACK_IMPRESSION, { postIds }, "post").catch(() => {});
};

/**
 * Track a profile visit from a boosted post (messages objective).
 * @param {string} postId
 */
export const trackProfileVisit = (postId) => {
  api(ANALYTICS_ENDPOINTS.TRACK_PROFILE_VISIT.replace(":postId", postId), null, "post").catch(() => {});
};

/**
 * Track a "Go to Website" click on a boosted post.
 * @param {string} boostId
 */
export const trackWebsiteClick = (boostId) => {
  api(BOOST_ENDPOINTS.WEBSITE_CLICK.replace(":boostId", boostId), null, "post").catch(() => {});
};
