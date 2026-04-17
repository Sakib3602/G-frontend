import axios from "axios";


 
 const axiosSales = axios.create({
    // baseURL: "https://g-backend-g4pi.onrender.com",  
    baseURL: "http://localhost:5000",  
 })

const useAxiosSales = () => {
    return axiosSales;
}

export default useAxiosSales;