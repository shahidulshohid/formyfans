export const endpoints = {
  // create user
  createAccount: "auth/create-user",
  // otp verification
  otpVerification: "auth/verify-otp",
  // login api
  login: "auth/login-user",
  // fogot password
  forgotEmail: "auth/forgot-password",
  // send otp
  sendOtp: "auth/send-otp",
  // reset password
  resetPassword: "auth/reset-password",
  // fetch subscription plans
  fetchSubscriptionPlans: "subscription-plans/fetch",
  // buy scription
  createSubscriptionClientSecret: "auth/subscription/create-client-secret",
  buySubscription: "subscription/buy",
  // products
  createProduct: "products/create",
  getProducts: "products/creator/:creatorId",
  updateProduct: "products/:id",
  deleteProduct: "products/:id",
  updateProductStatus: "products/:id/status",
  //  fetch product list
  fetchProductList: "products/list",
  fetchProductVariants: "products/:id",
  // crrate order
  createOrder: "orders/create",
  getMyOrders: "orders/my",
  getShopOrders: "orders/shop",
  getOrderDetails: "orders/:orderId",
  changeOrderStatus: "orders/:orderId/status",
  createOrderClientSecret: "orders/create-client-secret",
  confirmOrderPayment: "orders/confirm-payment/:orderId",

  // POST ENDPOINTS
};

export const POST_ENDPOINTS = {
  CREATE: "posts",
  UPDATE: "posts/:postId",
  LIST: "posts",
  SINGLE: "posts/:postId",
  GET_COMMENTS: "posts/:postId/comments",
  CREATE_COMMENTS: "posts/:postId/comments",
  LIKE_DISLIKE_POST: "posts/:postId/like",
  // GET_POST_LIKES: "posts/:postId/likes",
  DELETE_POST: "posts/:postId",
  GET_POSTS_BY_USERNAME: "posts/username/:username",

  LIKE_POST: "posts/:postId/like",
  UNLIKE_POST: "posts/:postId/unlike",
  GET_POST_LIKES: "posts/:postId/likes",

  SHARE_POST: "posts/share",
};

export const CONVERSATION_ENDPOINTS = {
  CREATE: "conversations",
  LIST: "conversations",
};

export const MESSAGE_ENDPOINTS = {
  LIST: "messages/:id",
};

export const USER_ENDPOINTS = {
  UPDATE_PROFILE: "auth/profile",
  GET_PROFILE: "auth/profile",
  CHANGE_PASSWORD: "auth/change-password",
  CHECK_USERNAME_AVAILABILITY: "auth/check-username-availability",
  SUGGEST_USERNAME: "auth/suggest-username",
  ALL_CREATORS: "auth/creators",
  GET_PROFILE_BY_USERNAME: "auth/profile/:username",
  UPDATE_PROFILE_USERNAME: "auth/profile/username",
  SET_SUBSCRIPTION_PRICE: "auth/set-subscription-price",
  GET_SUBSCRIPTION_PRICE: "auth/creator/price",
  GET_FAN_SUBSCRIBE: "auth/fan/subscribe/:creatorId",
};

export const FOLLOW_UNFOLLOW_ENDPOINTS = {
  FOLLOW: "follow",
  UNFOLLOW: "follow/:userId",
  IS_FOLLOWING: "follow/:userId/is-following",
  GET_FOLLOWERS: "follow/followers",
  GET_FOLLOWING: "follow/following",
  GET_FOLLOWERS_SUGGESTIONS: "follow/followers/suggestions",
  DISMISS_FOLLOWERS_SUGGESTION: "follow/followers/suggestions/dismiss",
};

export const MEDIA_ENDPOINTS = {
  UPLOAD: "media/upload",
  DELETE: "media/:id",
  GET_MEDIA_BY_USERNAME: "media/username/:username",
};

export const ACTIVITY_ENDPOINTS = {
  GET_ACTIVITY_LOGS: "activity-logs",
};

export const FAVORITE_ENDPOINTS = {
  ADD_TO_FAVORITES: "favourites",
  REMOVE_FROM_FAVORITES: "favourites/:favouriteId",
  GET_FAVORITES: "favourites",
};

export const LIKE_DISLIKE_ENDPOINTS = {
  LIKE: "likes/:postId/like",
  UNLIKE: "likes/:postId/unlike",
  GET_LIKES: "likes/:postId/likes",
};

export const STORY_ENDPOINTS = {
  CREATE: "stories",
  ACTIVE_STORIES: "stories/active",
};

export const Notification_ENDPOINTS = {
  GET_NOTIFICATIONS: "notifications",
};

export const SUBSCRIPTION_ENDPOINTS = {
  CREATE: "subscription/create",
  INITIATE_SETUP: "subscription/initiate-setup",
  CONFIRM_SETUP: "subscription/confirm-setup",
  CANCEL: "subscription/cancel",
  RESUME: "subscription/resume",
  CURRENT: "subscription/current",
  HISTORY: "subscription/history",
};

export const EXCLUSIVE_CONTENT = {
  CREATE: "exclusive-content",
  GET_EXCLUSIVE_CONTENT: "exclusive-content/username/:username",
  SINGLE: "exclusive-content/:id",
  UPDATE_EXCLUSIVE_CONTENT: "exclusive-content/:id",
  DELETE_EXCLUSIVE_CONTENT: "exclusive-content/:id",
  GET_COMMENTS: "posts/:postId/comments",
  CREATE_COMMENTS: "posts/:postId/comments",
  LIKE_DISLIKE_POST: "posts/:postId/like",
  LIKE_POST: "posts/:postId/like",
  UNLIKE_POST: "posts/:postId/unlike",
  GET_POST_LIKES: "posts/:postId/likes",
};

export const FAN_SUBSCRIPTION = {
  INITIAL_FAN_SUBSCRIPTION: "fan/subscribe/initiate/:username",
  CONFIRM_FAB_SUBSCRIPTION: "fan/subscribe/confirm/:username",
  CANCEL_FAN_SUBSCRIPTION: "fan/subscribe/cancel/:username",
  RESUME_FAB_SUBSCRIPTION: "fan/subscribe/resume/:username",
  GET_FAN_SUBSCRIPTION_STATUS: "fan/subscribe/status/:username",
};
