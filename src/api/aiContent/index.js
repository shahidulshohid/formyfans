export * from "./credits";
export * from "./prompts";
export * from "./generations";
export * from "./aiSocket";
export * from "./downloadMedia";

import creditsApi from "./credits";
import promptsApi from "./prompts";
import generationsApi from "./generations";
import socketApi from "./aiSocket";
import downloadApi from "./downloadMedia";

export default {
  ...creditsApi,
  ...promptsApi,
  ...generationsApi,
  ...socketApi,
  ...downloadApi,
};
