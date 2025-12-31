<?php
require_once '../config.php';
requireAdmin();

$settings = getSettings($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fields = ['iban_holder', 'bank_name', 'iban', 'whatsapp', 'western_fee', 'masak_fee', 'masak_bonus'];
    
    foreach ($fields as $field) {
        $value = sanitize($_POST[$field] ?? '');
        $stmt = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
        $stmt->execute([$field, $value, $value]);
    }
    
    alert('Ayarlar kaydedildi!', 'success');
    redirect('settings.php');
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ayarlar - Admin Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', sans-serif; } .gradient-bg { background: linear-gradient(135deg, #e0f2fe 0%, #f0e6ff 50%, #ecfdf5 100%); } .glass { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); }</style>
</head>
<body class="gradient-bg min-h-screen">
    <div class="flex">
        <!-- Sidebar -->
        <aside class="w-64 bg-white/90 backdrop-blur min-h-screen border-r border-slate-200 fixed">
            <div class="p-6 border-b border-slate-200">
                <h1 class="text-xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">YÖNETİCİ</h1>
            </div>
            <nav class="p-4 space-y-1">
                <a href="index.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">📊 Dashboard</a>
                <a href="coupons.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">🎟️ Kupon Market</a>
                <a href="users.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">👥 Kullanıcılar</a>
                <a href="deposits.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">💰 Para Yatırma</a>
                <a href="western.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">🌐 Western Union</a>
                <a href="masak.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">🛡️ MASAK</a>
                <a href="settings.php" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold">⚙️ Ayarlar</a>
            </nav>
            <div class="absolute bottom-0 w-full p-4 border-t border-slate-200">
                <a href="../logout.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50">🚪 Çıkış Yap</a>
            </div>
        </aside>
        
        <main class="flex-1 ml-64 p-8">
            <?php showAlert(); ?>
            
            <h2 class="text-3xl font-black text-slate-800 mb-2">⚙️ Ayarlar</h2>
            <p class="text-slate-500 mb-8">Sistem ayarlarını yönetin</p>
            
            <form method="POST" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- IBAN Ayarları -->
                <div class="glass rounded-2xl p-6 shadow-lg">
                    <h3 class="font-bold text-slate-800 mb-4">💳 IBAN Bilgileri</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-slate-700 text-sm font-medium mb-2">IBAN Sahibi</label>
                            <input type="text" name="iban_holder" value="<?= sanitize($settings['iban_holder'] ?? '') ?>"
                                   class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500">
                        </div>
                        <div>
                            <label class="block text-slate-700 text-sm font-medium mb-2">Banka Adı</label>
                            <input type="text" name="bank_name" value="<?= sanitize($settings['bank_name'] ?? '') ?>"
                                   class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500">
                        </div>
                        <div>
                            <label class="block text-slate-700 text-sm font-medium mb-2">IBAN Numarası</label>
                            <input type="text" name="iban" value="<?= sanitize($settings['iban'] ?? '') ?>"
                                   class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 font-mono">
                        </div>
                        <div>
                            <label class="block text-slate-700 text-sm font-medium mb-2">WhatsApp (905xxxxxxxxx)</label>
                            <input type="text" name="whatsapp" value="<?= sanitize($settings['whatsapp'] ?? '') ?>"
                                   class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 font-mono">
                        </div>
                    </div>
                </div>
                
                <!-- Vergi Oranları -->
                <div class="glass rounded-2xl p-6 shadow-lg">
                    <h3 class="font-bold text-slate-800 mb-4">📊 Vergi/Komisyon Oranları</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-slate-700 text-sm font-medium mb-2">Western Union Komisyonu (%)</label>
                            <input type="number" step="0.1" name="western_fee" value="<?= sanitize($settings['western_fee'] ?? '7.5') ?>"
                                   class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 font-mono">
                        </div>
                        <div>
                            <label class="block text-slate-700 text-sm font-medium mb-2">MASAK Vergi Oranı (%)</label>
                            <input type="number" step="0.1" name="masak_fee" value="<?= sanitize($settings['masak_fee'] ?? '15') ?>"
                                   class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 font-mono">
                        </div>
                        <div>
                            <label class="block text-slate-700 text-sm font-medium mb-2">MASAK Bonus Oranı (%)</label>
                            <input type="number" step="0.1" name="masak_bonus" value="<?= sanitize($settings['masak_bonus'] ?? '35') ?>"
                                   class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 font-mono">
                        </div>
                    </div>
                </div>
                
                <div class="lg:col-span-2">
                    <button type="submit" class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold hover:opacity-90 transition shadow-lg">
                        💾 AYARLARI KAYDET
                    </button>
                </div>
            </form>
        </main>
    </div>
</body>
</html>
