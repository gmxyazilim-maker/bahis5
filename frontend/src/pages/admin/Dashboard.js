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
    { title: 'Onay Bekleyen', value: stats.pendingUsers, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { title: 'Aktif Kullanıcı', value: stats.activeUsers, icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Kupon Şablonu', value: stats.coupons, icon: Ticket, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Bekleyen Çekim', value: stats.pendingWithdrawals, icon: Wallet, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <div>
        <h1 className="font-chivo font-black text-3xl text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">Genel bakış ve istatistikler</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-zinc-900/70 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-zinc-900/70 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Hoş Geldiniz</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-400">
            Sol menüyü kullanarak kupon şablonları oluşturabilir, kullanıcıları yönetebilir, 
            para çekim taleplerini kontrol edebilir ve sistem ayarlarını düzenleyebilirsiniz.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
