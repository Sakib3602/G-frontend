import { NavLink, Outlet } from "react-router";
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
} from "react-icons/hi";
import { SiCardmarket , SiMoneygram  } from "react-icons/si";

import { IoDocumentTextSharp } from "react-icons/io5";
import { Shield } from "lucide-react";

const MENU_ITEMS = [
  { name: "Home", path: "/dashboard/admin", icon: HiOutlineHome },
  {
    name: "All Employees",
    path: "/dashboard/admin/employees",
    icon: HiOutlineUsers,
  },
  {
    name: "Content Calendars",
    path: "/dashboard/admin/content-calendar",
    icon: HiOutlineCalendar,
  },

  {
    name: "Delay Works",
    path: "/dashboard/admin/delay-works",
    icon: HiOutlineClock,
  },
  {
    name: "EM Reports",
    path: "/dashboard/admin/em-reports",
    icon: IoDocumentTextSharp,
  },
  {
    name: "Campaigns Requests",
    path: "/dashboard/admin/campaigns",
    icon: HiOutlineSpeakerphone,
  },
  {
    name: "Marketing Dept.",
    path: "/dashboard/admin/marketing",
    icon: SiCardmarket,
  },
  {
    name: "Sales Dept.",
    path: "/dashboard/admin/sales",
    icon: SiMoneygram,
  },
  {
    name: "Add Task",
    path: "/dashboard/admin/add-task",
    icon: HiOutlineQuestionMarkCircle,
  },

  {
    name: "Compliance ",
    path: "/dashboard/admin/compliance",
    icon: Shield,
  },
  {
    name: "Pending Assignments",
    path: "/dashboard/admin/pending-assignments",
    icon: HiOutlineClock,
  },
  
];

const AdminHome = () => {
  // const { logOut } = useContext(AuthContext);

  const auth = useContext(AuthContext);
  const logOut = auth?.logOut;

  const person = auth?.person;
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Welcome Admin</title>
      </Helmet>
      {/* Sidebar */}
      <nav
        className={`${
          isOpen ? "w-60" : "w-20"
        } border-r border-gray-200 bg-white flex flex-col justify-between transition-all duration-300 ease-in-out relative`}
      >
        {/* Toggle button - sits on the sidebar edge */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute -right-3 top-8 z-10 w-6 h-6 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-[#F7941D] hover:border-[#F7941D] rounded-full shadow-sm transition-colors"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? (
            <HiChevronDoubleLeft size={12} />
          ) : (
            <HiChevronDoubleRight size={12} />
          )}
        </button>

        <div className="p-4">
          <div
            className={`flex items-center mb-8 ${isOpen ? "px-2" : "justify-center"}`}
          >
            {isOpen ? (
              <h2 className="text-[#F7941D] text-xl font-bold whitespace-nowrap overflow-hidden">
                Admin Dashboard
              </h2>
            ) : (
              <span className="text-[#F7941D] text-xl font-bold">A</span>
            )}
          </div>

          <ul className="space-y-2">
            {MENU_ITEMS.map(({ name, path, icon: Icon }) => (
              <li key={name}>
                <NavLink
                  to={path}
                  end={path === "/dashboard/admin"}
                  title={!isOpen ? name : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                      !isOpen ? "justify-center px-0" : ""
                    } ${
                      isActive
                        ? "text-[#F7941D] bg-orange-50 font-bold"
                        : "text-gray-600 hover:bg-gray-100"
                    }`
                  }
                >
                  <Icon size={20} className="shrink-0" />
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
        <div className="p-4 border-t border-gray-100">
          {isOpen && (
            <div className="mb-4 px-2">
              <p className="text-sm font-semibold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">
                Welcome, Admin
              </p>
              <p className="text-xs text-gray-500 truncate">
                {person?.email || "sakib@example.com"}
              </p>
            </div>
          )}
          <button
            onClick={logOut}
            title={!isOpen ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors ${
              !isOpen ? "justify-center px-0" : ""
            }`}
          >
            <HiOutlineLogout size={18} className="shrink-0" />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 shadow-sm">
          <h3 className="font-semibold text-gray-700">Overview</h3>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminHome;
