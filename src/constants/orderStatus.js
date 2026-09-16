export const ORDER_STATUS_OPTIONS = [
    { label: "Pending", value: "pending" },
    { label: "Accepted", value: "accepted" },
    { label: "In Progress", value: "in_progress" },
    { label: "Delivered", value: "delivered" },
];

/** App theme: pink #FF1572, maroon #5E1321, green #0CA904 */
export const ORDER_STATUS_THEME = {
    pending: { color: "#FF1572", bg: "#FFE8F2" },
    accepted: { color: "#5E1321", bg: "#F5E6EA" },
    in_progress: { color: "#FFFFFF", bg: "#5E1321" },
    delivered: { color: "#0B7A06", bg: "#E6F9E5" },
    completed: { color: "#0B7A06", bg: "#E6F9E5" },
    complete: { color: "#0B7A06", bg: "#E6F9E5" },
};

export const normalizeOrderStatus = (status) => {
    const raw = String(status || "pending")
        .toLowerCase()
        .trim()
        .replace(/-/g, "_")
        .replace(/\s+/g, "_");

    if (raw === "in_process" || raw === "inprogress") return "in_progress";
    if (raw === "accept") return "accepted";
    if (raw === "delivery") return "delivered";
    if (raw === "completed" || raw === "complete") return "delivered";
    if (ORDER_STATUS_OPTIONS.some((o) => o.value === raw)) return raw;
    return "pending";
};

export const getOrderStatusTheme = (status) => {
    const key = normalizeOrderStatus(status);
    return ORDER_STATUS_THEME[key] ?? ORDER_STATUS_THEME.pending;
};

export const formatOrderStatusLabel = (status) => {
    const key = normalizeOrderStatus(status);
    const opt = ORDER_STATUS_OPTIONS.find((o) => o.value === key);
    return opt?.label ?? String(status || "pending").replace(/_/g, " ");
};
