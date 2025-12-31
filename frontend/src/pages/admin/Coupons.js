import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Edit } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    consultant_name: 'Bahis Danışmanı',
    bet_amount: 1000,
    status: 'beklemede',
    matches: []
  });
  const [newMatch, setNewMatch] = useState({
    teams: '',
    prediction: 'SKOR TAHMİNİ',
    result: '',
    odds: 1,
    is_correct: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${API}/admin/coupons`);
      setCoupons(response.data);
    } catch (error) {
      toast.error('Kuponlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const addMatch = () => {
    if (!newMatch.teams) {
      toast.error('Maç bilgilerini doldurun');
      return;
    }
    setFormData({
      ...formData,
      matches: [...formData.matches, { ...newMatch }]
    });
    setNewMatch({ teams: '', prediction: 'SKOR TAHMİNİ', result: '', odds: 1, is_correct: true });
  };

  const removeMatch = (index) => {
    setFormData({
      ...formData,
      matches: formData.matches.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.matches.length === 0) {
      toast.error('En az bir maç ekleyin');
      return;
    }
    
    try {
      await axios.post(`${API}/admin/coupons`, formData);
      toast.success('Kupon şablonu oluşturuldu');
      setShowForm(false);
      setFormData({
        name: '',
        consultant_name: 'Bahis Danışmanı',
        bet_amount: 1000,
        status: 'beklemede',
        matches: []
      });
      fetchCoupons();
    } catch (error) {
      toast.error('Kupon oluşturulamadı');
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Bu kuponu silmek istediğinize emin misiniz?')) return;
    
    try {
      await axios.delete(`${API}/admin/coupons/${id}`);
      toast.success('Kupon silindi');
      fetchCoupons();
    } catch (error) {
      toast.error('Kupon silinemedi');
    }
  };

  const updateCouponStatus = async (couponId, newStatus) => {
    try {
      await axios.put(`${API}/admin/coupons/${couponId}`, { status: newStatus });
      toast.success('Kupon durumu güncellendi');
      fetchCoupons();
    } catch (error) {
      toast.error('Güncelleme başarısız');
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-coupons">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-chivo font-black text-3xl text-slate-800 mb-2">Kupon Şablonları</h1>
          <p className="text-slate-500">Kupon şablonlarını yönetin</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          data-testid="create-coupon-btn"
          className="bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90 text-white font-bold shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Şablon
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white/80 backdrop-blur border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-slate-800">Yeni Kupon Şablonu</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">Şablon Adı</Label>
                  <Input
                    data-testid="coupon-name-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white border-slate-200 text-slate-800"
                    placeholder="Ör: Haftalık Kupon"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Danışman Adı</Label>
                  <Input
                    value={formData.consultant_name}
                    onChange={(e) => setFormData({ ...formData, consultant_name: e.target.value })}
                    className="bg-white border-slate-200 text-slate-800"
                    placeholder="Bahis Danışmanı"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Yatırılan Miktar (TL)</Label>
                  <Input
                    type="number"
                    value={formData.bet_amount}
                    onChange={(e) => setFormData({ ...formData, bet_amount: parseFloat(e.target.value) })}
                    className="bg-white border-slate-200 text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Başlangıç Durumu</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="beklemede">BEKLEMEDE</SelectItem>
                      <SelectItem value="kazandi">KAZANDI</SelectItem>
                      <SelectItem value="kaybetti">KAYBETTİ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Matches List */}
              <div className="space-y-4">
                <Label className="text-slate-700 text-lg">Maçlar</Label>
                {formData.matches.map((match, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                    <div className="flex-1">
                      <span className="text-slate-800 font-semibold">{match.teams}</span>
                      <span className="text-slate-400 mx-2">|</span>
                      <span className="text-slate-500">{match.prediction}</span>
                      {match.result && (
                        <>
                          <span className="text-slate-400 mx-2">|</span>
                          <span className="text-purple-600">Sonuç: {match.result}</span>
                        </>
                      )}
                      <span className="text-slate-400 mx-2">|</span>
                      <span className="text-green-600">Oran: {match.odds}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMatch(index)}
                      className="text-red-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Add Match Form */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-slate-100 rounded-xl">
                  <Input
                    placeholder="Takımlar (Ör: FB - GS)"
                    value={newMatch.teams}
                    onChange={(e) => setNewMatch({ ...newMatch, teams: e.target.value })}
                    className="bg-white border-slate-200 text-slate-800"
                  />
                  <Input
                    placeholder="Tahmin"
                    value={newMatch.prediction}
                    onChange={(e) => setNewMatch({ ...newMatch, prediction: e.target.value })}
                    className="bg-white border-slate-200 text-slate-800"
                  />
                  <Input
                    placeholder="Sonuç (boş bırak)"
                    value={newMatch.result}
                    onChange={(e) => setNewMatch({ ...newMatch, result: e.target.value })}
                    className="bg-white border-slate-200 text-slate-800"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Oran"
                    value={newMatch.odds}
                    onChange={(e) => setNewMatch({ ...newMatch, odds: parseFloat(e.target.value) })}
                    className="bg-white border-slate-200 text-slate-800"
                  />
                  <Button
                    type="button"
                    onClick={addMatch}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Maç Ekle
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  data-testid="save-coupon-btn"
                  className="bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90 text-white font-bold"
                >
                  Şablonu Kaydet
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-slate-300 text-slate-600"
                >
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Coupons List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-slate-400">Yükleniyor...</p>
        ) : coupons.length === 0 ? (
          <p className="text-slate-400">Henüz kupon şablonu yok</p>
        ) : (
          coupons.map((coupon) => (
            <Card key={coupon.id} className="bg-white/80 backdrop-blur border-slate-200 shadow-lg card-hover">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-slate-800 text-lg">{coupon.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteCoupon(coupon.id)}
                  className="text-red-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Danışman:</span>
                  <span className="text-slate-800">{coupon.consultant_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Maç Sayısı:</span>
                  <span className="text-slate-800">{coupon.matches?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Toplam Oran:</span>
                  <span className="text-purple-600 font-mono font-bold">{coupon.total_odds}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Max Kazanç:</span>
                  <span className="text-green-600 font-mono font-bold">{coupon.max_win?.toLocaleString('tr-TR')} TL</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Durum:</span>
                  <Select
                    value={coupon.status}
                    onValueChange={(value) => updateCouponStatus(coupon.id, value)}
                  >
                    <SelectTrigger className={`w-32 h-8 text-xs font-bold ${
                      coupon.status === 'kazandi' ? 'bg-green-100 text-green-700 border-green-200' : 
                      coupon.status === 'kaybetti' ? 'bg-red-100 text-red-700 border-red-200' : 
                      'bg-amber-100 text-amber-700 border-amber-200'
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="beklemede">BEKLEMEDE</SelectItem>
                      <SelectItem value="kazandi">KAZANDI</SelectItem>
                      <SelectItem value="kaybetti">KAYBETTİ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;
