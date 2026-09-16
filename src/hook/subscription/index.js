import { useCrud } from "../common/useCrud";
import { fetchSubscriptionPlans } from "../../api/modules/subscription";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

export const useSubscriptionPlans = () => {
    const [loading, setLoading] = useState(false);
    const crud = useCrud({
        fetchFn: fetchSubscriptionPlans,
    });

    const getSubscriptionPlans = useCallback(async () => {
        try {
            setLoading(true);
            const res = await crud.fetchAll();
            if (res.success) {
                return res.data;
            }
            toast.error(res.message);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [crud]);

    return { getSubscriptionPlans, loading };
};

export default useSubscriptionPlans;
