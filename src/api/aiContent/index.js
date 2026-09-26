export * from "./credits";
export * from "./prompts";
export * from "./generations";
export * from "./aiSocket";

import creditsApi from "./credits";
import promptsApi from "./prompts";
import generationsApi from "./generations";
import socketApi from "./aiSocket";

export default {
  ...creditsApi,
  ...promptsApi,
  ...generationsApi,
  ...socketApi,
};
