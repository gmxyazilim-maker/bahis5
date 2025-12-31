import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { Check, X, UserCheck } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminActivations = () => {
  const [activations, setActivations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivations();
  }, []);

  const fetchActivations = async () => {
    try {
      const response = await axios.get(`${API}/admin/activations`);
      setActivations(response.data);
    } catch (error) {
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const approveActivation = async (userId) => {
    try {
      await axios.post(`${API}/admin/users/approve/${userId}`);
      toast.success('Aktivasyon onaylandı');
      fetchActivations();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const rejectActivation = async (userId) => {
    try {
      await axios.post(`${API}/admin/users/reject/${userId}`);
      toast.success('Aktivasyon reddedildi');
      fetchActivations();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-pending px-2 py-1 rounded-full text-xs font-semibold">BEKLEMEDE</span>;
      case 'approved':
        return <span className="status-success px-2 py-1 rounded-full text-xs font-semibold">ONAYLANDI</span>;
      case 'rejected':
        return <span className="status-error px-2 py-1 rounded-full text-xs font-semibold">REDDEDİLDİ</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-activations">
      <div>
        <h1 className="font-chivo font-black text-3xl text-white mb-2">Aktivasyon Onay</h1>
        <p className="text-zinc-400">Kullanıcı aktivasyon taleplerini onaylayın</p>
      </div>

      <Card className="bg-zinc-900/70 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-500" />
            Aktivasyon Talepleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-zinc-400">Yükleniyor...</p>
          ) : activations.length === 0 ? (
            <p className="text-zinc-400">Henüz aktivasyon talebi yok</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/50">
                    <th className="text-left py-3 px-4 text-zinc-300 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 text-zinc-300 font-semibold">TARİH</th>
                    <th className="text-left py-3 px-4 text-zinc-300 font-semibold">KULLANICI</th>
                    <th className="text-left py-3 px-4 text-zinc-300 font-semibold">TELEFON</th>
                    <th className="text-left py-3 px-4 text-zinc-300 font-semibold">TUTAR</th>
                    <th className="text-left py-3 px-4 text-zinc-300 font-semibold">DURUM</th>
                    <th className="text-left py-3 px-4 text-zinc-300 font-semibold">AKSİYON</th>
                  </tr>
                </thead>
                <tbody>
                  {activations.map((activation, index) => (
                    <tr key={activation.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-3 px-4 text-zinc-400">{index + 1}</td>
                      <td className="py-3 px-4 text-zinc-400">{new Date(activation.created_at).toLocaleString('tr-TR')}</td>
                      <td className="py-3 px-4 text-white">{activation.username}</td>
                      <td className="py-3 px-4 text-zinc-400 font-mono">{activation.phone}</td>
                      <td className="py-3 px-4 text-gold-500 font-mono font-bold">{activation.amount?.toLocaleString('tr-TR')} TL</td>
                      <td className="py-3 px-4">{getStatusBadge(activation.status)}</td>
                      <td className="py-3 px-4">
                        {activation.status === 'pending' ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveActivation(activation.user_id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="h-4 w-4 mr-1" /> ONAYLA
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => rejectActivation(activation.user_id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <X className="h-4 w-4 mr-1" /> REDDET
                            </Button>
                          </div>
                        ) : (
                          <span className="text-zinc-500">İşlem Tamamlandı</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivations;
