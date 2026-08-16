import { NavLink, Outlet } from "react-router"; // Updated to react-router-dom
import { AuthContext } from "../Authentication/AuthProvider/AuthProvider";
import { useContext, useState } from "react";
import { Helmet } from "react-helmet";
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlineSpeakerphone,
  HiOutlineClock,
  HiOutlineQuestionMarkCircle,
  HiOutlineLogout,
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
  HiOutlineSwitchHorizontal,
} from "react-icons/hi";
import { SiCardmarket, SiMoneygram } from "react-icons/si";
import { IoDocumentTextSharp } from "react-icons/io5";
import { Shield } from "lucide-react";

const MENU_ITEMS = [
  { name: "Home", path: "/dashboard/admin", icon: HiOutlineHome },
  { name: "All Employees", path: "/dashboard/admin/employees", icon: HiOutlineUsers },
  { name: "Content Calendars", path: "/dashboard/admin/content-calendar", icon: HiOutlineCalendar },
  { name: "Delay Works", path: "/dashboard/admin/delay-works", icon: HiOutlineClock },
  { name: "EM Reports", path: "/dashboard/admin/em-reports", icon: IoDocumentTextSharp },
  { name: "Campaigns Requests", path: "/dashboard/admin/campaigns", icon: HiOutlineSpeakerphone },
  { name: "Marketing Dept.", path: "/dashboard/admin/marketing", icon: SiCardmarket },
  { name: "Sales Dept.", path: "/dashboard/admin/sales", icon: SiMoneygram },
  { name: "Add Task", path: "/dashboard/admin/add-task", icon: HiOutlineQuestionMarkCircle },
  { name: "Lead Transfers", path: "/dashboard/admin/lead-transfers", icon: HiOutlineSwitchHorizontal },
  { name: "Complaints", path: "/dashboard/admin/compliance", icon: Shield },
  { name: "Pending Assignments", path: "/dashboard/admin/pending-assignments", icon: HiOutlineClock },
];

const AdminHome = () => {
  const auth = useContext(AuthContext);
  const logOut = auth?.logOut;
  const person = auth?.person;

  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="poppins-regular flex h-screen bg-gray-50 font-sans">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Genesys Admin Panel</title>
      </Helmet>

      {/* Sidebar - Updated to White & Gold theme */}
      <nav
        className={`${
          isOpen ? "w-[280px]" : "w-20"
        } bg-white border-r border-gray-200 flex flex-col justify-between transition-all duration-300 ease-in-out relative z-20 shadow-lg`}
      >
        {/* Toggle button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute -right-4 top-8 z-30 w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-200 text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37] rounded-full transition-all shadow-md cursor-pointer"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? (
            <HiChevronDoubleLeft size={16} />
          ) : (
            <HiChevronDoubleRight size={16} />
          )}
        </button>

        {/* Sidebar Header / Logo */}
        <div className="h-20 flex items-center border-b border-gray-100">
          <div className={`w-full flex items-center ${isOpen ? "px-6" : "justify-center"}`}>
            {isOpen ? (
              <div className="flex flex-col">
                <h2 className="text-gray-800 text-2xl font-black tracking-tight whitespace-nowrap overflow-hidden">
                  Genesys
                </h2>
                <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold mt-0.5">
                  Admin Panel
                </span>
              </div>
            ) : (
              <span className="text-white text-xl font-black bg-[#D4AF37] w-10 h-10 flex items-center justify-center rounded-xl shadow-md">
                G
              </span>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <ul className="space-y-2 px-3">
            {MENU_ITEMS.map(({ name, path, icon: Icon }) => (
              <li key={name}>
                <NavLink
                  to={path}
                  end={path === "/dashboard/admin"}
                  title={!isOpen ? name : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 text-base font-medium ${
                      !isOpen ? "justify-center px-0 py-3" : ""
                    } ${
                      isActive
                        ? "text-[#D4AF37] bg-amber-50 shadow-sm border-l-4 border-[#D4AF37]" 
                        : "text-gray-600 hover:text-[#D4AF37] hover:bg-amber-50/50"
                    }`
                  }
                >
                  <Icon size={22} className="shrink-0" />
                  {isOpen && (
                    <span className="whitespace-nowrap overflow-hidden">
                      {name}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* User Profile & Logout Section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/80">
          {isOpen && (
            <div className="mb-4 px-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37] border-2 border-white flex items-center justify-center text-white font-bold shrink-0 text-lg shadow-sm">
                A
              </div>
              <div className="overflow-hidden">
                <p className="text-base font-bold text-gray-800 truncate">
                  Admin User
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {person?.email || "admin@genesys.com"}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={logOut}
            title={!isOpen ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 text-base font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 px-4 py-3 rounded-lg transition-colors ${
              !isOpen ? "justify-center px-0" : ""
            }`}
          >
            <HiOutlineLogout size={22} className="shrink-0" />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-gray-800">Dashboard Overview</h3>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminHome;