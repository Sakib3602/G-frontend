import { useContext, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  CircleX,
  LogOut,
  Menu,
  LayersPlus,
  WorkflowIcon,
  Timer,
  Pin,
  MessageCircle,
  ClipboardList,
  Mail,
  Shield,
  Bell,
} from "lucide-react";
import { Link, Outlet, useLocation } from "react-router";
import { AuthContext } from "../Authentication/AuthProvider/AuthProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSales from "@/uri/useAxiosSales";
import { Helmet } from "react-helmet";
import EditProfileButton from "../Common/Editprofilebutton";

const NOTIFICATION_SCOPE = "sales-tasks";

const Sales_Home = () => {
  const axiosSales = useAxiosSales();
  const auth = useContext(AuthContext);
  const person = auth?.person;
  const queryClient = useQueryClient();

  if (!auth) {
    throw new Error("AuthContext is not available");
  }

  const { logOut } = auth;
  const { data: userData } = useQuery({
    queryKey: ["user-data", person?.email],
    enabled: Boolean(person?.email),
    queryFn: async () => {
      const res = await axiosSales.get(`/api/v1/user/${person?.email}`);
      return res.data.data;
    },
  });

  // ---------- Notification bell ----------
  const { data: notifCount = 0 } = useQuery<number>({
    queryKey: ["notification-count", NOTIFICATION_SCOPE],
    queryFn: async () => {
      const res = await axiosSales.get(`/api/v1/notifications/count?scope=${NOTIFICATION_SCOPE}`);
      return res.data?.count ?? 0;
    },
    refetchInterval: 20000,
  });

  const mutationMarkSeen = useMutation({
    mutationFn: async (scope: string) => {
      const res = await axiosSales.post(`/api/v1/notifications/mark-seen`, { scope });
      return res.data;
    },
  });

  const handleBellClick = () => {
    if (notifCount > 0) {
      queryClient.setQueryData(["notification-count", NOTIFICATION_SCOPE], 0);
      mutationMarkSeen.mutate(NOTIFICATION_SCOPE);
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const userName = userData?.name || "Unknown User";

  const user = {
    name: userName,
    email: userData?.email || "",
    avatar:
      userData?.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=7FA23B&color=fff`,
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard/sales", icon: LayoutDashboard },
    {
      name: "Create Leads",
      path: "/dashboard/sales/create-leads",
      icon: LayersPlus,
    },
    { name: "My Leads", path: "/dashboard/sales/all-leads", icon: Users },
    { name: "My Meetings", path: "/dashboard/sales/meetings", icon: Calendar },
    {
      name: "In Progress",
      path: "/dashboard/sales/in-progress",
      icon: Briefcase,
    },
    { name: "Reminders", path: "/dashboard/sales/remainder", icon: Timer },
    {
      name: "Qualified Deals",
      path: "/dashboard/sales/qualified",
      icon: WorkflowIcon,
    },
    {
      name: "Unqualified Deals",
      path: "/dashboard/sales/unqualified",
      icon: CircleX,
    },
    { name: "Assigned Leads", path: "/dashboard/sales/assigned", icon: Pin },
    {
      name: "WhatsApp",
      path: "/dashboard/sales/whatsapp",
      icon: MessageCircle,
    },
    { name: "Emails", path: "/dashboard/sales/emails", icon: Mail },
    { name: "Tasks", path: "/dashboard/sales/tasks", icon: ClipboardList },
    { name: "Complaints", path: "/dashboard/sales/complaints", icon: Shield },
  ];

  return (
    <div className="poppins-regular flex h-screen bg-[#F8FAFC] font-sans text-gray-900">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Genesys - Sales Dashboard</title>
      </Helmet>

      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col z-20`}
      >
        <Link to={"/"}>
          <div className="h-16 flex items-center justify-center border-b border-gray-100">
            <span
              className={`font-bold text-gray-900 text-xl tracking-wide ${!isSidebarOpen && "hidden"}`}
            >
              Gene<span className="text-[#7FA23B]">sys</span> CRM
            </span>
            {!isSidebarOpen && (
              <div className="w-10 h-10 bg-[#7FA23B]/10 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-[#7FA23B]" />
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 py-6 flex flex-col overflow-y-auto px-3">
          {isSidebarOpen && (
            <div className="px-3 mb-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Main Menu
              </p>
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center px-3 py-2.5 rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-[#7FA23B]/10 text-[#7FA23B]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive
                        ? "text-[#7FA23B]"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  <span
                    className={`ml-3 text-sm transition-opacity ${
                      isActive ? "font-bold" : "font-medium"
                    } ${!isSidebarOpen && "hidden"}`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={async () => {
              await logOut();
            }}
            className="group flex items-center px-3 py-2.5 rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
            title={!isSidebarOpen ? "Sign Out" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0 text-gray-400 group-hover:text-red-500 transition-colors" />
            <span
              className={`ml-3 text-sm font-medium ${!isSidebarOpen && "hidden"}`}
            >
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-6">
            {/* Notification bell */}
            <button
              onClick={handleBellClick}
              className="relative p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </button>

            <div className="flex items-center space-x-3 border-l pl-6 border-gray-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {user.name}
                </p>
                <div className="flex items-center justify-end space-x-2 mt-0.5">
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
              </div>
              <img
                src={user.avatar}
                alt="Profile"
                className="w-9 h-9 rounded-full ring-2 ring-gray-100 shadow-sm"
              />
              <EditProfileButton
                axiosInstance={axiosSales}
                profileEndpoint="/api/v1/profile/me"
                buttonLabel=""
                buttonClassName="flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 text-gray-500 hover:border-[#7FA23B] hover:text-[#7FA23B] transition-colors"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6 lg:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Sales_Home;