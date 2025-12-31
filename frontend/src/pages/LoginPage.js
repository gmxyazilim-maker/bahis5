import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Lock, User, RefreshCw } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1, num2, answer: '' });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (parseInt(captcha.answer) !== captcha.num1 + captcha.num2) {
      toast.error('Güvenlik sorusu yanlış!');
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const userData = await login(username, password);
      toast.success('Giriş başarılı!');
      navigate(userData.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Giriş başarısız');
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
            <h1 className="font-chivo font-black text-3xl text-white mb-2">GİRİŞ YAP</h1>
            <p className="text-zinc-400 text-sm">Hesabınıza giriş yapın</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-300">Kullanıcı Adı</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  id="username"
                  data-testid="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-gold-500 focus:border-gold-500"
                  placeholder="Kullanıcı adınızı girin"
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
                  data-testid="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-gold-500 focus:border-gold-500"
                  placeholder="Şifrenizi girin"
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
                  data-testid="login-captcha"
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
              data-testid="login-submit-btn"
              disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-600 text-black font-chivo font-bold uppercase tracking-wider h-12 neon-gold"
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-500 text-sm">
              Hesabınız yok mu?{' '}
              <Link to="/register" className="text-gold-500 hover:text-gold-400 font-semibold">
                Kayıt Ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
