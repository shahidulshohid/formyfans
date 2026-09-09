import { useCrud } from "../common/useCrud";
import { otpVerification } from "../../api/modules/otpVerification";
import { useState, useCallback } from "react";
import { toast } from "react-toastify";



export const useOtpVerification = () => {
    const [loading, setLoading] = useState(false);
    const crud = useCrud({
        createFn: otpVerification,
    })

    const verifyOtp = useCallback(async (data) => {
        try {
            setLoading(true);
            const res = await crud.create(data);
            if(res.success) {
                return res.data;
            }
            else{
                toast.error(res.message);
            }
        }catch(err) {
            toast.error(err.message);
        }finally{
            setLoading(false);
        }
    }, [crud]);

    return { verifyOtp, loading };
}
export default useOtpVerification;