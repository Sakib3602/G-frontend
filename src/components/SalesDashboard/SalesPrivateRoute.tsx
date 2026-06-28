import { useContext, useEffect } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../Authentication/AuthProvider/AuthProvider";

const SalesPrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("AuthContext is not available");
  }

  const location = useLocation();
  const { person, loading, logOut, role } = auth;

  useEffect(() => {
    if (!loading && person && role && role !== "sales") {
      logOut();
    }
  }, [loading, person, role, logOut]);

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute h-full w-full animate-spin rounded-full border-4 border-slate-200 border-t-[#7D9F3A]"></div>
          <div className="h-10 w-10 animate-pulse rounded-full bg-[#7D9F3A]/20 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-[#7D9F3A]"></div>
          </div>
        </div>
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

  // ✅ Shudhu redirect, logOut ALREADY useEffect e handled
  if (role !== "sales") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default SalesPrivateRoute;