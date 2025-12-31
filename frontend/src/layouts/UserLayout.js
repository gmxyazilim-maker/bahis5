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
    <div className="min-h-screen bg-void-950">
      {/* Header */}
      <header className="bg-zinc-900/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-chivo font-black text-xl text-gold-500">BAHİS DANIŞMANI</h1>
          
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                data-testid={`user-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gold-500/10 text-gold-500'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            <span className="text-zinc-400 text-sm">
              Hoş geldin, <span className="text-white font-semibold">{user?.username}</span>
            </span>
            <button
              onClick={handleLogout}
              data-testid="user-logout-btn"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Nav */}
        <nav className="md:hidden border-t border-white/5 px-4 py-2 flex gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gold-500/10 text-gold-500'
                    : 'text-zinc-400'
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
