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
    <div className="min-h-screen bg-void-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900/50 backdrop-blur-md border-r border-white/5 flex flex-col fixed h-screen">
        <div className="p-6 border-b border-white/5">
          <h1 className="font-chivo font-black text-2xl text-gold-500">YÖNETİCİ</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-testid={`admin-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            data-testid="admin-logout-btn"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full transition-all"
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
