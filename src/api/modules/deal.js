import api from "../index";
import { DEAL, EXCLUSIVE_CONTENT } from "../endpoints";

const acceptDeal = async (dealId) => {
  return api(DEAL.ACCEPT.replace(":dealId", dealId), {}, "patch");
};

const rejectDeal = async (dealId, payload) => {
  return api(DEAL.REJECT.replace(":dealId", dealId), payload, "patch");
};

const getReceivedStartedDeals = async (type) => {
  return api(DEAL.RECEIVED_STARTED, { type }, "get");
}

export { acceptDeal, rejectDeal, getReceivedStartedDeals };
