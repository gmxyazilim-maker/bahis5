import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, Ticket, Wallet, Clock } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    pendingUsers: 0,
    activeUsers: 0,
    coupons: 0,
    pendingWithdrawals: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [pendingRes, usersRes, couponsRes, withdrawalsRes] = await Promise.all([
        axios.get(`${API}/admin/pending-users`),
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/admin/coupons`),
        axios.get(`${API}/admin/withdrawals`)
      ]);
      
      setStats({
        pendingUsers: pendingRes.data.filter(u => u.status === 'pending').length,
        activeUsers: usersRes.data.length,
        coupons: couponsRes.data.length,
        pendingWithdrawals: withdrawalsRes.data.filter(w => w.status === 'pending').length
      });
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  const statCards = [
    { title: 'Onay Bekleyen', value: stats.pendingUsers, icon: Clock, color: 'text-amber-500', bg: 'bg-gradient-to-r from-amber-100 to-orange-100', iconBg: 'bg-amber-500' },
    { title: 'Aktif Kullanıcı', value: stats.activeUsers, icon: Users, color: 'text-green-500', bg: 'bg-gradient-to-r from-green-100 to-emerald-100', iconBg: 'bg-green-500' },
    { title: 'Kupon Şablonu', value: stats.coupons, icon: Ticket, color: 'text-blue-500', bg: 'bg-gradient-to-r from-blue-100 to-cyan-100', iconBg: 'bg-blue-500' },
    { title: 'Bekleyen Çekim', value: stats.pendingWithdrawals, icon: Wallet, color: 'text-purple-500', bg: 'bg-gradient-to-r from-purple-100 to-violet-100', iconBg: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <div>
        <h1 className="font-chivo font-black text-3xl text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-500">Genel bakış ve istatistikler</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className={`${stat.bg} border-0 shadow-lg card-hover`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-xl ${stat.iconBg} shadow-lg`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white/80 backdrop-blur border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-800">Hoş Geldiniz</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">
            Sol menüyü kullanarak kupon şablonları oluşturabilir, kullanıcıları yönetebilir, 
            para çekim taleplerini kontrol edebilir ve sistem ayarlarını düzenleyebilirsiniz.
          </p>
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <p className="text-blue-700 text-sm">
              <strong>İpucu:</strong> Kupon sonuçlarını kullanıcıya göstermek için "Kayıtlı Kullanıcılar" sayfasında göz ikonuna tıklayın.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
