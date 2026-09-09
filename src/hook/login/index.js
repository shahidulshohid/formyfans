import { useCrud } from "../common/useCrud";
import { login } from "../../api/modules/login";
import { useState, useCallback } from "react";
import { toast } from "react-toastify";



export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const crud = useCrud({
        createFn: login,
    })


    const loginUser = useCallback(async (data) => {
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

    return { loginUser, loading };
}