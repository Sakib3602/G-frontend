import { AuthContext } from "@/components/Authentication/AuthProvider/AuthProvider";
import axios from "axios";
import { useContext } from "react";
import { useNavigate } from "react-router";


 
 const axiosDesigner = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}`,  
    withCredentials: true,
 })

const useAxiosDesigner = () => {
    const { logOut } = useContext(AuthContext)!; 

  const navigate = useNavigate();

  axiosDesigner.interceptors.response.use(
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
    return axiosDesigner    ;
}

export default useAxiosDesigner;