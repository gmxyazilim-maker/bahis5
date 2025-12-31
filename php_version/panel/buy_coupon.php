<?php
require_once '../config.php';
requireLogin();

$coupon_id = intval($_GET['id'] ?? 0);
$user_id = $_SESSION['user_id'];
$settings = getSettings($pdo);

// Kullanıcı bilgisi
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch();

// Kupon bilgisi
$stmt = $pdo->prepare("SELECT * FROM coupons WHERE id = ? AND is_market = 1 AND status = 'satilik'");
$stmt->execute([$coupon_id]);
$coupon = $stmt->fetch();

if (!$coupon) {
    alert('Kupon bulunamadı!', 'error');
    redirect('../index.php');
}

// Kupon maçları
$stmt = $pdo->prepare("SELECT * FROM coupon_matches WHERE coupon_id = ?");
$stmt->execute([$coupon_id]);
$matches = $stmt->fetchAll();

// Zaten satın alınmış mı?
$stmt = $pdo->prepare("SELECT id FROM user_coupons WHERE user_id = ? AND coupon_id = ?");
$stmt->execute([$user_id, $coupon_id]);
$already_purchased = $stmt->fetch();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$already_purchased) {
    if ($user['balance'] < $coupon['price']) {
        alert('Yetersiz bakiye! Lütfen önce para yatırın.', 'error');
    } else {
        // Bakiyeden düş
        $stmt = $pdo->prepare("UPDATE users SET balance = balance - ? WHERE id = ?");
        $stmt->execute([$coupon['price'], $user_id]);
        
        // Kuponu kullanıcıya ekle
        $stmt = $pdo->prepare("INSERT INTO user_coupons (user_id, coupon_id, purchase_price, revealed) VALUES (?, ?, ?, 0)");
        $stmt->execute([$user_id, $coupon_id, $coupon['price']]);
        
        alert('Kupon başarıyla satın alındı!', 'success');
        redirect('my_coupons.php');
    }
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kupon Satın Al - <?= SITE_NAME ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #e0f2fe 0%, #f0e6ff 50%, #ecfdf5 100%); }
        .glass { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); }
    </style>
</head>
<body class="gradient-bg min-h-screen">
    <header class="glass border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="index.php" class="text-xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                <?= SITE_NAME ?>
            </a>
            <nav class="flex items-center gap-4">
                <a href="index.php" class="text-slate-600 hover:text-purple-600">Dashboard</a>
                <a href="../index.php" class="text-slate-600 hover:text-purple-600">Market</a>
                <a href="../logout.php" class="text-red-500 font-semibold">Çıkış</a>
            </nav>
        </div>
    </header>
    
    <main class="max-w-2xl mx-auto px-4 py-8">
        <?php showAlert(); ?>
        
        <!-- Kupon Detay -->
        <div class="glass rounded-2xl overflow-hidden shadow-2xl">
            <!-- Header -->
            <div class="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-6">
                <h2 class="text-2xl font-black"><?= sanitize($coupon['name']) ?></h2>
                <p class="text-purple-200"><?= sanitize($coupon['consultant_name']) ?></p>
            </div>
            
            <!-- Maçlar -->
            <div class="p-6">
                <h3 class="font-bold text-slate-800 mb-4">📋 MAÇLAR</h3>
                <div class="space-y-3">
                    <?php foreach ($matches as $match): ?>
                        <div class="bg-slate-50 rounded-xl p-4 border-l-4 border-purple-500">
                            <div class="flex justify-between items-center">
                                <div>
                                    <p class="font-bold text-slate-800"><?= sanitize($match['teams']) ?></p>
                                    <p class="text-slate-500 text-sm"><?= sanitize($match['prediction']) ?></p>
                                </div>
                                <div class="text-right">
                                    <p class="text-purple-600 font-mono font-bold"><?= number_format($match['odds'], 2) ?></p>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                
                <!-- Özet -->
                <div class="mt-6 pt-6 border-t border-slate-200 space-y-3">
                    <div class="flex justify-between">
                        <span class="text-slate-500">Toplam Oran:</span>
                        <span class="font-bold text-purple-600 font-mono"><?= number_format($coupon['total_odds'], 2) ?></span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-500">Tahmini Kazanç:</span>
                        <span class="font-bold text-green-600"><?= formatMoney($coupon['max_win']) ?></span>
                    </div>
                    <div class="flex justify-between text-lg">
                        <span class="text-slate-700 font-semibold">Kupon Fiyatı:</span>
                        <span class="font-black text-slate-800"><?= formatMoney($coupon['price']) ?></span>
                    </div>
                </div>
                
                <!-- Bakiye Bilgisi -->
                <div class="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                    <div class="flex justify-between items-center">
                        <span class="text-slate-600">Mevcut Bakiyeniz:</span>
                        <span class="font-bold text-<?= $user['balance'] >= $coupon['price'] ? 'green' : 'red' ?>-600 font-mono">
                            <?= formatMoney($user['balance']) ?>
                        </span>
                    </div>
                </div>
                
                <!-- İşlem Butonları -->
                <div class="mt-6">
                    <?php if ($already_purchased): ?>
                        <div class="bg-green-100 text-green-700 py-4 rounded-xl text-center font-bold">
                            ✓ Bu kuponu zaten satın aldınız
                        </div>
                        <a href="my_coupons.php" class="block mt-3 text-center text-purple-600 font-semibold">
                            Kuponlarıma Git →
                        </a>
                    <?php elseif ($user['balance'] < $coupon['price']): ?>
                        <div class="bg-red-100 text-red-700 py-4 rounded-xl text-center font-bold mb-3">
                            ❌ Yetersiz bakiye
                        </div>
                        <a href="deposit.php" 
                           class="block w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-4 rounded-xl font-bold text-center hover:opacity-90 transition">
                            💰 Para Yatır
                        </a>
                    <?php else: ?>
                        <form method="POST">
                            <button type="submit" 
                                    class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold hover:opacity-90 transition shadow-lg">
                                ✓ SATIN AL - <?= formatMoney($coupon['price']) ?>
                            </button>
                        </form>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        
        <div class="text-center mt-6">
            <a href="../index.php" class="text-purple-600 font-semibold">← Markete Dön</a>
        </div>
    </main>
</body>
</html>
