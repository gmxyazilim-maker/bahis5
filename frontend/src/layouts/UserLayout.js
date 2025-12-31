import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Ticket, Wallet, LogOut } from 'lucide-react';

const UserLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/dashboard/coupon', icon: Ticket, label: 'Kuponlarım' },
    { to: '/dashboard/withdraw', icon: Wallet, label: 'Para Çekme' },
  ];

  return (
    <div className="min-h-screen bg-gradient-vibrant">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-chivo font-black text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">BAHİS DANIŞMANI</h1>
          
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                data-testid={`user-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            <span className="text-slate-500 text-sm">
              Hoş geldin, <span className="text-slate-800 font-semibold">{user?.username}</span>
            </span>
            <button
              onClick={handleLogout}
              data-testid="user-logout-btn"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Nav */}
        <nav className="md:hidden border-t border-slate-200 px-4 py-2 flex gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white'
                    : 'text-slate-500'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
