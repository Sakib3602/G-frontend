import { AuthContext } from "@/components/Authentication/AuthProvider/AuthProvider";
import axios from "axios";
import { useContext } from "react";
import { useNavigate } from "react-router";


 
 const axiosMarketing = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/marketing`,  
     withCredentials: true,
 })

const useAxiosMarketing = () => {
    const { logOut } = useContext(AuthContext)!; 

  const navigate = useNavigate();

  axiosMarketing.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        try {
          await logOut();
          navigate("/login");
        } catch (e) {
          console.error("Auto logout failed:", e);
        }
      }
      return Promise.reject(error);
    }
  );

    return axiosMarketing;
}

export default useAxiosMarketing;