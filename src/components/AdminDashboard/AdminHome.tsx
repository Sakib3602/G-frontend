import { NavLink, Outlet } from "react-router";
import { AuthContext } from "../Authentication/AuthProvider/AuthProvider";
import { useContext, useState } from "react";
import { Helmet } from "react-helmet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAdmin from "@/uri/useAxiosAdmin";
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

const NOTIFICATION_SCOPE = "admin-tasks";

const MENU_ITEMS = [
  { name: "Home", path: "/dashboard/admin", icon: HiOutlineHome },
  { name: "All Employees", path: "/dashboard/admin/employees", icon: HiOutlineUsers },
  { name: "Content Calendars", path: "/dashboard/admin/content-calendar", icon: HiOutlineCalendar },
  { name: "Delay Works", path: "/dashboard/admin/delay-works", icon: HiOutlineClock },
  { name: "EM Reports", path: "/dashboard/admin/em-reports", icon: IoDocumentTextSharp },
  { name: "Campaigns Requests", path: "/dashboard/admin/campaigns", icon: HiOutlineSpeakerphone },
  { name: "Marketing Dept.", path: "/dashboard/admin/marketing", icon: SiCardmarket },
  { name: "Sales Dept.", path: "/dashboard/admin/sales", icon: SiMoneygram },
  { name: "Add Task", path: "/dashboard/admin/add-task", icon: HiOutlineQuestionMarkCircle, notificationScope: NOTIFICATION_SCOPE },
  { name: "Lead Transfers", path: "/dashboard/admin/lead-transfers", icon: HiOutlineSwitchHorizontal },
  { name: "Complaints", path: "/dashboard/admin/compliance", icon: Shield },
  { name: "Pending Assignments", path: "/dashboard/admin/pending-assignments", icon: HiOutlineClock },
];

const AdminHome = () => {
  const auth = useContext(AuthContext);
  const logOut = auth?.logOut;
  const person = auth?.person;
  const axiosAdmin = useAxiosAdmin();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(true);

  const { data: notifCount = 0 } = useQuery<number>({
    queryKey: ["notification-count", NOTIFICATION_SCOPE],
    queryFn: async () => {
      const res = await axiosAdmin.get(`/notifications/count?scope=${NOTIFICATION_SCOPE}`);
      return res.data?.count ?? 0;
    },
    refetchInterval: 20000,
  });

  const mutationMarkSeen = useMutation({
    mutationFn: async (scope: string) => {
      const res = await axiosAdmin.post(`/notifications/mark-seen`, { scope });
      return res.data;
    },
  });

  const handleNavClick = (scope?: string) => {
    if (!scope) return;
    queryClient.setQueryData(["notification-count", scope], 0);
    mutationMarkSeen.mutate(scope);
  };

  // Format today's date for the header
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Genesys | Admin Portal</title>
      </Helmet>

      {/* Sidebar */}
      <nav
        className={`${
          isOpen ? "w-[280px]" : "w-[84px]"
        } flex flex-col justify-between bg-white border-r border-slate-200 transition-all duration-300 ease-in-out relative z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute -right-3.5 top-8 z-40 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 shadow-sm transition-all hover:border-[#D4AF37] hover:text-[#D4AF37] focus:outline-none"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <HiChevronDoubleLeft size={14} /> : <HiChevronDoubleRight size={14} />}
        </button>

        {/* Brand Header */}
        <div className="flex h-20 shrink-0 items-center border-b border-slate-100 px-6">
          <div className={`flex w-full items-center ${isOpen ? "justify-start" : "justify-center"}`}>
            {isOpen ? (
              <div className="flex flex-col">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Genesys
                </h2>
                <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                  Admin Panel
                </span>
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8972E] text-lg font-black text-white shadow-md">
                G
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-5 px-3 custom-scrollbar">
          <ul className="space-y-1.5">
            {MENU_ITEMS.map(({ name, path, icon: Icon, notificationScope }) => {
              const badgeCount = notificationScope === NOTIFICATION_SCOPE ? notifCount : 0;

              return (
                <li key={name}>
                  <NavLink
                    to={path}
                    end={path === "/dashboard/admin"}
                    title={!isOpen ? name : undefined}
                    onClick={() => handleNavClick(notificationScope)}
                    className={({ isActive }) =>
                      `group relative flex items-center rounded-xl px-3 py-2.5 transition-all duration-200 ${
                        !isOpen ? "justify-center" : "justify-start gap-3"
                      } ${
                        isActive
                          ? "bg-[#D4AF37]/10 text-[#B8972E] font-semibold"
                          : "text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active Indicator Line */}
                        {isActive && isOpen && (
                          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#D4AF37]" />
                        )}

                        <div className="relative flex shrink-0 items-center justify-center">
                          <Icon size={20} className={isActive ? "text-[#B8972E]" : "text-slate-400 group-hover:text-slate-600"} />
                          
                          {/* Notification Badge on Icon (Collapsed state) */}
                          {!isOpen && badgeCount > 0 && (
                            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                              {badgeCount > 99 ? "99+" : badgeCount}
                            </span>
                          )}
                        </div>

                        {isOpen && (
                          <>
                            <span className="flex-1 truncate text-sm">{name}</span>
                            {/* Notification Badge Inline (Expanded state) */}
                            {badgeCount > 0 && (
                              <span className="ml-2 inline-flex h-5 items-center justify-center rounded-full bg-rose-100 px-2 text-[10px] font-bold text-rose-600">
                                {badgeCount > 99 ? "99+" : badgeCount}
                              </span>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* User Profile & Logout */}
        <div className="shrink-0 border-t border-slate-100 p-4">
          {isOpen && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-sm font-bold text-white shadow-inner">
                {person?.email ? person.email.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate text-sm font-bold text-slate-900">
                  {person?.displayName || person?.email?.split("@")[0] || "Administrator"}
                </p>
                <p className="truncate text-xs font-medium text-slate-500">
                  {person?.email || "admin@genesys.com"}
                </p>
              </div>
            </div>
          )}
          
          <button
            onClick={logOut}
            title={!isOpen ? "Logout" : undefined}
            className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600 ${
              !isOpen ? "justify-center" : "gap-3"
            }`}
          >
            <HiOutlineLogout size={20} className="shrink-0 text-slate-400 group-hover:text-rose-500" />
            {isOpen && <span>Sign Out</span>}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Top Header - Glassmorphism */}
        <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800">Dashboard Overview</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-medium text-slate-600 md:flex">
              <HiOutlineCalendar size={16} className="text-slate-400" />
              {today}
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminHome;