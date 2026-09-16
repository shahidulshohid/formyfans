export const ALLOWED_FOLDERS = ["media", "docs", "voice"];

export const getFullS3Url = (fileName) => {
    if (!fileName) return "";
    if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
      return fileName;
    }
    return `${import.meta.env.VITE_S3_BASE_URL}${fileName}`;
  };