import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
    createOrder as createOrderApi,
    getMyOrders as getMyOrdersApi,
    getShopOrders as getShopOrdersApi,
    getOrderDetails as getOrderDetailsApi,
    changeOrderStatus as changeOrderStatusApi,
} from "../../api/modules/order";
import { parseCreateOrderResponse } from "../../utils/orderResponse";
import { parseOrdersList, extractOrderFromResponse } from "../../utils/orderTable";

const handleApiError = (res, fallback) => {
    const message = res?.data?.message || fallback;
    toast.error(message);
    return { success: false, message };
};

export const useOrder = () => {
    const [loading, setLoading] = useState(false);
    const [listLoading, setListLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [statusUpdatingId, setStatusUpdatingId] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const loadOrders = useCallback(async (fetchFn, errorLabel = "Failed to load orders") => {
        setListLoading(true);
        try {
            const res = await fetchFn();
            const ok = res?.status >= 200 && res?.status < 300;
            if (!ok) return handleApiError(res, errorLabel);

            const list = parseOrdersList(res?.data);
            setOrders(list);
            return { success: true, data: list, pagination: res?.data?.pagination };
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || errorLabel;
            toast.error(message);
            return { success: false, message };
        } finally {
            setListLoading(false);
        }
    }, []);

    /** Creator — Orders List sidebar (`orders/shop`) */
    const fetchShopOrders = useCallback(
        async (params = {}) => loadOrders(() => getShopOrdersApi(params)),
        [loadOrders],
    );

    /** Buyer — My Orders tab (`orders/my`) */
    const fetchMyOrders = useCallback(
        async (params = {}) => loadOrders(() => getMyOrdersApi(params)),
        [loadOrders],
    );

    const fetchOrderDetails = useCallback(async (orderId) => {
        if (!orderId) {
            toast.error("Order ID missing");
            return { success: false };
        }
        setDetailLoading(true);
        try {
            const res = await getOrderDetailsApi(orderId);
            const ok = res?.status >= 200 && res?.status < 300;
            if (!ok) return handleApiError(res, "Failed to load order details");

            const order = extractOrderFromResponse(res?.data);
            if (!order) return handleApiError(res, "Order not found");
            return { success: true, data: order };
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || "Failed to load order details";
            toast.error(message);
            return { success: false, message };
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const changeOrderStatus = useCallback(async (row, status) => {
        const orderId = row.orderId || row.raw?.orderId;
        if (!orderId) {
            toast.error("Order ID missing");
            return { success: false };
        }

        setStatusUpdatingId(row._id || orderId);
        try {
            const res = await changeOrderStatusApi(orderId, { status });
            const ok = res?.status >= 200 && res?.status < 300;
            if (!ok) return handleApiError(res, "Failed to update status");

            toast.success(res?.data?.message || "Order status updated");
            setOrders((prev) =>
                prev.map((o) => {
                    const id = o.orderId || o._id;
                    if (id === orderId || o._id === row._id) {
                        return { ...o, status };
                    }
                    return o;
                }),
            );
            return { success: true, data: res?.data };
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || "Failed to update status";
            toast.error(message);
            return { success: false, message };
        } finally {
            setStatusUpdatingId(null);
        }
    }, []);

    const placeOrder = useCallback(async (data) => {
        setLoading(true);
        try {
            const res = await createOrderApi(data);
            const isSuccess = res?.status >= 200 && res?.status < 300;
            if (!isSuccess) return handleApiError(res, "Order failed");

            const parsed = parseCreateOrderResponse(res);
            return {
                success: true,
                data: { orderId: parsed.orderId, ...parsed.raw },
            };
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || "Order failed";
            toast.error(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const placeOrders = useCallback(async (payloads) => {
        setLoading(true);
        try {
            const results = [];
            for (const data of payloads) {
                const res = await createOrderApi(data);
                const isSuccess = res?.status >= 200 && res?.status < 300;
                if (!isSuccess) return handleApiError(res, "Order failed");

                const parsed = parseCreateOrderResponse(res);
                results.push({ orderId: parsed.orderId, ...parsed.raw });
            }
            return { success: true, data: results };
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || "Order failed";
            toast.error(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        orders,
        fetchShopOrders,
        fetchMyOrders,
        fetchOrderDetails,
        changeOrderStatus,
        statusUpdatingId,
        detailLoading,
        placeOrder,
        placeOrders,
        loading,
        listLoading,
    };
};
