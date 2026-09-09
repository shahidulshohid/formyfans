import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const PATH_BASENAME = env.VITE_ROUTE_BASENAME || "social";

  return {
    plugins: [react()],
    base: `/${PATH_BASENAME}/`,
  };
});
