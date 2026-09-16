import { useState, useCallback } from "react";
import { toast } from "react-toastify";

export const useCrud = ({ fetchFn, createFn, updateFn, deleteFn }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const request = useCallback(
        async (fn, successMessage) => {
            setLoading(true);
            setError("");
            try {
                const res = await fn();
                const isSuccess = res?.status >= 200 && res?.status < 300;

                if (!isSuccess) {
                    throw new Error(res?.data?.message || "Request failed");
                }
                if (successMessage) {
                    toast.success(successMessage);
                }

                const responseData = res?.data?.data ?? res?.data;
                return { success: true, data: responseData };
            } catch (err) {
                const message = err?.response?.data?.message || err.message;
                setError(message);
                toast.error(message || "Something went wrong");
                return { success: false, message };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const fetchAll = useCallback(
        (params) => request(() => fetchFn(params)),
        [request, fetchFn]
    );

    // ✅ All stable now
    const fetchById = useCallback(
        (id) => request(() => fetchFn(id)),
        [request, fetchFn]
    );

    const create = useCallback(
        (payload, msg = "") =>
            request(() => createFn(payload), msg),
        [request, createFn]
    );

    const update = useCallback(
        (id, payload, msg = "Updated successfully") =>
            request(() => updateFn(id, payload), msg),
        [request, updateFn]
    );

    const remove = useCallback(
        (id, msg = "Deleted successfully") =>
            request(() => deleteFn(id), msg),
        [request, deleteFn]
    );

    return { loading, error, request, fetchAll, fetchById, create, update, remove };
};