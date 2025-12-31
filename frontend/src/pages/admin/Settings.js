import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Save, MessageCircle, Percent } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    iban_holder: '',
    bank_name: '',
    iban: '',
    whatsapp: '',
    western_union_fee: 7.5,
    masak_fee: 15,
    masak_bonus: 35
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/settings`);
      setSettings({
        iban_holder: response.data.iban_holder || '',
        bank_name: response.data.bank_name || '',
        iban: response.data.iban || '',
        whatsapp: response.data.whatsapp || '',
        western_union_fee: response.data.western_union_fee || 7.5,
        masak_fee: response.data.masak_fee || 15,
        masak_bonus: response.data.masak_bonus || 35
      });
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
        <h1 className="font-chivo font-black text-3xl text-slate-800 mb-2">İletişim & Banka Ayarları</h1>
        <p className="text-slate-500">IBAN, iletişim bilgileri ve vergi oranlarını yönetin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-purple-500" />
              IBAN Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-400">Yükleniyor...</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">IBAN SAHİBİ</Label>
                  <Input
                    data-testid="settings-iban-holder"
                    value={settings.iban_holder}
                    onChange={(e) => setSettings({ ...settings, iban_holder: e.target.value })}
                    className="bg-white border-slate-200 text-slate-800"
                    placeholder="Hesap sahibi adı"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">BANKA ADI</Label>
                  <Input
                    data-testid="settings-bank-name"
                    value={settings.bank_name}
                    onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                    className="bg-white border-slate-200 text-slate-800"
                    placeholder="Banka adı"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">IBAN NUMARASI</Label>
                  <Input
                    data-testid="settings-iban"
                    value={settings.iban}
                    onChange={(e) => setSettings({ ...settings, iban: e.target.value })}
                    className="bg-white border-slate-200 text-slate-800 font-mono"
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                  />
                </div>
                
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-green-500" />
                    WhatsApp İletişim
                  </h3>
                  <div className="space-y-2">
                    <Label className="text-slate-700">WHATSAPP NUMARASI (905xxxxxxxxx formatında)</Label>
                    <Input
                      data-testid="settings-whatsapp"
                      value={settings.whatsapp}
                      onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                      className="bg-white border-slate-200 text-slate-800 font-mono"
                      placeholder="905550000000"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  data-testid="settings-save-btn"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white font-bold"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Kaydediliyor...' : 'AYARLARI KAYDET'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Fee Settings */}
          <Card className="bg-white/80 backdrop-blur border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center gap-2">
                <Percent className="h-5 w-5 text-blue-500" />
                Vergi/Komisyon Oranları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Western Union Komisyonu (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.western_union_fee}
                  onChange={(e) => setSettings({ ...settings, western_union_fee: parseFloat(e.target.value) || 0 })}
                  className="bg-white border-slate-200 text-slate-800 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">MASAK Vergi Oranı (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.masak_fee}
                  onChange={(e) => setSettings({ ...settings, masak_fee: parseFloat(e.target.value) || 0 })}
                  className="bg-white border-slate-200 text-slate-800 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">MASAK Bonus Oranı (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.masak_bonus}
                  onChange={(e) => setSettings({ ...settings, masak_bonus: parseFloat(e.target.value) || 0 })}
                  className="bg-white border-slate-200 text-slate-800 font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Current Settings Preview */}
          <Card className="bg-white/80 backdrop-blur border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-800">Aktif Bilgiler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <div>
                  <span className="text-slate-500 text-sm">WhatsApp:</span>
                  <p className="text-slate-800 font-mono">{settings.whatsapp || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">IBAN Sahibi:</span>
                  <p className="text-slate-800">{settings.iban_holder || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">Banka:</span>
                  <p className="text-slate-800">{settings.bank_name || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">IBAN:</span>
                  <p className="text-purple-600 font-mono">{settings.iban || '-'}</p>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <span className="text-slate-500 text-sm">Western Union: </span>
                  <span className="text-blue-600 font-bold">%{settings.western_union_fee}</span>
                  <span className="text-slate-500 text-sm ml-4">MASAK: </span>
                  <span className="text-purple-600 font-bold">%{settings.masak_fee}</span>
                  <span className="text-slate-500 text-sm ml-4">Bonus: </span>
                  <span className="text-green-600 font-bold">%{settings.masak_bonus}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
