import React, { useContext, useState } from "react";
import { Link } from "react-router";
import { AuthContext } from "../../Authentication/AuthProvider/AuthProvider";
import Notification from "@/components/ui/toast";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "@/uri/useAxiosPublic";
import { FaChartLine, FaBullhorn, FaPalette, FaCode, FaUserShield } from "react-icons/fa";

interface NavbarProps {
  companyName?: string;
}

const Navbar: React.FC<NavbarProps> = ({ companyName = "Genesys" }) => {
  const { person, logOut } = useContext(AuthContext)!;
  const [showNotification, setShowNotification] = useState(false);

  const handleLogOut = () => {
    logOut().then(() => {
      setShowNotification(true);
    });
  };

  const axiosPub = useAxiosPublic();

  const { data: userData } = useQuery({
    queryKey: ["user-data", person?.email],
    queryFn: async () => {
      const res = await axiosPub.get(`/api/v1/user/${person?.email}`);
      return res.data.data;
    },
    enabled: !!person?.email,
  });

  // ড্যাশবোর্ড আইকন লজিক
  const dashboardLinks = [
    { role: "sales", name: "Sales Dashboard", href: "/dashboard/sales", icon: <FaChartLine /> },
    { role: "marketing", name: "Marketing Dashboard", href: "/dashboard/marketing", icon: <FaBullhorn /> },
    { role: "designer", name: "Design Dashboard", href: "/dashboard/designer", icon: <FaPalette /> },
    { role: "web", name: "Web Dashboard", href: "/dashboard/designer", icon: <FaCode /> },
    { role: "admin", name: "Admin Dashboard", href: "/dashboard/admin", icon: <FaUserShield /> },
  ];

  const userDashboard = dashboardLinks.find((item) => item.role === userData?.role);

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        {showNotification && (
          <Notification
            type="warning"
            title="Logged Out Successfully!"
            message="You have been logged out."
            showIcon={true}
            duration={3000}
            onClose={() => setShowNotification(false)}
          />
        )}
      </div>

      <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 font-sans transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to={"/"}>
              <div className="shrink-0 flex items-center cursor-pointer">
                <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {companyName}
                  <span className="text-[#80A33C]">.</span>
                </span>
              </div>
            </Link>

            {/* Empty space in middle */}
            <div className="hidden lg:block flex-1"></div>

            {/* Desktop Action Area */}
            <div className="hidden lg:flex items-center gap-4">
              {person ? (
                <>
                  {userDashboard && (
                    <Link
                      to={userDashboard.href}
                      title={userDashboard.name}
                      className="inline-flex items-center gap-2 rounded-full border border-[#80A33C]/20 bg-[#80A33C]/10 px-4 py-2 text-sm font-semibold text-[#547221] transition-all hover:border-[#80A33C]/30 hover:bg-[#80A33C]/15"
                    >
                      <span className="text-base leading-none">{userDashboard.icon}</span>
                      <span>{userDashboard.name}</span>
                    </Link>
                  )}

                  


                  <button
                    onClick={handleLogOut}
                    className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-red-500 to-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5 hover:from-red-600 hover:to-rose-700"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to={"/login"}>
                    <button className="cursor-pointer px-6 py-2.5 text-sm font-bold rounded-lg text-[#80A33C] border-2 border-[#80A33C] hover:bg-[#80A33C] hover:text-white transition-all">Sign In</button>
                  </Link>
                  <Link to={"/registration"}>
                    <button className="cursor-pointer px-6 py-2.5 text-sm font-bold rounded-lg text-white bg-linear-to-r from-[#80A33C] to-[#5a7a28] shadow-lg">Sign Up</button>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;