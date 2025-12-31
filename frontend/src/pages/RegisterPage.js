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
    <div className="min-h-screen bg-void-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/918798/pexels-photo-918798.jpeg')] bg-cover bg-center opacity-10"></div>
      
      <div className="relative w-full max-w-md">
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="font-chivo font-black text-3xl text-white mb-2">KAYIT OL</h1>
            <p className="text-zinc-400 text-sm">Yeni hesap oluşturun</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-300">İsim Soyisim</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  id="username"
                  name="username"
                  data-testid="register-username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
                  placeholder="Ör: Ahmet Yılmaz"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-300">Telefon (K.ADI)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  id="phone"
                  name="phone"
                  data-testid="register-phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
                  placeholder="5XX XXX XX XX"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="depositAmount" className="text-zinc-300">Seçtiği Tutar (TL)</Label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  id="depositAmount"
                  name="depositAmount"
                  data-testid="register-deposit"
                  type="number"
                  value={formData.depositAmount}
                  onChange={handleChange}
                  className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
                  placeholder="1000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  id="password"
                  name="password"
                  data-testid="register-password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
                  placeholder="En az 6 karakter"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-300">Şifre Tekrar</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  data-testid="register-confirm-password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
                  placeholder="Şifreyi tekrar girin"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Güvenlik Sorusu</Label>
              <div className="flex items-center gap-3">
                <div className="bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 text-gold-500 font-mono font-bold">
                  {captcha.num1} + {captcha.num2} = ?
                </div>
                <Input
                  data-testid="register-captcha"
                  type="number"
                  value={captcha.answer}
                  onChange={(e) => setCaptcha({ ...captcha, answer: e.target.value })}
                  className="w-24 bg-zinc-900 border-zinc-800 text-white text-center font-mono"
                  placeholder="?"
                  required
                />
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-2 text-zinc-500 hover:text-gold-500 transition-colors"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>

            <Button
              type="submit"
              data-testid="register-submit-btn"
              disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-600 text-black font-chivo font-bold uppercase tracking-wider h-12 neon-gold"
            >
              {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-500 text-sm">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="text-gold-500 hover:text-gold-400 font-semibold">
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
