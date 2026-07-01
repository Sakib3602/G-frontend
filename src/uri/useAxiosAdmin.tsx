import { AuthContext } from "@/components/Authentication/AuthProvider/AuthProvider";
import axios from "axios";
import { useContext } from "react";
import { useNavigate } from "react-router";


 
 const axiosAdmin = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin`,  
    withCredentials: true,
 })

const useAxiosAdmin = () => {
    const { logOut } = useContext(AuthContext)!; 

  const navigate = useNavigate();

  axiosAdmin.interceptors.response.use(
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
    return axiosAdmin;
}

export default useAxiosAdmin;