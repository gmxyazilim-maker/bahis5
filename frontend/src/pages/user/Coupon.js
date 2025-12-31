import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../../components/ui/card';
import { Check, Clock, HelpCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const UserCoupon = () => {
  const [coupon, setCoupon] = useState(null);
  const [balance, setBalance] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [couponRes, balanceRes] = await Promise.all([
        axios.get(`${API}/user/coupon`),
        axios.get(`${API}/user/balance`)
      ]);
      setCoupon(couponRes.data);
      setBalance(balanceRes.data.balance);
      setRevealed(couponRes.data?.revealed || balanceRes.data?.coupon_revealed || false);
    } catch (error) {
      console.error('Data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="bg-white/80 backdrop-blur border-slate-200 p-8 text-center shadow-lg">
          <p className="text-slate-500">Henüz size atanmış kupon bulunmuyor.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="user-coupon">
      <div className="text-center mb-8">
        <h1 className="font-chivo font-black text-3xl text-slate-800 mb-2">KUPONLARIM</h1>
        <p className="text-slate-500">
          {revealed ? 'Kazanan kuponunuzu görüntüleyin' : 'Maçlarınız devam ediyor...'}
        </p>
      </div>

      {/* Professional Coupon Design */}
      <div className="max-w-lg mx-auto">
        <Card className="bg-white overflow-hidden rounded-2xl shadow-2xl border-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white py-4 px-6 text-center">
            <h2 className="font-chivo font-black text-2xl tracking-wider">BETLIVE</h2>
            <p className="text-purple-200 text-sm font-medium mt-1">{coupon.consultant_name?.toUpperCase()} BAHİS DANIŞMANI</p>
          </div>

          <CardContent className="p-6 bg-white">
            {/* Match Details Header */}
            <h3 className="font-bold text-lg mb-4 text-slate-800">MAÇ DETAYLARI</h3>

            {/* Matches */}
            <div className="space-y-4">
              {coupon.matches?.map((match, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-4 py-2 bg-slate-50 rounded-r-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{match.teams}</p>
                      <p className="text-slate-500 text-sm">
                        Tahmin: {match.prediction}
                      </p>
                      {revealed && (
                        <p className="text-slate-500 text-sm">
                          Oran: <span className="font-bold text-purple-600">{match.odds}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {revealed ? (
                        <>
                          <div className="text-right">
                            <p className="text-slate-400 text-sm">Sonuç:</p>
                            <p className="font-bold text-slate-800">{match.result}</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-500">
                          <Clock className="h-5 w-5 animate-pulse" />
                          <span className="text-sm font-medium">Bekleniyor</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-slate-200 my-6"></div>

            {/* Summary */}
            {revealed ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Toplam Oran:</span>
                  <span className="font-mono font-bold text-purple-600">{coupon.total_odds?.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Yatırılan Miktar:</span>
                  <span className="font-mono font-bold text-slate-800">{coupon.bet_amount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                </div>
                {/* Max Win */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-slate-800">MAKSİMUM KAZANÇ:</span>
                    <span className="font-mono font-bold text-2xl text-green-600">{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                  </div>
                </div>
                {/* Status Button */}
                <div className="mt-6">
                  <div className={`w-full py-4 rounded-xl text-center font-chivo font-black text-xl tracking-wider shadow-lg ${
                    coupon.status === 'kazandi' 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                      : coupon.status === 'kaybetti'
                      ? 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                      : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                  }`}>
                    {coupon.status === 'kazandi' ? 'KAZANDI' : coupon.status === 'kaybetti' ? 'KAYBETTİ' : 'BEKLEMEDE'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <HelpCircle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                <h3 className="font-bold text-xl text-slate-800 mb-2">Sonuçlar Bekleniyor</h3>
                <p className="text-slate-500">
                  Maçlarınız devam ediyor. Maçlar bittiğinde sonuçlar burada görünecektir.
                </p>
                <div className="mt-6 py-4 px-6 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-700 text-sm">
                    Danışmanınız maç sonuçlarını girdiğinde bilgilendirileceksiniz.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserCoupon;
