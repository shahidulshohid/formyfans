import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
    createProduct as createProductApi,
    deleteProduct as deleteProductApi,
    getProducts as getProductsApi,
    updateProduct as updateProductApi,
    updateProductStatus as updateProductStatusApi,
} from "../../api/modules/products";
import { useCrud } from "../common/useCrud";

const defaultPagination = {
    page: 1,
    limit: 10,
    totalProducts: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
};

const requestProduct = async (fn, fallbackSuccess) => {
    try {
        const res = await fn();
        const ok = res?.status >= 200 && res?.status < 300;
        if (ok) {
            const msg = res?.data?.message;
            if (msg) toast.success(msg);
            else if (fallbackSuccess) toast.success(fallbackSuccess);
            return { success: true, data: res?.data };
        }
        const message = res?.data?.message || "Request failed";
        toast.error(message);
        return { success: false, message };
    } catch (err) {
        const message =
            err?.response?.data?.message ||
            err?.message ||
            "Something went wrong";
        toast.error(message);
        return { success: false, message };
    }
};

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState(defaultPagination);
    const [createLoading, setCreateLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [deleteLoadingId, setDeleteLoadingId] = useState(null);

    const { fetchAll, loading, error } = useCrud({
        fetchFn: getProductsApi,
    });

    const fetchProducts = useCallback(
        async ({ creatorId, page = 1, limit = 10 } = {}) => {
            if (!creatorId) {
                setProducts([]);
                return { success: false, message: "Creator ID is required" };
            }
            const response = await fetchAll({ creatorId, page, limit });
            if (response?.success) {
                const data = response.data ?? {};
                const list = Array.isArray(data.products)
                    ? data.products
                    : Array.isArray(data)
                      ? data
                      : [];
                setProducts(list);
                setPagination({
                    ...defaultPagination,
                    ...data.pagination,
                    totalProducts:
                        data.pagination?.totalProducts ??
                        data.totalProducts ??
                        list.length,
                });
            }
            return response;
        },
        [fetchAll],
    );

    const createProduct = useCallback(async (data) => {
        setCreateLoading(true);
        try {
            return await requestProduct(
                () => createProductApi(data),
                "Product created successfully",
            );
        } finally {
            setCreateLoading(false);
        }
    }, []);

    const updateProduct = useCallback(async (productId, data) => {
        setUpdateLoading(true);
        try {
            return await requestProduct(
                () => updateProductApi(productId, data),
                "Product updated successfully",
            );
        } finally {
            setUpdateLoading(false);
        }
    }, []);

    const deleteProduct = useCallback(async (productId) => {
        setDeleteLoadingId(productId);
        try {
            return await requestProduct(
                () => deleteProductApi(productId),
                "Product deleted successfully",
            );
        } finally {
            setDeleteLoadingId(null);
        }
    }, []);

    const updateProductStatus = useCallback(async (productId, status) => {
        try {
            return await requestProduct(
                () => updateProductStatusApi(productId, { status }),
                "Status updated successfully",
            );
        } catch {
            return { success: false };
        }
    }, []);

    return {
        products,
        pagination,
        loading,
        error,
        fetchProducts,
        createProduct,
        updateProduct,
        updateProductStatus,
        deleteProduct,
        createLoading,
        updateLoading,
        deleteLoadingId,
    };
};

export default useProducts;
