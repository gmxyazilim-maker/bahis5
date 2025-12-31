import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Wallet, Ticket, TrendingUp } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [balanceRes, couponRes] = await Promise.all([
        axios.get(`${API}/user/balance`),
        axios.get(`${API}/user/coupon`)
      ]);
      setBalance(balanceRes.data.balance);
      setCoupon(couponRes.data);
    } catch (error) {
      console.error('Data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="user-dashboard">
      {/* Hero Card */}
      <Card className="bg-gradient-to-br from-zinc-900 to-black border border-gold-500/20 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/918798/pexels-photo-918798.jpeg')] bg-cover bg-center opacity-10"></div>
        <CardContent className="relative p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-zinc-400 mb-2">Hoş geldiniz,</p>
              <h1 className="font-chivo font-black text-3xl md:text-4xl text-white mb-4">{user?.username}</h1>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-gold-500" />
                <span className="text-zinc-400">Mevcut Bakiye:</span>
              </div>
              <p className="font-mono font-bold text-4xl md:text-5xl text-gold-500 mt-2">
                {balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate('/dashboard/coupon')}
                data-testid="view-coupon-btn"
                className="bg-gold-500 hover:bg-gold-600 text-black font-bold px-8"
              >
                <Ticket className="h-4 w-4 mr-2" />
                Kuponumu Gör
              </Button>
              <Button
                onClick={() => navigate('/dashboard/withdraw')}
                data-testid="withdraw-btn"
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Para Çek
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/70 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Kupon Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-zinc-500">Yükleniyor...</p>
            ) : coupon ? (
              <span className={`text-xl font-bold ${coupon.status === 'kazandi' ? 'text-green-500' : 'text-red-500'}`}>
                {coupon.status === 'kazandi' ? 'KAZANDI' : 'KAYBETTİ'}
              </span>
            ) : (
              <span className="text-zinc-500">Kupon atanmamış</span>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/70 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Toplam Oran</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xl font-bold font-mono text-gold-500">
              {coupon?.total_odds?.toFixed(2) || '0.00'}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/70 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Maç Sayısı</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xl font-bold text-white">
              {coupon?.matches?.length || 0}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Mini Coupon Preview */}
      {coupon && (
        <Card className="bg-zinc-900/70 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Ticket className="h-5 w-5 text-gold-500" />
              Kupon Önizleme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coupon.matches?.slice(0, 3).map((match, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div>
                    <span className="text-white font-semibold">{match.teams}</span>
                    <span className="text-zinc-400 ml-2 text-sm">{match.prediction}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gold-500 font-mono">{match.odds}</span>
                    <span className={`font-bold ${match.is_correct !== false ? 'text-green-500' : 'text-red-500'}`}>
                      {match.result}
                    </span>
                  </div>
                </div>
              ))}
              {coupon.matches?.length > 3 && (
                <p className="text-center text-zinc-500 text-sm">
                  +{coupon.matches.length - 3} maç daha...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDashboard;
