
import { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../Authentication/AuthProvider/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "@/uri/useAxiosPublic";

const PrivateInstractorRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("AuthContext is not available");
  }
  //   const Navigate = useNavigate();
  const location = useLocation();
  const { person, loading , logOut} = auth;

  const axiosPub = useAxiosPublic();

  const { data: userData , isLoading } = useQuery({
          queryKey: ["user-data", person?.email],
          enabled: Boolean(person?.email),
          queryFn: async () => {
            const res = await axiosPub.get(`/api/v1/user/${person?.email}`);
            return res.data.data;
        },
    });

    if (loading || isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50">
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* বাইরের স্পিনিং রিং */}
        <div className="absolute h-full w-full animate-spin rounded-full border-4 border-slate-200 border-t-[#7D9F3A]"></div>
        
        {/* ভেতরের পালসিং লোগো বা ডট */}
        <div className="h-10 w-10 animate-pulse rounded-full bg-[#7D9F3A]/20 flex items-center justify-center">
          <div className="h-4 w-4 rounded-full bg-[#7D9F3A]"></div>
        </div>
      </div>
      
      {/* লোডিং টেক্সট */}
      <h2 className="mt-6 text-lg font-semibold text-slate-700 animate-pulse">
        Preparing your dashboard...
      </h2>
      <p className="text-sm text-slate-500">Please wait a moment</p>
    </div>
    );
  }

  if (!person) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

    const X = async()=>{
        await logOut();
    }

    if(userData?.role !== "sales")
    {
        X();
        return <Navigate to="/login" state={{ from: location }} replace />;
    }



  
  
  return children;
};

export default PrivateInstractorRoute;