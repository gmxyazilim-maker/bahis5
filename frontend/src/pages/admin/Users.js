import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Check, X, UserPlus, Trash2, Eye, Edit } from 'lucide-react';

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

  const revealCoupon = async (userId) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/reveal-coupon`);
      toast.success('Kupon sonuçları kullanıcıya gösterildi');
      fetchData();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const updateUserBalance = async (userId, newBalance) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/update`, { balance: newBalance });
      toast.success('Bakiye güncellendi');
      fetchData();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-users">
      <div>
        <h1 className="font-chivo font-black text-3xl text-slate-800 mb-2">Kullanıcı Yönetimi</h1>
        <p className="text-slate-500">Kullanıcıları yönetin ve kupon atayın</p>
      </div>

      {/* Pending Users */}
      {pendingUsers.length > 0 && (
        <Card className="bg-white/80 backdrop-blur border-slate-200 border-l-4 border-l-amber-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-amber-600 flex items-center gap-2">
              <span className="animate-pulse">●</span> ONAY BEKLEYEN BAŞVURULAR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">İSİM SOYİSİM</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">TELEFON (K.ADI)</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">SEÇTİĞİ TUTAR</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">TARİH</th>
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">İŞLEM</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100">
                      <td className="py-3 px-4 text-slate-800">{user.username}</td>
                      <td className="py-3 px-4 text-slate-800 font-mono">{user.phone}</td>
                      <td className="py-3 px-4 text-purple-600 font-mono font-bold">{user.amount?.toLocaleString('tr-TR')} TL</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(user.created_at).toLocaleString('tr-TR')}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveUser(user.user_id)}
                            data-testid={`approve-user-${user.user_id}`}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white"
                          >
                            <Check className="h-4 w-4 mr-1" /> ONAYLA
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => rejectUser(user.user_id)}
                            data-testid={`reject-user-${user.user_id}`}
                            className="bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 text-white"
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
        <Card className="bg-white/80 backdrop-blur border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-purple-500" /> Manuel Kullanıcı Ekle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createUser} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Kullanıcı Adı</Label>
                <Input
                  data-testid="new-user-username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="bg-white border-slate-200 text-slate-800"
                  placeholder="Ör: ahmet123"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Şifre</Label>
                <Input
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="bg-white border-slate-200 text-slate-800"
                  placeholder="Ör: 123456"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Atanacak Kupon Şablonu</Label>
                <Select
                  value={newUser.coupon_id}
                  onValueChange={(value) => setNewUser({ ...newUser, coupon_id: value })}
                >
                  <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                    <SelectValue placeholder="-- Kupon Seç --" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
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
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white font-bold"
              >
                KULLANICIYI EKLE VE KUPONU ATA
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Users List */}
        <Card className="bg-white/80 backdrop-blur border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-green-600">Aktif Kullanıcılar Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-slate-500 font-medium text-sm">KULLANICI ADI</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-medium text-sm">BAKİYE</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-medium text-sm">KUPON</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-medium text-sm">İŞLEM</th>
                  </tr>
                </thead>
                <tbody>
                  {activeUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100">
                      <td className="py-2 px-3 text-slate-800">{user.username}</td>
                      <td className="py-2 px-3 text-purple-600 font-mono font-bold">{user.balance?.toLocaleString('tr-TR')} TL</td>
                      <td className="py-2 px-3">
                        {user.coupon_revealed ? (
                          <span className="text-green-500 text-xs font-bold">GÖSTERILDI</span>
                        ) : (
                          <span className="text-amber-500 text-xs font-bold">GİZLİ</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1">
                          {!user.coupon_revealed && user.coupon_id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => revealCoupon(user.id)}
                              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              title="Kuponu Göster"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteUser(user.id)}
                            className="text-red-400 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
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
      </div>
    </div>
  );
};

export default AdminUsers;
