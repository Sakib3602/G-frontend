import axios from "axios";


 
 const axiosSales = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}`,  
    // baseURL: "http://localhost:5000",  
 })

const useAxiosSales = () => {
    return axiosSales;
}

export default useAxiosSales;