import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { User, Phone, Lock, RefreshCw, Banknote } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    depositAmount: ''
  });
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const presetAmounts = [1000, 2000, 3000, 4000, 5000];

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1, num2, answer: '' });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectAmount = (amount) => {
    setFormData({ ...formData, depositAmount: amount.toString() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseInt(captcha.answer) !== captcha.num1 + captcha.num2) {
      toast.error('Güvenlik sorusu yanlış!');
      generateCaptcha();
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır!');
      return;
    }

    if (!formData.depositAmount || parseFloat(formData.depositAmount) < 1000) {
      toast.error('Lütfen en az 1000 TL tutar seçin!');
      return;
    }

    setLoading(true);
    try {
      await register(
        formData.username,
        formData.phone,
        formData.password,
        parseFloat(formData.depositAmount) || 0
      );
      toast.success('Kayıt başarılı! Yönetici onayı bekleniyor.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Kayıt başarısız');
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-vibrant flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="font-chivo font-black text-3xl text-slate-800 mb-2">KAYIT OL</h1>
            <p className="text-slate-500 text-sm">Yeni hesap oluşturun</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700">İsim Soyisim</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="username"
                  name="username"
                  data-testid="register-username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                  placeholder="Ör: Ahmet Yılmaz"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700">Telefon (K.ADI)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="phone"
                  name="phone"
                  data-testid="register-phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                  placeholder="5XX XXX XX XX"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-slate-700">Kupon Tutarı Seçin (TL)</Label>
              <div className="grid grid-cols-5 gap-2">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => selectAmount(amount)}
                    className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                      formData.depositAmount === amount.toString()
                        ? 'bg-gradient-purple text-white shadow-lg glow-purple'
                        : 'bg-white border-2 border-purple-200 text-purple-600 hover:border-purple-400'
                    }`}
                  >
                    {amount.toLocaleString('tr-TR')}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="depositAmount"
                  name="depositAmount"
                  data-testid="register-deposit"
                  type="number"
                  value={formData.depositAmount}
                  onChange={handleChange}
                  className="pl-10 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                  placeholder="Veya elle girin..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  data-testid="register-password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                  placeholder="En az 6 karakter"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700">Şifre Tekrar</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  data-testid="register-confirm-password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                  placeholder="Şifreyi tekrar girin"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Güvenlik Sorusu</Label>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-purple text-white rounded-lg px-4 py-2 font-mono font-bold">
                  {captcha.num1} + {captcha.num2} = ?
                </div>
                <Input
                  data-testid="register-captcha"
                  type="number"
                  value={captcha.answer}
                  onChange={(e) => setCaptcha({ ...captcha, answer: e.target.value })}
                  className="w-24 bg-white border-slate-200 text-slate-800 text-center font-mono"
                  placeholder="?"
                  required
                />
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-2 text-slate-400 hover:text-purple-600 transition-colors"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>

            <Button
              type="submit"
              data-testid="register-submit-btn"
              disabled={loading}
              className="w-full bg-gradient-purple hover:opacity-90 text-white font-chivo font-bold uppercase tracking-wider h-12 glow-purple"
            >
              {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-500 font-semibold">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
