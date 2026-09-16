import api from "../index";
import { LIVE_STREAM_ENDPOINTS } from "../endpoints";

export const getLiveStreams = async () =>
  api(LIVE_STREAM_ENDPOINTS.LIST, {}, "get");

export const createLiveStream = async (payload) =>
  api(LIVE_STREAM_ENDPOINTS.CREATE, payload, "post");

export const getLiveStream = async (streamId) =>
  api(
    LIVE_STREAM_ENDPOINTS.SINGLE.replace(":streamId", streamId),
    {},
    "get",
  );

export const getLiveStreamToken = async (streamId) =>
  api(
    LIVE_STREAM_ENDPOINTS.TOKEN.replace(":streamId", streamId),
    {},
    "post",
  );

export const endLiveStream = async (streamId) =>
  api(
    LIVE_STREAM_ENDPOINTS.END.replace(":streamId", streamId),
    {},
    "post",
  );

export const getLiveStreamComments = async (streamId, params) =>
  api(
    LIVE_STREAM_ENDPOINTS.COMMENTS.replace(":streamId", streamId),
    params,
    "get",
  );

export const createLiveStreamComment = async (streamId, payload) =>
  api(
    LIVE_STREAM_ENDPOINTS.COMMENTS.replace(":streamId", streamId),
    payload,
    "post",
  );

export const createFanbugIntent = async (streamId, payload) =>
  api(
    LIVE_STREAM_ENDPOINTS.FANBUG_INTENT.replace(":streamId", streamId),
    payload,
    "post",
  );

export const confirmFanbug = async (streamId, payload) =>
  api(
    LIVE_STREAM_ENDPOINTS.FANBUG_CONFIRM.replace(":streamId", streamId),
    payload,
    "post",
  );

export const getLiveStreamFanbugs = async (streamId, params) =>
  api(
    LIVE_STREAM_ENDPOINTS.FANBUGS.replace(":streamId", streamId),
    params,
    "get",
  );
