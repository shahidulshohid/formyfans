import axios from "axios";
import { toast } from "react-toastify";
import useUserStore from "../zustand/userUserStore";

export const baseUrl = `${import.meta.env.VITE_BASE_URL}/api/`;

let isHandlingUnauthorized = false;

const isUnauthorizedResponse = (response) => {
  if (!response) return false;

  const status = response.status;
  const dataStatus = response.data?.status?.toLowerCase?.();
  const message = response.data?.message?.toLowerCase?.() || "";

  return (
    status === 401 ||
    dataStatus === "unauthorized" ||
    message.includes("unauthorized") ||
    message.includes("session expired")
  );
};

const handleUnauthorized = () => {
  if (isHandlingUnauthorized) return;

  const hadToken = Boolean(useUserStore.getState().token);
  if (!hadToken) return;

  isHandlingUnauthorized = true;

  useUserStore.getState().clearUserData();
  toast.error("Your session has expired. Please login again.");

  const basePath = import.meta.env.BASE_URL || "/";
  window.location.replace(basePath.endsWith("/") ? basePath : `${basePath}/`);
};

const api = async (path, params, method, isMultipart = false) => {
  let userToken = JSON.parse(localStorage.getItem("userData"))?.state?.token;
  const isAuthenticatedRequest = Boolean(userToken);

  // Handle query parameters for GET requests
  let url = path;
  if (method === "get" && params) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== null &&
        params[key] !== undefined &&
        params[key] !== ""
      ) {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      url = `${path}?${queryString}`;
    }
  }

  const options = {
    headers: {
      ...(userToken && {
        Authorization: `Bearer ${userToken}`,
      }),
    },
    method,
    // For GET requests, params go in URL, for others in body
    ...(method !== "get" &&
      params && {
      data: params,
    }),
  };

  if (!isMultipart) {
    options.headers["Content-Type"] = "application/json";
  }

  try {
    const response = await axios(baseUrl + url, options);

    if (isUnauthorizedResponse(response) && isAuthenticatedRequest) {
      handleUnauthorized();
    }

    return response;
  } catch (error) {
    if (isUnauthorizedResponse(error.response) && isAuthenticatedRequest) {
      handleUnauthorized();
    }

    return (
      error.response || { status: 500, data: { message: "Unknown error" } }
    );
  }
};

export default api;
