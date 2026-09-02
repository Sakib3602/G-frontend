import { useContext, useState } from "react";
import {
  Megaphone,
  BarChart3,
  Layers,
  LogOut,
  Menu,
  CircleCheckBig,
  CalendarDays,
  Zap,
  UserPlus,
  TimerReset,
  CheckCircle,
  ListFilter,
  Shield,
  Loader,
  Bell,
} from "lucide-react";
import { Helmet } from "react-helmet";
import { Link, Outlet, useLocation } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AuthContext } from "../Authentication/AuthProvider/AuthProvider";
import { useUserDataMarketing } from "./HOOK/User_Data_Marketer";
import EditProfileButton from "../Common/Editprofilebutton";
import useAxiosMarketing from "@/uri/useAxiosMarketing";

const NOTIFICATION_SCOPE = "marketing-tasks";

const MarketingHome = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const { userData } = useUserDataMarketing();
  const auth = useContext(AuthContext);
  const axiosMarketing = useAxiosMarketing();
  const queryClient = useQueryClient();

  if (!auth) throw new Error("AuthContext is not available");

  const { logOut } = auth;

   const { data: notifCount = 0 } = useQuery<number>({
    queryKey: ["notification-count", NOTIFICATION_SCOPE],
    queryFn: async () => {
      const res = await axiosMarketing.get(`/notifications/count?scope=${NOTIFICATION_SCOPE}`);
      return res.data?.count ?? 0;
    },
    refetchInterval: 20000,
  });

  const mutationMarkSeen = useMutation({
    mutationFn: async (scope: string) => {
      const res = await axiosMarketing.post(`/notifications/mark-seen`, { scope });
      return res.data;
    },
  });

  const handleBellClick = () => {
    if (notifCount > 0) {
      queryClient.setQueryData(["notification-count", NOTIFICATION_SCOPE], 0);
      mutationMarkSeen.mutate(NOTIFICATION_SCOPE);
    }
  };

  const userName = userData?.name || "Unknown User";

  const user = {
    name: userName,
    role: userData?.role ? `${userData.role} Manager` : "Marketing Manager",
    avatar:
      userData?.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=C9A646&color=fff`,
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard/marketing", icon: BarChart3 },
    {
      name: "Works",
      path: "/dashboard/marketing/pending-signatures",
      icon: Megaphone,
    },
    {
      name: "My Assigned Leads",
      path: "/dashboard/marketing/my-assigned-leads",
      icon: Megaphone,
    },
    {
      name: "Create Campaign",
      path: "/dashboard/marketing/create-campaign",
      icon: Zap,
    },
    {
      name: "All Campaigns",
      path: "/dashboard/marketing/all-campaigns",
      icon: Layers,
    },
    {
      name: "End Campaigns",
      path: "/dashboard/marketing/end-campaigns",
      icon: CircleCheckBig,
    },
    { name: "Add Task", path: "/dashboard/marketing/add-task", icon: UserPlus },
    {
      name: "Assigned Tasks",
      path: "/dashboard/marketing/assigned-tasks",
      icon: TimerReset,
    },
    {
      name: "Complete Tasks",
      path: "/dashboard/marketing/complete-tasks",
      icon: CheckCircle,
    },
    {
      name: "Content Calendar",
      path: "/dashboard/marketing/content-calendar",
      icon: CalendarDays,
    },
    {
      name: "Tasks",
      path: "/dashboard/marketing/tasks",
      icon: ListFilter,
    },
    {
      name: "In Progress",
      path: "/dashboard/marketing/in-progress",
      icon: Loader,
    },
    {
      name: "Complaints",
      path: "/dashboard/marketing/compliance",
      icon: Shield,
    },
  ];

  return (
    <div className="poppins-regular flex h-screen bg-[#F8FAFC] text-slate-800">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Genesys - Marketing Dashboard</title>
      </Helmet>
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-20"}
        bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-20`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <span
            className={`font-semibold text-lg flex items-center gap-2 ${!isSidebarOpen && "hidden"}`}
          >
            <Zap className="w-5 h-5 text-[#C9A646]" />
            G.<span className="text-[#C9A646]">Marketing</span>
          </span>
          {!isSidebarOpen && (
            <div className="w-10 h-10 rounded-xl bg-[#C9A646]/10 flex items-center justify-center">
              <Zap className="w-7 h-7 text-[#C9A646]" />
            </div>
          )}
        </div>

        <div className="flex-1 py-6 overflow-y-auto">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center py-2.5 rounded-lg transition-all ${
                    isSidebarOpen ? "px-4 mx-3" : "px-0 mx-3 justify-center"
                  } ${
                    isActive
                      ? "bg-[#F7F3E8] text-[#C9A646] shadow-sm"
                      : "hover:bg-gray-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`shrink-0 ${isSidebarOpen ? "w-5 h-5 mr-3" : "w-6 h-6"} ${
                      isActive ? "text-[#C9A646]" : "text-slate-400"
                    }`}
                  />
                  {isSidebarOpen && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={async () => await logOut()}
            className={`flex items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-500 transition w-full ${
              isSidebarOpen ? "gap-2 px-3 py-2" : "justify-center px-0 py-2.5"
            }`}
          >
            <LogOut className={isSidebarOpen ? "w-5 h-5" : "w-6 h-6"} />
            {isSidebarOpen && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md text-slate-500 hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-slate-700 hidden sm:block">
              Marketing Workspace
            </h2>
          </div>

          <div className="flex items-center gap-5">
            {/* Notification bell */}
            <button
              onClick={handleBellClick}
              className="relative p-2 rounded-md text-slate-500 hover:bg-gray-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-gray-200"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-700">
                  {user.name}
                </p>
                <p className="text-xs text-slate-400">{user.role}</p>
              </div>
              <img
                src={user.avatar}
                alt="profile"
                className="w-8 h-8 rounded-full border ring-2 ring-gray-50 shadow-sm"
              />

              <EditProfileButton
                axiosInstance={axiosMarketing}
                profileEndpoint="/api/v1/profile/me"
                buttonLabel=""
                buttonClassName="flex items-center justify-center h-8 w-8 rounded-full border border-gray-200 text-gray-500 hover:border-[#C9A646] hover:text-[#C9A646] transition-colors"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="min-h-full w-full bg-white relative">
            <div
              className="absolute inset-0 z-0"
              style={{
                background: "#ffffff",
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.35) 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="relative z-10 p-6 lg:p-4">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MarketingHome;