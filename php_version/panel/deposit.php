<?php
require_once '../config.php';
requireLogin();

$user_id = $_SESSION['user_id'];
$settings = getSettings($pdo);

// Kullanıcı bilgilerini al
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch();

// Bekleyen yatırma talebi var mı?
$stmt = $pdo->prepare("SELECT * FROM deposits WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1");
$stmt->execute([$user_id]);
$pending_deposit = $stmt->fetch();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $amount = floatval($_POST['amount'] ?? 0);
    
    if ($amount < 500) {
        alert('Minimum yatırım tutarı 500 TL\'dir!', 'error');
    } else {
        $stmt = $pdo->prepare("INSERT INTO deposits (user_id, amount, status) VALUES (?, ?, 'pending')");
        $stmt->execute([$user_id, $amount]);
        
        alert('Para yatırma talebiniz oluşturuldu. Lütfen WhatsApp üzerinden dekont gönderin.', 'success');
        redirect('deposit.php');
    }
}

$presetAmounts = [500, 1000, 2000, 3000, 5000];
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Para Yatır - <?= SITE_NAME ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #e0f2fe 0%, #f0e6ff 50%, #ecfdf5 100%); }
        .glass { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); }
    </style>
</head>
<body class="gradient-bg min-h-screen">
    <!-- Header -->
    <header class="glass border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 class="text-xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                <?= SITE_NAME ?>
            </h1>
            <nav class="flex items-center gap-4">
                <a href="index.php" class="text-slate-600 hover:text-purple-600">Dashboard</a>
                <a href="deposit.php" class="text-purple-600 font-semibold">Para Yatır</a>
                <a href="my_coupons.php" class="text-slate-600 hover:text-purple-600">Kuponlarım</a>
                <a href="withdraw.php" class="text-slate-600 hover:text-purple-600">Para Çek</a>
                <a href="../logout.php" class="text-red-500 font-semibold">Çıkış</a>
            </nav>
        </div>
    </header>
    
    <main class="max-w-2xl mx-auto px-4 py-8">
        <?php showAlert(); ?>
        
        <div class="text-center mb-8">
            <h2 class="text-3xl font-black text-slate-800 mb-2">💰 PARA YATIR</h2>
            <p class="text-slate-500">Bakiyenize para ekleyin</p>
        </div>
        
        <!-- Mevcut Bakiye -->
        <div class="glass rounded-2xl p-6 mb-6 shadow-lg text-center">
            <p class="text-slate-500 mb-1">Mevcut Bakiyeniz</p>
            <p class="text-4xl font-black text-purple-600 font-mono"><?= formatMoney($user['balance']) ?></p>
        </div>
        
        <?php if ($pending_deposit): ?>
            <!-- Bekleyen Talep Var -->
            <div class="glass rounded-2xl p-6 shadow-xl border-l-4 border-amber-500">
                <h3 class="text-lg font-bold text-amber-600 mb-4">⏳ Bekleyen Yatırma Talebiniz Var</h3>
                <div class="mb-4">
                    <p class="text-slate-600">Tutar: <span class="font-bold text-purple-600"><?= formatMoney($pending_deposit['amount']) ?></span></p>
                    <p class="text-slate-500 text-sm">Tarih: <?= date('d.m.Y H:i', strtotime($pending_deposit['created_at'])) ?></p>
                </div>
                
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4 border border-blue-100">
                    <p class="text-sm font-semibold text-blue-700 mb-2">💳 ÖDEME YAPILACAK HESAP</p>
                    <p class="font-bold text-slate-800"><?= $settings['iban_holder'] ?? '' ?></p>
                    <p class="text-slate-600 text-sm"><?= $settings['bank_name'] ?? '' ?></p>
                    <p class="font-mono text-purple-700 font-bold"><?= $settings['iban'] ?? '' ?></p>
                </div>
                
                <a href="https://wa.me/<?= $settings['whatsapp'] ?? '' ?>?text=<?= urlencode('Merhaba, ' . formatMoney($pending_deposit['amount']) . ' tutarında para yatırdım. Dekont göndermek istiyorum. Kullanıcı: ' . $user['username']) ?>" 
                   target="_blank"
                   class="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-center hover:opacity-90 transition">
                    📱 WhatsApp'tan Dekont Gönder
                </a>
            </div>
        <?php else: ?>
            <!-- Yeni Talep Formu -->
            <div class="glass rounded-2xl p-6 shadow-xl">
                <form method="POST" class="space-y-6">
                    <div>
                        <label class="block text-slate-700 text-sm font-medium mb-3">Yatırım Tutarı Seçin</label>
                        <div class="grid grid-cols-5 gap-2 mb-3">
                            <?php foreach ($presetAmounts as $amount): ?>
                                <button type="button" onclick="selectAmount(<?= $amount ?>)"
                                        class="amount-btn py-3 rounded-xl font-bold border-2 border-purple-200 text-purple-600 hover:border-purple-400 transition"
                                        data-amount="<?= $amount ?>">
                                    <?= number_format($amount, 0, '', '.') ?>
                                </button>
                            <?php endforeach; ?>
                        </div>
                        <input type="number" name="amount" id="amount" required min="500"
                               class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500"
                               placeholder="Veya elle girin (min 500 TL)">
                    </div>
                    
                    <!-- Ödeme Bilgileri -->
                    <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                        <p class="text-sm font-semibold text-blue-700 mb-2">💳 ÖDEME YAPILACAK HESAP</p>
                        <p class="font-bold text-slate-800"><?= $settings['iban_holder'] ?? '' ?></p>
                        <p class="text-slate-600 text-sm"><?= $settings['bank_name'] ?? '' ?></p>
                        <p class="font-mono text-purple-700 font-bold"><?= $settings['iban'] ?? '' ?></p>
                    </div>
                    
                    <button type="submit" 
                            class="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition shadow-lg">
                        PARA YATIRMA TALEBİ OLUŞTUR
                    </button>
                </form>
            </div>
        <?php endif; ?>
    </main>
    
    <script>
        function selectAmount(amount) {
            document.getElementById('amount').value = amount;
            document.querySelectorAll('.amount-btn').forEach(btn => {
                if (parseInt(btn.dataset.amount) === amount) {
                    btn.classList.remove('border-purple-200', 'text-purple-600');
                    btn.classList.add('bg-gradient-to-r', 'from-purple-500', 'to-violet-600', 'text-white', 'border-transparent');
                } else {
                    btn.classList.add('border-purple-200', 'text-purple-600');
                    btn.classList.remove('bg-gradient-to-r', 'from-purple-500', 'to-violet-600', 'text-white', 'border-transparent');
                }
            });
        }
    </script>
</body>
</html>
