import axios from "axios";


 
 const axiosMarketing = axios.create({
    baseURL: "http://localhost:5000/api/v1/marketing",  
 })

const useAxiosMarketing = () => {
    return axiosMarketing;
}

export default useAxiosMarketing;