import { AuthContext } from "@/components/Authentication/AuthProvider/AuthProvider";
import axios from "axios";
import { useContext } from "react";
import { useNavigate } from "react-router";

const axiosSales = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}`,
  withCredentials: true,
});

const useAxiosSales = () => {
  const { logOut } = useContext(AuthContext)!; 

  const navigate = useNavigate();

  axiosSales.interceptors.response.use(
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

  return axiosSales;
};

export default useAxiosSales;