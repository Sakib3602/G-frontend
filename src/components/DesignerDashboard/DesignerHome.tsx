import { useContext, useMemo, useState } from 'react';
import {
  Megaphone,
  BarChart3,
  LogOut,
  Menu,

  Bell,
  Sparkles,
  ChevronRight,
  PenTool,
  ChartNetwork,
  LocateOff
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router';

import { AuthContext } from '../Authentication/AuthProvider/AuthProvider';
import { useUserDataDesigner } from './HOOK/user_data_designer';




const DesignerHome = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const auth = useContext(AuthContext);
  if (!auth) throw new Error('AuthContext is not available');

  const { logOut, person } = auth;
  
  const { userData } = useUserDataDesigner();

  console.log("Designer User Data:", userData);
  const profile = useMemo(() => {
    const displayName = userData?.name || person?.displayName || 'Creative User';
    const title = 'Designer';
    const email = userData?.email || person?.email || 'designer@studio.io';
    const initials = displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'DU';

    return {
      displayName,
      title,
      email,
      initials,
     
    };
  }, [person?.displayName, person?.email, userData]);

  

  const navItems = [
    { name: 'Dashboard', path: '/dashboard/designer', icon: BarChart3 },
    { name: 'My Tasks', path: '/dashboard/designer/my-tasks', icon: Megaphone },
    { name: 'Running Works', path: '/dashboard/designer/in-progress-tasks', icon: ChartNetwork },
    { name: 'Overdue Tasks', path: '/dashboard/designer/overdue-tasks', icon: LocateOff },
   
  ];

  return (
    <div className="poppins-regular flex h-screen bg-[#F7F4EE] text-stone-800">

      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'w-72' : 'w-24'}
        border-r border-[#DDD2C3] bg-gradient-to-b from-[#FBF8F3] via-[#F3ECE2] to-[#EDE3D5] transition-all duration-300 flex flex-col backdrop-blur-xl`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-[#D9CCBC] px-4">
          <span className={`font-semibold text-lg flex items-center gap-3 ${!isSidebarOpen && 'hidden'}`}>
            
            <span>
              GENE<span className="text-amber-700">SYS</span> Designer
            </span>
          </span>
          {!isSidebarOpen && (
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center border border-amber-300/60">
              <PenTool className="w-6 h-6 text-amber-700" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 overflow-y-auto">
          {isSidebarOpen && (
            <div className="mx-4 mb-6 rounded-2xl border border-amber-300/60 bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-800">
                <Sparkles className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-wider">Creative Designer</p>
              </div>
              <p className="text-sm text-stone-700">Welcome back, {profile.displayName}!</p>
            </div>
          )}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center py-3 rounded-xl transition-all duration-200 ${
                      isSidebarOpen ? 'px-4 mx-3' : 'px-0 mx-3 justify-center'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-200/70 via-orange-200/60 to-rose-200/60 text-stone-900 border border-amber-300/70 shadow-lg shadow-amber-900/10'
                        : 'text-stone-600 hover:bg-white/70 hover:text-stone-900 border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`shrink-0 ${isSidebarOpen ? 'w-5 h-5 mr-3' : 'w-6 h-6'} ${
                          isActive ? 'text-amber-700' : 'text-stone-500 group-hover:text-stone-700'
                        }`}
                      />
                      {isSidebarOpen && (
                        <>
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                          {isActive && <ChevronRight className="ml-auto h-4 w-4 text-amber-700" />}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-[#D9CCBC]">
          <button
            onClick={async () => await logOut()}
            className={`flex items-center rounded-xl text-stone-600 hover:bg-rose-100 hover:text-rose-700 transition w-full border border-transparent hover:border-rose-200 ${
              isSidebarOpen ? 'gap-2 px-3 py-2.5' : 'justify-center px-0 py-2.5'
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
        <header className="h-20 border-b border-[#D9CCBC] bg-[#FCFAF6]/95 backdrop-blur-sm flex items-center justify-between px-6 shadow-lg shadow-amber-900/5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 rounded-xl text-stone-600 hover:bg-black/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-stone-900 hidden sm:block">
                Designer Command Center
              </h2>
              <p className="hidden sm:block text-xs text-stone-500">
                Curate, launch, and optimize your visual campaigns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            

            <button className="relative p-2.5 rounded-xl text-stone-600 hover:bg-black/5">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full"></span>
            </button>

            <div className="h-7 w-px bg-[#DCCFBE]"></div>

            <div className="flex items-center gap-3 cursor-pointer rounded-xl px-2 py-1.5 hover:bg-white/70 transition-colors">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-stone-900">{profile.displayName}</p>
                <p className="text-xs text-stone-500">{profile.title}</p>
              </div>
             
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-[#F3ECE2]">
          <div className="min-h-screen w-full relative">
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(120, 93, 58, 0.12) 1px, transparent 0), linear-gradient(120deg, rgba(255, 252, 246, 0.95), rgba(244, 233, 214, 0.9))',
                backgroundSize: '20px 20px, cover'
              }}
            />
            <div className="pointer-events-none absolute -top-12 right-8 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />
            <div className="pointer-events-none absolute top-52 -left-16 h-56 w-56 rounded-full bg-rose-300/20 blur-3xl" />

            <div className="relative z-10 px-4 md:px-6 py-6">
              
              <Outlet />
            </div>
          </div>
        </main>

      </div>
    </div>
  );
};

export default DesignerHome;