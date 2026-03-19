import { AuthContext } from "@/components/Authentication/AuthProvider/AuthProvider";
import useAxiosSales from "@/uri/useAxiosSales";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";




export const useUserData = () => {
  const auth = useContext(AuthContext);
  const person = auth?.person;
  const axiosSales = useAxiosSales();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user-data", person?.email],
    enabled: Boolean(person?.email),
    queryFn: async () => {
      const res = await axiosSales.get(`/api/v1/user/${person?.email}`);
      return res.data.data;
    },
  });

  return {userData, isLoading};

}