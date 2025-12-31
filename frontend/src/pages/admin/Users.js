import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Check, X, UserPlus, Trash2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminUsers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    username: '',
    phone: '',
    password: '123456',
    coupon_id: '',
    balance: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, usersRes, couponsRes] = await Promise.all([
        axios.get(`${API}/admin/pending-users`),
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/admin/coupons`)
      ]);
      setPendingUsers(pendingRes.data.filter(u => u.status === 'pending'));
      setActiveUsers(usersRes.data);
      setCoupons(couponsRes.data);
    } catch (error) {
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId) => {
    try {
      await axios.post(`${API}/admin/users/approve/${userId}`);
      toast.success('Kullanıcı onaylandı');
      fetchData();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const rejectUser = async (userId) => {
    try {
      await axios.post(`${API}/admin/users/reject/${userId}`);
      toast.success('Kullanıcı reddedildi');
      fetchData();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      toast.success('Kullanıcı silindi');
      fetchData();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const coupon = coupons.find(c => c.id === newUser.coupon_id);
      await axios.post(`${API}/admin/users/create`, {
        ...newUser,
        balance: coupon ? coupon.max_win : newUser.balance
      });
      toast.success('Kullanıcı oluşturuldu');
      setNewUser({ username: '', phone: '', password: '123456', coupon_id: '', balance: 0 });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'İşlem başarısız');
    }
  };

  const assignCoupon = async (userId, couponId) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/coupon`, { coupon_id: couponId });
      toast.success('Kupon atandı');
      fetchData();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-users">
      <div>
        <h1 className="font-chivo font-black text-3xl text-white mb-2">Kullanıcı Yönetimi</h1>
        <p className="text-zinc-400">Kullanıcıları yönetin ve kupon atayın</p>
      </div>

      {/* Pending Users */}
      {pendingUsers.length > 0 && (
        <Card className="bg-zinc-900/70 border-zinc-800 border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="text-yellow-500 flex items-center gap-2">
              <span className="animate-pulse">●</span> ONAY BEKLEYEN BAŞVURULAR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">İSİM SOYİSİM</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">TELEFON (K.ADI)</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">SEÇTİĞİ TUTAR</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">TARİH</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">İŞLEM</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((user) => (
                    <tr key={user.id} className="border-b border-zinc-800/50">
                      <td className="py-3 px-4 text-white">{user.username}</td>
                      <td className="py-3 px-4 text-white font-mono">{user.phone}</td>
                      <td className="py-3 px-4 text-gold-500 font-mono">{user.amount?.toLocaleString('tr-TR')} TL</td>
                      <td className="py-3 px-4 text-zinc-400">{new Date(user.created_at).toLocaleString('tr-TR')}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveUser(user.user_id)}
                            data-testid={`approve-user-${user.user_id}`}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="h-4 w-4 mr-1" /> ONAYLA
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => rejectUser(user.user_id)}
                            data-testid={`reject-user-${user.user_id}`}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <X className="h-4 w-4 mr-1" /> REDDET
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create User Form */}
        <Card className="bg-zinc-900/70 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Manuel Kullanıcı Ekle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createUser} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Kullanıcı Adı</Label>
                <Input
                  data-testid="new-user-username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Ör: ahmet123"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Şifre</Label>
                <Input
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Ör: 123456"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Atanacak Kupon Şablonu</Label>
                <Select
                  value={newUser.coupon_id}
                  onValueChange={(value) => setNewUser({ ...newUser, coupon_id: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="-- Kupon Seç --" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {coupons.map((coupon) => (
                      <SelectItem key={coupon.id} value={coupon.id}>
                        {coupon.name} ({coupon.max_win?.toLocaleString('tr-TR')} TL)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                data-testid="create-user-btn"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                KULLANICIYI EKLE VE KUPONU ATA
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Users List */}
        <Card className="bg-zinc-900/70 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-green-500">Aktif Kullanıcılar Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-zinc-900">
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-2 px-3 text-zinc-400 font-medium text-sm">KULLANICI ADI</th>
                    <th className="text-left py-2 px-3 text-zinc-400 font-medium text-sm">BAKİYE</th>
                    <th className="text-left py-2 px-3 text-zinc-400 font-medium text-sm">KUPON ID</th>
                    <th className="text-left py-2 px-3 text-zinc-400 font-medium text-sm">VERGİ DURUMU</th>
                    <th className="text-left py-2 px-3 text-zinc-400 font-medium text-sm">İŞLEM</th>
                  </tr>
                </thead>
                <tbody>
                  {activeUsers.map((user) => (
                    <tr key={user.id} className="border-b border-zinc-800/50">
                      <td className="py-2 px-3 text-white">{user.username}</td>
                      <td className="py-2 px-3 text-gold-500 font-mono">{user.balance?.toLocaleString('tr-TR')} TL</td>
                      <td className="py-2 px-3 text-zinc-400">{user.coupon_id ? '1' : '-'}</td>
                      <td className="py-2 px-3">
                        <span className="text-green-500">{user.tax_status || 'Temiz'}</span>
                      </td>
                      <td className="py-2 px-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteUser(user.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsers;
