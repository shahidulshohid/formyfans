/** Parse create-order axios response — orderId may be on root or nested. */
export const parseCreateOrderResponse = (axiosResponse) => {
    const body = axiosResponse?.data ?? {};
    const inner = body.data;

    const orderId =
        body.orderId ??
        body.order?.orderId ??
        (inner && typeof inner === "object" && !Array.isArray(inner)
            ? inner.orderId ?? inner.order?.orderId
            : null) ??
        null;

    return { orderId, raw: body };
};

/** Pull orderId from a stored result object (post-parse or legacy shapes). */
export const extractOrderId = (data) => {
    if (!data) return null;
    if (typeof data === "string") return data;
    return (
        data.orderId ??
        data.order?.orderId ??
        data.raw?.orderId ??
        data.raw?.order?.orderId ??
        null
    );
};

export const extractOrderIds = (results = []) => {
    const ids = results.map(extractOrderId).filter(Boolean);
    return [...new Set(ids)];
};

export const LAST_ORDER_IDS_KEY = "lastOrderIds";

export const saveLastOrderIds = (orderIds) => {
    if (!orderIds?.length) return;
    sessionStorage.setItem(LAST_ORDER_IDS_KEY, JSON.stringify(orderIds));
};

export const loadLastOrderIds = () => {
    try {
        const stored = JSON.parse(sessionStorage.getItem(LAST_ORDER_IDS_KEY) || "[]");
        return Array.isArray(stored) ? stored.filter(Boolean) : [];
    } catch {
        return [];
    }
};
