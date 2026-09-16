import { useCrud } from "../common/useCrud";
import { resetPassword } from "../../api/modules/resetPassword";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

export const useResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const crud = useCrud({
        createFn: resetPassword,
    });

    const submitResetPassword = useCallback(async (data) => {
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

    return { submitResetPassword, loading };
};

export default useResetPassword;