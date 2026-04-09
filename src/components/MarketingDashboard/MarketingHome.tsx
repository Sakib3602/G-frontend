import { useContext, useState } from 'react';
import { 
  Megaphone, 
  BarChart3, 
  Globe, 
  Users,  
  LogOut, 
  Menu, 
  Bell,
  Zap
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router';
import { useUserData } from '../SalesDashboard/Sales_Hook/User_Data';
import { AuthContext } from '../Authentication/AuthProvider/AuthProvider';

const MarketingHome = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const {userData} = useUserData();
  const auth = useContext(AuthContext)
  if (!auth) {
    throw new Error("AuthContext is not available");
  }
  const { logOut } = auth


  // Mock user data
  const user = {
    name: userData?.name || "Unknown User",
    email: userData?.email || "unknown@example.com",
    role: userData?.role + " " + "Manager" || "Marketing Manager",
    avatar: userData?.avatar || "https://ui-avatars.com/api/?name=M+M&background=6B8932&color=fff"
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard/marketing', icon: BarChart3 },
    { name: 'Pending Signatures', path: '/dashboard/marketing/pending-signatures', icon: Megaphone },
    { name: 'Remainders', path: '/dashboard/marketing/social', icon: Globe },
    { name: 'OnBoarding', path: '/dashboard/marketing/audience', icon: Users },
    
  ];

  return (
    <div className="poppins-regular flex h-screen bg-gray-100 font-sans text-gray-900">
      
      {/* Premium Black Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-[#0A0A0A] border-r border-gray-800 transition-all duration-300 ease-in-out flex flex-col z-20 shadow-2xl`}
      >
        {/* Brand Area */}
        <div className="h-20 flex items-center justify-center border-b border-white/10">
          <span className={`font-bold text-white text-2xl tracking-widest flex items-center gap-2 ${!isSidebarOpen && 'hidden'}`}>
            <Zap className="w-6 h-6 text-[#6B8932] fill-[#6B8932]" />
            G.<span className="text-[#6B8932]">Marketing</span>
          </span>
          {!isSidebarOpen && (
            <div className="w-10 h-10 bg-[#6B8932]/20 rounded-xl flex items-center justify-center border border-[#6B8932]/30">
              <Zap className="w-5 h-5 text-[#6B8932] fill-[#6B8932]" />
            </div>
          )}
        </div>

        {/* Navigation Area */}
        <div className="flex-1 py-8 flex flex-col overflow-y-auto px-4">
          {isSidebarOpen && (
            <div className="px-2 mb-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                Marketing Menu
              </p>
            </div>
          )}
          
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center px-3 py-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#6B8932] text-white shadow-lg shadow-[#6B8932]/20' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <Icon 
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                      isActive 
                        ? 'text-white scale-110' 
                        : 'text-gray-500 group-hover:text-gray-300 group-hover:scale-110'
                    }`} 
                  />
                  <span 
                    className={`ml-4 text-sm tracking-wide transition-opacity duration-300 ${
                      isActive ? 'font-semibold' : 'font-medium'
                    } ${!isSidebarOpen && 'hidden w-0 opacity-0'}`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-white/10 mt-auto">
          <button 
            onClick={async()=>{
                await logOut();
            }}
            className="group flex items-center px-3 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 w-full"
            title={!isSidebarOpen ? "Sign Out" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-1" />
            <span className={`ml-4 text-sm font-medium tracking-wide ${!isSidebarOpen && 'hidden'}`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white flex items-center justify-between px-8 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-[#6B8932] hover:text-white focus:outline-none transition-all duration-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 hidden sm:block">
              Marketing Workspace
            </h2>
          </div>

          <div className="flex items-center space-x-6">
            <button className="text-gray-400 hover:text-[#6B8932] relative p-2 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-[#6B8932] rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center space-x-4 pl-6 border-l border-gray-200 cursor-pointer group">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-900 group-hover:text-[#6B8932] transition-colors">{user.name}</p>
                <div className="flex items-center justify-end space-x-2 mt-0.5">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{user.role}</span>
                </div>
              </div>
              <div className="relative">
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-xl object-cover border-2 border-transparent group-hover:border-[#6B8932] transition-all duration-300"
                />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
          <Outlet /> 
        </main>
        
      </div>
    </div>
  );
};

export default MarketingHome;