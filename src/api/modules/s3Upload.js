import api from "../index";
import { S3_ENDPOINTS } from "../endpoints";

export const getPresignedUrlApi = async (fileName , fileType , folder ) => {
  return api(S3_ENDPOINTS.UPLOAD, { fileName, fileType, folder }, "post");
};