import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { Check, X, Globe } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminWesternUnion = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API}/admin/western-union`);
      setPayments(response.data);
    } catch (error) {
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const approvePayment = async (id) => {
    try {
      await axios.post(`${API}/admin/western-union/approve/${id}`);
      toast.success('Western Union ödemesi onaylandı');
      fetchPayments();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const rejectPayment = async (id) => {
    try {
      await axios.post(`${API}/admin/western-union/reject/${id}`);
      toast.success('Western Union ödemesi reddedildi');
      fetchPayments();
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
    <div className="space-y-6" data-testid="admin-western-union">
      <div>
        <h1 className="font-chivo font-black text-3xl text-white mb-2">Western Union Onay</h1>
        <p className="text-zinc-400">Western Union ödemelerini onaylayın</p>
      </div>

      <Card className="bg-zinc-900/70 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Western Union Ödemeleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-zinc-400">Yükleniyor...</p>
          ) : payments.length === 0 ? (
            <p className="text-zinc-400">Henüz Western Union ödemesi yok</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/50">
                    <th className="text-left py-3 px-4 text-zinc-300 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 text-zinc-300 font-semibold">TARİH</th>
                    <th className="text-left py-3 px-4 text-zinc-300 font-semibold">KULLANICI</th>
                    <th className="text-left py-3 px-4 text-zinc-300 font-semibold">ÇEKİM TUTARI</th>
                    <th className="text-left py-3 px-4 text-zinc-300 font-semibold">KOMİSYON (%7.5)</th>
                    <th className="text-left py-3 px-4 text-zinc-300 font-semibold">DURUM</th>
                    <th className="text-left py-3 px-4 text-zinc-300 font-semibold">AKSİYON</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr key={payment.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-3 px-4 text-zinc-400">{index + 1}</td>
                      <td className="py-3 px-4 text-zinc-400">{new Date(payment.created_at).toLocaleString('tr-TR')}</td>
                      <td className="py-3 px-4 text-white">{payment.username}</td>
                      <td className="py-3 px-4 text-gold-500 font-mono font-bold">{payment.withdrawal_amount?.toLocaleString('tr-TR')} TL</td>
                      <td className="py-3 px-4 text-red-400 font-mono">{payment.fee_amount?.toLocaleString('tr-TR')} TL</td>
                      <td className="py-3 px-4">{getStatusBadge(payment.status)}</td>
                      <td className="py-3 px-4">
                        {payment.status === 'pending' ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approvePayment(payment.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="h-4 w-4 mr-1" /> ONAYLA
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => rejectPayment(payment.id)}
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

export default AdminWesternUnion;
