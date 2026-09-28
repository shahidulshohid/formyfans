export * from "./credits";
export * from "./prompts";
export * from "./generations";
export * from "./uploads";
export * from "./aiSocket";
export * from "./downloadMedia";
export * from "./aiChatbot";

import creditsApi from "./credits";
import promptsApi from "./prompts";
import generationsApi from "./generations";
import uploadsApi from "./uploads";
import socketApi from "./aiSocket";
import downloadApi from "./downloadMedia";
import aiChatbotApi from "./aiChatbot";

export default {
  ...creditsApi,
  ...promptsApi,
  ...generationsApi,
  ...uploadsApi,
  ...socketApi,
  ...downloadApi,
  ...aiChatbotApi,
};

