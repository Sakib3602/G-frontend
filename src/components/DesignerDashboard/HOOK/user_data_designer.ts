import { AuthContext } from "@/components/Authentication/AuthProvider/AuthProvider";
import useAxiosDesigner from "@/uri/useAxiosDesigner";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";




export const useUserDataDesigner = () => {

  const auth = useContext(AuthContext);
  const person = auth?.person;
  const axiosDesigner = useAxiosDesigner();

  const { data: userData, isLoading } = useQuery({

    queryKey: ["user-data-designer", person?.email],
    enabled: Boolean(person?.email),
    staleTime: Infinity, 
    queryFn: async () => {
      const res = await axiosDesigner.get(`/api/v1/user/${person?.email}`);
      return res.data.data;
    },
  });

  return {userData, isLoading};

}