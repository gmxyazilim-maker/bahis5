import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Wallet, 
  Receipt, 
  Globe, 
  Shield, 
  UserCheck, 
  Settings,
  LogOut 
} from 'lucide-react';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/coupons', icon: Ticket, label: 'Kupon Şablonları' },
    { to: '/admin/users', icon: Users, label: 'Kayıtlı Kullanıcılar' },
    { to: '/admin/withdrawals', icon: Wallet, label: 'Para Çekim Talepleri' },
    { to: '/admin/tax-payments', icon: Receipt, label: 'Ödemeler / Dekont' },
    { to: '/admin/western-union', icon: Globe, label: 'Western Union Onay' },
    { to: '/admin/masak', icon: Shield, label: 'MASAK Onay' },
    { to: '/admin/activations', icon: UserCheck, label: 'Aktivasyon Onay' },
    { to: '/admin/settings', icon: Settings, label: 'İletişim Ayarları' },
  ];

  return (
    <div className="min-h-screen bg-gradient-vibrant flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 flex flex-col fixed h-screen shadow-xl">
        <div className="p-6 border-b border-slate-200">
          <h1 className="font-chivo font-black text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">YÖNETİCİ</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-testid={`admin-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            data-testid="admin-logout-btn"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 w-full transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 ml-64 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
