import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Save, MessageCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    iban_holder: '',
    bank_name: '',
    iban: '',
    whatsapp: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/settings`);
      setSettings(response.data);
    } catch (error) {
      toast.error('Ayarlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API}/admin/settings`, settings);
      toast.success('Ayarlar güncellendi');
    } catch (error) {
      toast.error('Ayarlar güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-settings">
      <div>
        <h1 className="font-chivo font-black text-3xl text-white mb-2">İletişim & Banka Ayarları</h1>
        <p className="text-zinc-400">IBAN ve iletişim bilgilerini yönetin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/70 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-gold-500" />
              IBAN Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-zinc-400">Yükleniyor...</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">IBAN SAHİBİ</Label>
                  <Input
                    data-testid="settings-iban-holder"
                    value={settings.iban_holder}
                    onChange={(e) => setSettings({ ...settings, iban_holder: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="Hesap sahibi adı"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">BANKA ADI</Label>
                  <Input
                    data-testid="settings-bank-name"
                    value={settings.bank_name}
                    onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="Banka adı"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">IBAN NUMARASI</Label>
                  <Input
                    data-testid="settings-iban"
                    value={settings.iban}
                    onChange={(e) => setSettings({ ...settings, iban: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white font-mono"
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                  />
                </div>
                
                <div className="pt-4 border-t border-zinc-800">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-green-500" />
                    WhatsApp İletişim
                  </h3>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">WHATSAPP NUMARASI (905xxxxxxxxx formatında)</Label>
                    <Input
                      data-testid="settings-whatsapp"
                      value={settings.whatsapp}
                      onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white font-mono"
                      placeholder="905550000000"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  data-testid="settings-save-btn"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Kaydediliyor...' : 'AYARLARI KAYDET'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/70 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Aktif Bilgiler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 p-4 bg-zinc-800/50 rounded-lg border border-dashed border-zinc-700">
              <div>
                <span className="text-zinc-400 text-sm">WhatsApp:</span>
                <p className="text-white font-mono">{settings.whatsapp || '-'}</p>
              </div>
              <div>
                <span className="text-zinc-400 text-sm">IBAN Sahibi:</span>
                <p className="text-white">{settings.iban_holder || '-'}</p>
              </div>
              <div>
                <span className="text-zinc-400 text-sm">Banka:</span>
                <p className="text-white">{settings.bank_name || '-'}</p>
              </div>
              <div>
                <span className="text-zinc-400 text-sm">IBAN:</span>
                <p className="text-gold-500 font-mono">{settings.iban || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
