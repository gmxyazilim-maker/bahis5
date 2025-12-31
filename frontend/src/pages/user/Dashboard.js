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
  const [revealed, setRevealed] = useState(false);
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
      setRevealed(couponRes.data?.revealed || balanceRes.data?.coupon_revealed || false);
    } catch (error) {
      console.error('Data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="user-dashboard">
      {/* Hero Card */}
      <Card className="bg-gradient-to-br from-purple-500 via-violet-500 to-blue-500 border-0 overflow-hidden relative shadow-2xl">
        <CardContent className="relative p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-purple-100 mb-2">Hoş geldiniz,</p>
              <h1 className="font-chivo font-black text-3xl md:text-4xl text-white mb-4">{user?.username}</h1>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-purple-200" />
                <span className="text-purple-100">Mevcut Bakiye:</span>
              </div>
              <p className="font-mono font-bold text-4xl md:text-5xl text-white mt-2">
                {revealed ? balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '***.**'} TL
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate('/dashboard/coupon')}
                data-testid="view-coupon-btn"
                className="bg-white hover:bg-slate-100 text-purple-600 font-bold px-8 shadow-lg"
              >
                <Ticket className="h-4 w-4 mr-2" />
                Kuponumu Gör
              </Button>
              {revealed && (
                <Button
                  onClick={() => navigate('/dashboard/withdraw')}
                  data-testid="withdraw-btn"
                  className="bg-gradient-to-r from-green-400 to-emerald-500 hover:opacity-90 text-white font-bold px-8 shadow-lg"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Para Çek
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur border-slate-200 shadow-lg card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Kupon Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-400">Yükleniyor...</p>
            ) : coupon ? (
              revealed ? (
                <span className={`text-xl font-bold ${
                  coupon.status === 'kazandi' ? 'text-green-500' : 
                  coupon.status === 'kaybetti' ? 'text-red-500' : 'text-amber-500'
                }`}>
                  {coupon.status === 'kazandi' ? 'KAZANDI' : coupon.status === 'kaybetti' ? 'KAYBETTİ' : 'BEKLEMEDE'}
                </span>
              ) : (
                <span className="text-amber-500 text-xl font-bold">MAÇLAR DEVAM EDİYOR</span>
              )
            ) : (
              <span className="text-slate-400">Kupon atanmamış</span>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur border-slate-200 shadow-lg card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Toplam Oran</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xl font-bold font-mono text-purple-600">
              {revealed ? (coupon?.total_odds?.toFixed(2) || '0.00') : '??.??'}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur border-slate-200 shadow-lg card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Maç Sayısı</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xl font-bold text-slate-800">
              {coupon?.matches?.length || 0}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Mini Coupon Preview */}
      {coupon && (
        <Card className="bg-white/80 backdrop-blur border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-purple-500" />
              Kupon Önizleme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coupon.matches?.slice(0, 3).map((match, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <span className="text-slate-800 font-semibold">{match.teams}</span>
                    <span className="text-slate-400 ml-2 text-sm">{match.prediction}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {revealed ? (
                      <>
                        <span className="text-purple-600 font-mono">{match.odds}</span>
                        <span className="font-bold text-green-500">
                          {match.result}
                        </span>
                      </>
                    ) : (
                      <span className="text-amber-500 text-sm">Bekleniyor...</span>
                    )}
                  </div>
                </div>
              ))}
              {coupon.matches?.length > 3 && (
                <p className="text-center text-slate-400 text-sm">
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
