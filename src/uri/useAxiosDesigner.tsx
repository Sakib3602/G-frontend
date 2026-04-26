import axios from "axios";


 
 const axiosDesigner = axios.create({
    baseURL: "http://localhost:5000",  
 })

const useAxiosDesigner = () => {
    return axiosDesigner    ;
}

export default useAxiosDesigner;