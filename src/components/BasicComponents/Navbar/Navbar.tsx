import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Helmet } from "react-helmet";
import { AuthContext } from "../../Authentication/AuthProvider/AuthProvider";
import Notification from "@/components/ui/toast";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "@/uri/useAxiosPublic";
import { FaChartLine, FaBullhorn, FaPalette, FaCode, FaUserShield } from "react-icons/fa";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";

interface NavbarProps {
  companyName?: string;
}

const BRAND = "#80A33C";
const BRAND_DARK = "#547221";

const Navbar: React.FC<NavbarProps> = ({ companyName = "Genesys" }) => {
  const { person, logOut } = useContext(AuthContext)!;
  const [showNotification, setShowNotification] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const axiosPub = useAxiosPublic();

  const { data: userData } = useQuery({
    queryKey: ["user-data", person?.email],
    queryFn: async () => {
      const res = await axiosPub.get(`/api/v1/user/${person?.email}`);
      return res.data.data;
    },
    enabled: !!person?.email,
  });

  const dashboardLinks = [
    { role: "sales", name: "Sales Dashboard", href: "/dashboard/sales", icon: <FaChartLine /> },
    { role: "marketing", name: "Marketing Dashboard", href: "/dashboard/marketing", icon: <FaBullhorn /> },
    { role: "designer", name: "Design Dashboard", href: "/dashboard/designer", icon: <FaPalette /> },
    { role: "web", name: "Web Dashboard", href: "/dashboard/designer", icon: <FaCode /> },
    { role: "admin", name: "Admin Dashboard", href: "/dashboard/admin", icon: <FaUserShield /> },
  ];

  const userDashboard = dashboardLinks.find((item) => item.role === userData?.role);

  const displayName: string = userData?.name || person?.displayName || person?.email?.split("@")[0] || "Account";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogOut = () => {
    logOut().then(() => {
      setMenuOpen(false);
      setMobileOpen(false);
      setShowNotification(true);
    });
  };

  // Close the account dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <style>{`.font-display { font-family: 'Space Grotesk', sans-serif; }`}</style>

      <div className="fixed top-4 right-4 z-60">
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

      <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 font-display transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/">
              <div className="shrink-0 flex items-center cursor-pointer">
                <span className="text-2xl font-bold text-gray-950 tracking-tight">
                  {companyName} 
                  <span className="font-bold" style={{ color: BRAND }}> CRM.</span>
                </span>
              </div>
            </Link>

            <div className="hidden lg:block flex-1" />

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-3">
              {person ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-3 rounded-full border border-gray-200 pl-2 pr-3 py-1.5 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    <span
                      className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                      style={{ backgroundColor: BRAND }}
                    >
                      {initial}
                    </span>
                    <span className="text-sm font-semibold text-gray-800 max-w-30 truncate">
                      {displayName}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-900/10 overflow-hidden">
                      {userDashboard && (
                        <Link
                          to={userDashboard.href}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span
                            className="h-8 w-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${BRAND}1A`, color: BRAND_DARK }}
                          >
                            {userDashboard.icon}
                          </span>
                          {userDashboard.name}
                        </Link>
                      )}
                      <div className="h-px bg-gray-100" />
                      <button
                        onClick={handleLogOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <LogOut className="h-4 w-4" />
                        </span>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login">
                    <button
                      className="cursor-pointer px-5 py-2.5 text-sm font-semibold rounded-full transition-all border"
                      style={{ color: BRAND_DARK, borderColor: BRAND }}
                    >
                      Sign in
                    </button>
                  </Link>
                  <Link to="/registration">
                    <button
                      className="cursor-pointer px-5 py-2.5 text-sm font-semibold rounded-full text-white shadow-md transition-all hover:-translate-y-0.5"
                      style={{ backgroundColor: BRAND, boxShadow: `0 10px 20px -8px ${BRAND}66` }}
                    >
                      Sign up
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 text-gray-700"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-6 py-5">
            {person ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 pb-4 mb-2 border-b border-gray-100">
                  <span
                    className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                    style={{ backgroundColor: BRAND }}
                  >
                    {initial}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 truncate">{displayName}</span>
                </div>
                {userDashboard && (
                  <Link
                    to={userDashboard.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 py-3 text-sm font-medium text-gray-700"
                  >
                    <LayoutDashboard className="h-4 w-4" style={{ color: BRAND_DARK }} />
                    {userDashboard.name}
                  </Link>
                )}
                <button
                  onClick={handleLogOut}
                  className="w-full flex items-center gap-3 py-3 text-sm font-medium text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <button
                    className="w-full px-5 py-3 text-sm font-semibold rounded-full border"
                    style={{ color: BRAND_DARK, borderColor: BRAND }}
                  >
                    Sign in
                  </button>
                </Link>
                <Link to="/registration" onClick={() => setMobileOpen(false)}>
                  <button
                    className="w-full px-5 py-3 text-sm font-semibold rounded-full text-white"
                    style={{ backgroundColor: BRAND }}
                  >
                    Sign up
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;