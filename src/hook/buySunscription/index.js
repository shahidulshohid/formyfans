import { useCrud } from "../common/useCrud";
import { buySubscription } from "../../api/modules/buySubscription";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

export const useBuySubscription = () => {
    const [loading, setLoading] = useState(false);
    const crud = useCrud({
        createFn: buySubscription,
    });

    const submitBuySubscription = useCallback(async (data) => {
        try {
            setLoading(true);
            const res = await crud.create(data);
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

    return { submitBuySubscription, loading };
};

export default useBuySubscription;