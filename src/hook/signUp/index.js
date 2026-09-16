import { useCrud } from "../common/useCrud";
import { createAccount } from "../../api/modules/signUp";
import { useState, useCallback } from "react";
import { toast } from "react-toastify";



export const useCreateAccount = () => {
    const [loading, setLoading] = useState(false);
    const crud = useCrud({
        createFn: createAccount,
    })

    const createAcount = useCallback(async (data) => {
        try {
            setLoading(true);
            const res = await crud.create(data);
            if(res.success) {
                return res.data;
            }else{
                toast.error(res.message);
            }
        }catch(err) {
            toast.error(err.message);

        }finally{
            setLoading(false);

        }
    }, [crud]);

    return { createAcount, loading };
}
export default useCreateAccount;