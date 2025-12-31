import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../../components/ui/card';
import { Check } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const UserCoupon = () => {
  const [coupon, setCoupon] = useState(null);
  const [balance, setBalance] = useState(0);
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
    } catch (error) {
      console.error('Data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="bg-zinc-900/70 border-zinc-800 p-8 text-center">
          <p className="text-zinc-400">Henüz size atanmış kupon bulunmuyor.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="user-coupon">
      <div className="text-center mb-8">
        <h1 className="font-chivo font-black text-3xl text-white mb-2">KUPONLARIM</h1>
        <p className="text-zinc-400">Kazanan kuponunuzu görüntüleyin</p>
      </div>

      {/* Professional Coupon Design */}
      <div className="max-w-lg mx-auto">
        <Card className="bg-white text-black overflow-hidden rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="bg-zinc-900 text-white py-4 px-6 text-center">
            <h2 className="font-chivo font-black text-2xl tracking-wider">BETLIVE</h2>
            <p className="text-pink-400 text-sm font-medium mt-1">{coupon.consultant_name?.toUpperCase()} BAHİS DANIŞMANI</p>
          </div>

          <CardContent className="p-6 bg-white">
            {/* Match Details Header */}
            <h3 className="font-bold text-lg mb-4 text-gray-800">MAÇ DETAYLARI</h3>

            {/* Matches */}
            <div className="space-y-4">
              {coupon.matches?.map((match, index) => (
                <div key={index} className="border-l-4 border-pink-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{match.teams}</p>
                      <p className="text-gray-600 text-sm">
                        Tahmin: <span className="line-through">{match.prediction}</span>
                      </p>
                      <p className="text-gray-600 text-sm">
                        Oran: <span className="font-bold">{match.odds}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-gray-500 text-sm">Sonuç:</p>
                        <p className="font-bold text-gray-900">{match.result}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-300 my-6"></div>

            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Toplam Oran:</span>
                <span className="font-mono font-bold">{coupon.total_odds?.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Yatırılan Miktar:</span>
                <span className="font-mono font-bold">{coupon.bet_amount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
              </div>
            </div>

            {/* Max Win */}
            <div className="mt-4 pt-4 border-t border-gray-300">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">MAKSİMUM KAZANÇ:</span>
                <span className="font-mono font-bold text-2xl text-green-600">{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
              </div>
            </div>

            {/* Status Button */}
            <div className="mt-6">
              <div className={`w-full py-4 rounded-xl text-center font-chivo font-black text-xl tracking-wider ${
                coupon.status === 'kazandi' 
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' 
                  : 'bg-gradient-to-r from-red-400 to-red-600 text-white'
              }`}>
                {coupon.status === 'kazandi' ? 'KAZANDI' : 'KAYBETTİ'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserCoupon;
