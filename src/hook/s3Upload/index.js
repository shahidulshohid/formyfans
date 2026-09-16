import { getPresignedUrlApi } from "../../api/modules/s3Upload";
import { ALLOWED_FOLDERS } from "../../utils/s3Helper";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const useS3Upload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(async (file, folder = "media") => {
    if (!ALLOWED_FOLDERS.includes(folder)) {
      const message = `Invalid folder "${folder}". Allowed: ${ALLOWED_FOLDERS.join(", ")}`;
      toast.error(message);
      return { success: false, message };
    }
    setUploading(true);
    setProgress(0);
    try {
      const res = await getPresignedUrlApi(file.name, file.type, folder);

      const isSuccess = res?.status >= 200 && res?.status < 300;
      if (!isSuccess) {
        const message = res?.data?.message || "Failed to get presigned URL";
        toast.error(message);
        return { success: false, message };
      }

      const { presignedUrl, fileName } = res?.data?.data ?? res?.data;

      await axios.put(presignedUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percent);
        },
      });

      return { success: true, data: { fileName } };
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      toast.error(message);
      return { success: false, message };
    } finally {
      setUploading(false);
    }
  }, []);

  return {
    uploadFile,
    uploading,
    progress,
  };
};