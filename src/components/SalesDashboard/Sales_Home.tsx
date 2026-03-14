import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  Bell, 
  LayersPlus,
  WorkflowIcon,
  Timer
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router';

const Sales_Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  // Mock user data
  const user = {
    name: "Sakib Sarkar",
    email: "sakib@example.com",
    
    avatar: "https://ui-avatars.com/api/?name=Sakib+Sarkar&background=7FA23B&color=fff"
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard/sales', icon: LayoutDashboard },
    { name: 'Create Leads', path: '/dashboard/sales/create-leads', icon: LayersPlus },
    { name: 'My Leads', path: '/dashboard/sales/all-leads', icon: Users },
    { name: 'My Meetings', path: '/dashboard/sales/meetings', icon: Calendar },
    { name: 'Proposals', path: '/dashboard/deals', icon: Briefcase },
    { name: 'Reminder Proposals', path: '/dashboard/deals/remainder', icon: Timer },  
    { name: 'Closed Deals', path: '/dashboard/settings', icon: Settings },
    { name: 'Won Deals', path: '/dashboard/settings', icon: WorkflowIcon },
  ];

  return (
    <div className="poppins-regular flex h-screen bg-[#F8FAFC] font-sans text-gray-900">
      
      {/* Modern SaaS Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col z-20`}
      >
        {/* Brand Area */}
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <span className={`font-bold text-gray-900 text-xl tracking-wide ${!isSidebarOpen && 'hidden'}`}>
            Gene<span className="text-[#7FA23B]">sys</span> CRM
          </span>
          {!isSidebarOpen && (
            <div className="w-10 h-10 bg-[#7FA23B]/10 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-[#7FA23B]" />
            </div>
          )}
        </div>

        {/* Navigation Area */}
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
                      ? 'bg-[#7FA23B]/10 text-[#7FA23B]' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <Icon 
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isActive 
                        ? 'text-[#7FA23B]' 
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`} 
                  />
                  <span 
                    className={`ml-3 text-sm transition-opacity ${
                      isActive ? 'font-bold' : 'font-medium'
                    } ${!isSidebarOpen && 'hidden'}`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-gray-100">
          <button 
            className="group flex items-center px-3 py-2.5 rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
            title={!isSidebarOpen ? "Sign Out" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-red-500 transition-colors" />
            <span className={`ml-3 text-sm font-medium ${!isSidebarOpen && 'hidden'}`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Navbar */}
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
            <button className="text-gray-400 hover:text-gray-600 relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center space-x-3 border-l pl-6 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
                <div className="flex items-center justify-end space-x-2 mt-0.5">
  
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
              </div>
              <img 
                src={user.avatar} 
                alt="Profile" 
                className="w-9 h-9 rounded-full ring-2 ring-gray-100 shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6 lg:p-4">
          <Outlet /> 
        </main>
        
      </div>
    </div>
  );
};

export default Sales_Home;