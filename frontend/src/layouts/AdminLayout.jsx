import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, Monitor, Calendar, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/employees', icon: <Users size={20} />, label: 'Employees' },
    { to: '/equipment', icon: <Monitor size={20} />, label: 'Equipment' },
    { to: '/leave-requests', icon: <Calendar size={20} />, label: 'Leave Requests' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 bg-gray-950 border-b border-gray-800">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-primary-400">HR</span> System
          </h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                      isActive 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-6 border-t border-gray-800 bg-gray-950">
          <div className="mb-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Account</div>
            <div className="font-semibold text-white truncate">{user?.name}</div>
            <div className="text-sm text-gray-400 capitalize">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 justify-center py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50 relative">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
