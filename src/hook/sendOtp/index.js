import { useCrud } from "../common/useCrud";
import { sendOtp } from "../../api/modules/sendOtp";
import { useState, useCallback } from "react";
import { toast } from "react-toastify";

export const useSendOtp = () => {
    const [loading, setLoading] = useState(false);
    const crud = useCrud({
        createFn: sendOtp,
    });

    const requestOtp = useCallback(async (data) => {
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

    return { requestOtp, loading };
};

export default useSendOtp;
