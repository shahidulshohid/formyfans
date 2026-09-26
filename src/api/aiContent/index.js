export * from "./credits";
export * from "./prompts";
export * from "./generations";

import creditsApi from "./credits";
import promptsApi from "./prompts";
import generationsApi from "./generations";

export default {
  ...creditsApi,
  ...promptsApi,
  ...generationsApi,
};
