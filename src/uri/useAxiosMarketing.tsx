import axios from "axios";


 
 const axiosMarketing = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/marketing`,  
 })

const useAxiosMarketing = () => {
    return axiosMarketing;
}

export default useAxiosMarketing;