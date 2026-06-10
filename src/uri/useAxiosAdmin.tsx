import axios from "axios";


 
 const axiosAdmin = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/dashboard`
    ,  
 })

const useAxiosAdmin = () => {
    return axiosAdmin    ;
}

export default useAxiosAdmin;