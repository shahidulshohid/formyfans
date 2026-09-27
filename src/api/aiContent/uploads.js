import axios from "axios";
import api from "../index";
import { AI_CONTENT_ENDPOINTS } from "../endpoints";

/**
 * Request Presigned S3 Upload URL for AI Content Inputs
 * POST /ai/uploads/presign
 * @param {Object} params
 * @param {string} params.fileName - Name of file e.g. "input_video.mp4"
 * @param {string} params.fileType - MIME type e.g. "video/mp4", "image/png"
 * @param {string} params.fileCategory - "videoReference" | "imageReference"
 * @returns {Promise<Object>} API response with data: { uploadUrl, fileKey, expiresIn }
 */
export const getAiPresignedUploadUrl = async ({ fileName, fileType, fileCategory }) => {
  const endpoint = AI_CONTENT_ENDPOINTS.PRESIGN_UPLOAD || "ai/uploads/presign";
  return api(
    endpoint,
    {
      fileName,
      fileType,
      fileCategory,
    },
    "post"
  );
};

/**
 * Upload an AI input file to S3 via Presigned URL
 * 1. Calls POST /ai/uploads/presign to get S3 PUT URL and fileKey
 * 2. Uploads binary data directly to S3 (via Vite local proxy to eliminate CORS 403)
 * @param {File} file - Browser File instance
 * @param {"videoReference"|"imageReference"} fileCategory
 * @param {Function} [onProgress] - Optional progress callback (percent: number) => void
 * @returns {Promise<{ uploadUrl: string, fileKey: string, success: boolean }>}
 */
export const uploadAiFileToS3 = async (file, fileCategory, onProgress) => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const fileName = file.name;
  const fileType =
    file.type ||
    (fileCategory === "videoReference" ? "video/mp4" : "image/png");

  // Step 1: Request presigned URL from backend
  const presignRes = await getAiPresignedUploadUrl({
    fileName,
    fileType,
    fileCategory,
  });

  const resBody = presignRes?.data;
  const isSuccess =
    presignRes?.status >= 200 &&
    presignRes?.status < 300 &&
    (resBody?.status === "success" || Boolean(resBody?.data?.uploadUrl));

  if (!isSuccess || !resBody?.data?.uploadUrl) {
    const errorMsg =
      resBody?.message || "Failed to generate presigned upload URL.";
    throw new Error(errorMsg);
  }

  const { uploadUrl, fileKey } = resBody.data;

  // Step 2: Upload binary data to S3 (using local proxy in dev to avoid CORS preflight 403)
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  let uploadSuccess = false;

  if (isLocal) {
    try {
      await axios.put("/s3-upload-proxy", file, {
        headers: {
          "Content-Type": fileType,
          "x-target-s3-url": uploadUrl,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && typeof onProgress === "function") {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percent);
          }
        },
      });
      uploadSuccess = true;
    } catch (proxyErr) {
      console.warn("Proxy upload failed, attempting direct S3 PUT:", proxyErr);
    }
  }

  if (!uploadSuccess) {
    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": fileType,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && typeof onProgress === "function") {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        }
      },
    });
  }

  if (typeof onProgress === "function") {
    onProgress(100);
  }

  return {
    uploadUrl,
    fileKey,
    success: true,
  };
};

export default {
  getAiPresignedUploadUrl,
  uploadAiFileToS3,
};
