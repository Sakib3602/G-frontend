import { AuthContext } from "@/components/Authentication/AuthProvider/AuthProvider";
import useAxiosMarketing from "@/uri/useAxiosMarketing";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";




export const useUserDataMarketing = () => {
  const auth = useContext(AuthContext);
  const person = auth?.person;
  const axiosSales = useAxiosMarketing();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user-data", person?.email],
    enabled: Boolean(person?.email),
    staleTime: Infinity, 
    queryFn: async () => {
      const res = await axiosSales.get(`/api/v1/user/${person?.email}`);
      return res.data.data;
    },
  });

  return {userData, isLoading};

}