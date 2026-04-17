import { useContext, useState } from 'react';
import {
  Megaphone,
  BarChart3,
  Globe,
  LogOut,
  Menu,
  Bell,
  Zap
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router';

import { AuthContext } from '../Authentication/AuthProvider/AuthProvider';
import { useUserDataMarketing } from './HOOK/User_Data_Marketer';

const MarketingHome = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const { userData } = useUserDataMarketing();
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext is not available");

  const { logOut } = auth;

  const user = {
    name: userData?.name || "Unknown User",
    role: userData?.role ? `${userData.role} Manager` : "Marketing Manager",
    avatar:
      userData?.avatar ||
      "https://ui-avatars.com/api/?name=M+M&background=C9A646&color=fff"
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard/marketing', icon: BarChart3 },
    { name: 'Pending Signatures', path: '/dashboard/marketing/pending-signatures', icon: Megaphone },
    { name: 'Reminders', path: '/dashboard/marketing/remainders-to-signatures', icon: Globe },
    { name: 'Create Campaign', path: '/dashboard/marketing/create-campaign', icon: Zap },
    { name: 'All Campaigns', path: '/dashboard/marketing/all-campaigns', icon: BarChart3 },
  ];

  return (
    <div className="poppins-regular flex h-screen bg-[#F8FAFC] text-slate-800">

      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'w-64' : 'w-20'}
        bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <span className={`font-semibold text-lg flex items-center gap-2 ${!isSidebarOpen && 'hidden'}`}>
            <Zap className="w-5 h-5 text-[#C9A646]" />
            G.<span className="text-[#C9A646]">Marketing</span>
          </span>
          {!isSidebarOpen && (
            <div className="w-10 h-10 rounded-xl bg-[#C9A646]/10 flex items-center justify-center">
              <Zap className="w-7 h-7 text-[#C9A646]" />
            </div>
          )}
        </div>

        {/* Navigation */}
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
                    isSidebarOpen ? 'px-4 mx-3' : 'px-0 mx-3 justify-center'
                  } ${
                    isActive
                      ? 'bg-[#F7F3E8] text-[#C9A646] shadow-sm'
                      : 'hover:bg-gray-50 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`shrink-0 ${isSidebarOpen ? 'w-5 h-5 mr-3' : 'w-6 h-6'} ${
                      isActive ? 'text-[#C9A646]' : 'text-slate-400'
                    }`}
                  />
                  {isSidebarOpen && (
                    <span className="text-sm font-medium">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={async () => await logOut()}
            className={`flex items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-500 transition w-full ${
              isSidebarOpen ? 'gap-2 px-3 py-2' : 'justify-center px-0 py-2.5'
            }`}
          >
            <LogOut className={isSidebarOpen ? 'w-5 h-5' : 'w-6 h-6'} />
            {isSidebarOpen && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md text-slate-500 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-slate-700 hidden sm:block">
              Marketing Workspace
            </h2>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative p-2 rounded-full text-slate-500 hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C9A646] rounded-full"></span>
            </button>

            <div className="h-6 w-px bg-gray-200"></div>

            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-700">{user.name}</p>
                <p className="text-xs text-slate-400">{user.role}</p>
              </div>
              <img
                src={user.avatar}
                alt="profile"
                className="w-8 h-8 rounded-full border"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto  bg-[#F8FAFC]">
          <div className="min-h-screen w-full bg-white relative">
  {/* Noise Texture (Darker Dots) Background */}
  <div
    className="absolute inset-0 z-0"
    style={{
      background: "#ffffff",
      backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.35) 1px, transparent 0)",
      backgroundSize: "20px 20px",
    }}
  />
     {/* Your Content/Components */}
          <div className="relative z-10">
    <Outlet />
  </div>

</div>
        </main>

      </div>
    </div>
  );
};

export default MarketingHome;