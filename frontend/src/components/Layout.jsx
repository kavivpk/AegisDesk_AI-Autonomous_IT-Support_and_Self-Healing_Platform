import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/tickets', icon: '🎫', label: 'Tickets' },
  { path: '/create-ticket', icon: '➕', label: 'Create Ticket' },
  { path: '/knowledge', icon: '📚', label: 'Knowledge Base' },
  { path: '/analytics', icon: '📈', label: 'Analytics' },
];

const adminItems = [
  { path: '/admin', icon: '⚙️', label: 'Admin Panel' },
];

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, setIsDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const bg = isDark ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900';
  const sidebar = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const topbar = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const activeNav = 'bg-indigo-600 text-white';
  const inactiveNav = isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';

  return (
    <div className={`flex h-screen overflow-hidden ${bg}`}>
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-56'} ${sidebar} border-r flex flex-col transition-all duration-300 flex-shrink-0`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <span className="text-xl flex-shrink-0">🛡️</span>
          {!collapsed && <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>AegisDesk</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-gray-500 hover:text-gray-300 text-xs">
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm font-medium
                ${location.pathname === item.path ? activeNav : inactiveNav}`}>
              <span>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}

          {user?.role === 'admin' && (
            <>
              {!collapsed && <p className={`text-xs uppercase tracking-wider px-3 pt-4 pb-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Admin</p>}
              {adminItems.map(item => (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm font-medium
                    ${location.pathname === item.path ? activeNav : inactiveNav}`}>
                  <span>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* User + Logout */}
        <div className={`p-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
                <p className={`text-xs capitalize ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{user?.role}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-red-400 hover:bg-red-900/20 transition text-sm">
            <span>🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Top bar */}
        <div className={`${topbar} border-b px-6 py-3 flex items-center justify-between flex-shrink-0`}>
          <h2 className={`text-base font-semibold capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {location.pathname.replace('/', '').replace(/-/g, ' ') || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button onClick={() => setIsDark(!isDark)}
              className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${isDark ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              <span className={`absolute w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-300 flex items-center justify-center text-xs ${isDark ? 'translate-x-6' : 'translate-x-0.5'}`}>
                {isDark ? '🌙' : '☀️'}
              </span>
            </button>
            <span className={`text-sm hidden sm:block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {user?.name}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium
              ${user?.role === 'admin' ? 'bg-red-900/30 text-red-400' :
                user?.role === 'it_engineer' ? 'bg-blue-900/30 text-blue-400' :
                'bg-green-900/30 text-green-400'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        <div className={`flex-1 overflow-auto p-6 ${!isDark ? 'bg-gray-50' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  );
}