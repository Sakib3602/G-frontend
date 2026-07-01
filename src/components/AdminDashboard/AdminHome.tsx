import { NavLink, Outlet } from 'react-router';
import { AuthContext } from '../Authentication/AuthProvider/AuthProvider';
import { useContext } from 'react';

const MENU_ITEMS = [
  { name: 'Home', path: '/dashboard/admin' },
  { name: 'All Employees', path: '/dashboard/admin/employees' },
  { name: 'Content Calendars', path: '/dashboard/admin/content-calendar' },
  { name: 'Campaigns Requests', path: '/dashboard/admin/campaigns-requests' },
  { name: 'Delay Works', path: '/dashboard/admin/delay-works' },
  { name: 'Settings', path: '/settings' },
  { name: 'Help', path: '/help' },
];

const AdminHome = () => {
    const {logOut} = useContext(AuthContext);
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="w-60 border-r border-gray-200 bg-white flex flex-col justify-between">
        <div className="p-6">
          <h2 className="text-[#F7941D] text-xl font-bold mb-8">Admin Dashboard</h2>
          
          <ul className="space-y-2"> {/* space-y কমিয়ে আরও সুন্দর করা হলো */}
            {MENU_ITEMS.map(({ name, path }) => (
              <li key={name}>
                <NavLink 
                  to={path}
                  end={path === '/dashboard/admin'} // এখানে end যোগ করা হয়েছে
                  className={({ isActive }) => 
                    `block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                      isActive 
                        ? 'text-[#F7941D] bg-orange-50 font-bold' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  {name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* User Profile & Logout Section */}
        <div className="p-4 border-t border-gray-100">
          <div className="mb-4 px-2">
            <p className="text-sm font-semibold text-gray-800">Sakib Sarkar Emon</p>
            <p className="text-xs text-gray-500 truncate">sakib@example.com</p>
          </div>
          <button onClick={logOut} className="w-full text-left text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
            Logout
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