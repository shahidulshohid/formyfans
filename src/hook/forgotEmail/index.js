import { useCrud } from "../common/useCrud";
import { forgotPassword } from "../../api/modules/forgotEmail";
import { useState, useCallback } from "react";
import { toast } from "react-toastify";

export const useForgotEmail = () => {
    const [loading, setLoading] = useState(false);
    const crud = useCrud({
        createFn: forgotPassword,
    });

    const submitForgotEmail = useCallback(async (data) => {
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

    return { submitForgotEmail, loading };
};

export default useForgotEmail;
