import axios from "axios";


 
 const axiosDesigner = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}`,  
 })

const useAxiosDesigner = () => {
    return axiosDesigner    ;
}

export default useAxiosDesigner;