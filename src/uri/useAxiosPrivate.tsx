import axios from "axios";


 
 const axiosPrivate = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}`,   
 })

const useAxiosPrivate = () => {
    return axiosPrivate;
}

export default useAxiosPrivate;