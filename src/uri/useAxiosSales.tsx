import axios from "axios";


 
 const axiosSales = axios.create({
    baseURL: "http://localhost:5000",  
 })

const useAxiosSales = () => {
    return axiosSales;
}

export default useAxiosSales;