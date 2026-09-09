import { fetchProductListApi as fetchProductListApiApi, fetchProductVariantsApi as fetchProductVariantsApiApi } from "../../api/modules/productsList";
import { useCrud } from "../common/useCrud";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { useState } from "react";

export const useProductList = () => {
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [productList, setProductList] = useState([]);
  const [productVariants, setProductVariants] = useState([]);
  const crud = useCrud({
    fetchFn: fetchProductListApiApi,
  });

  const fetchProductList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await crud.fetchAll();
      if (res.success) {
        setProductList(res.data);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setListLoading(false);
    }
  }, [crud]);
  const fetchProductVariants = useCallback(async (productId) => {
    setDetailLoading(true);
    try {
      const res = await fetchProductVariantsApiApi(productId);
      const isSuccess = res?.status >= 200 && res?.status < 300;

      if (!isSuccess) {
        const message = res?.data?.message || "Request failed";
        toast.error(message);
        return { success: false, message };
      }

      const responseData = res?.data?.data ?? res?.data;
      setProductVariants(responseData);
      return { success: true, data: responseData };
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      toast.error(message);
      return { success: false, message };
    } finally {
      setDetailLoading(false);
    }
  }, []);

  return {
    fetchProductList,
    fetchProductVariants,
    listLoading,
    detailLoading,
    loading: listLoading,
    productList,
    productVariants,
  };
};
