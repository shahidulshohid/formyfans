import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import https from "https";
import http from "http";
import { URL } from "url";

function s3UploadProxyPlugin() {
  return {
    name: "s3-upload-proxy-plugin",
    configureServer(server) {
      server.middlewares.use("/s3-upload-proxy", (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, OPTIONS");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, x-target-s3-url, Authorization, *"
        );

        if (req.method === "OPTIONS") {
          res.statusCode = 200;
          res.end();
          return;
        }

        const targetUrl =
          req.headers["x-target-s3-url"] ||
          new URL(req.url, "http://localhost").searchParams.get("url");

        if (!targetUrl) {
          res.statusCode = 400;
          res.end(
            JSON.stringify({ error: "Missing target S3 URL in header or query" })
          );
          return;
        }

        try {
          const parsedTarget = new URL(targetUrl);
          const client = parsedTarget.protocol === "https:" ? https : http;

          const forwardHeaders = { ...req.headers };
          forwardHeaders.host = parsedTarget.host;
          delete forwardHeaders["x-target-s3-url"];
          delete forwardHeaders["origin"];
          delete forwardHeaders["referer"];
          delete forwardHeaders["sec-fetch-mode"];
          delete forwardHeaders["sec-fetch-site"];
          delete forwardHeaders["sec-fetch-dest"];

          const proxyReq = client.request(
            targetUrl,
            {
              method: req.method || "PUT",
              headers: forwardHeaders,
            },
            (proxyRes) => {
              res.statusCode = proxyRes.statusCode || 200;
              res.setHeader("Access-Control-Allow-Origin", "*");
              Object.keys(proxyRes.headers).forEach((key) => {
                try {
                  res.setHeader(key, proxyRes.headers[key]);
                } catch {
                  // ignore header errors
                }
              });
              proxyRes.pipe(res);
            }
          );

          proxyReq.on("error", (err) => {
            console.error("S3 Proxy Error:", err);
            res.statusCode = 500;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(JSON.stringify({ error: err.message }));
          });

          req.pipe(proxyReq);
        } catch (err) {
          console.error("S3 Proxy General Error:", err);
          res.statusCode = 500;
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const PATH_BASENAME = env.VITE_ROUTE_BASENAME || "social";

  return {
    plugins: [react(), s3UploadProxyPlugin()],
    base: `/${PATH_BASENAME}/`,
  };
});


