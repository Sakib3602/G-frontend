import axios from "axios";


 
 const axiosAdmin = axios.create({
    baseURL: "http://localhost:5000/api/v1/admin/dashboard",  
 })

const useAxiosAdmin = () => {
    return axiosAdmin    ;
}

export default useAxiosAdmin;