<?php
require_once '../config.php';
requireLogin();

$uc_id = intval($_GET['id'] ?? 0);
$user_id = $_SESSION['user_id'];

// Kullanıcının kuponu
$stmt = $pdo->prepare("SELECT uc.*, c.*, c.status as coupon_status
                       FROM user_coupons uc
                       JOIN coupons c ON uc.coupon_id = c.id
                       WHERE uc.id = ? AND uc.user_id = ?");
$stmt->execute([$uc_id, $user_id]);
$user_coupon = $stmt->fetch();

if (!$user_coupon) {
    alert('Kupon bulunamadı!', 'error');
    redirect('my_coupons.php');
}

// Kupon maçları
$stmt = $pdo->prepare("SELECT * FROM coupon_matches WHERE coupon_id = ?");
$stmt->execute([$user_coupon['coupon_id']]);
$matches = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kupon Detay - <?= SITE_NAME ?></title>
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
                <a href="my_coupons.php" class="text-purple-600 font-semibold">← Kuponlarım</a>
                <a href="../logout.php" class="text-red-500 font-semibold">Çıkış</a>
            </nav>
        </div>
    </header>
    
    <main class="max-w-2xl mx-auto px-4 py-8">
        <!-- Kupon Kartı -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-2xl">
            <!-- Header -->
            <div class="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-6 text-center">
                <h2 class="text-2xl font-black tracking-wider">BETLIVE</h2>
                <p class="text-purple-200"><?= sanitize($user_coupon['consultant_name']) ?> BAHİS DANIŞMANI</p>
            </div>
            
            <!-- Maçlar -->
            <div class="p-6">
                <h3 class="font-bold text-slate-800 mb-4">MAÇ DETAYLARI</h3>
                
                <div class="space-y-4">
                    <?php foreach ($matches as $match): ?>
                        <div class="border-l-4 border-purple-500 pl-4 py-2 bg-slate-50 rounded-r-lg">
                            <div class="flex justify-between items-center">
                                <div class="flex-1">
                                    <p class="font-bold text-slate-800"><?= sanitize($match['teams']) ?></p>
                                    <p class="text-slate-500 text-sm">Tahmin: <?= sanitize($match['prediction']) ?></p>
                                    <?php if ($user_coupon['revealed']): ?>
                                        <p class="text-slate-500 text-sm">Oran: <span class="font-bold text-purple-600"><?= number_format($match['odds'], 2) ?></span></p>
                                    <?php endif; ?>
                                </div>
                                <div class="flex items-center gap-3">
                                    <?php if ($user_coupon['revealed']): ?>
                                        <div class="text-right">
                                            <p class="text-slate-400 text-sm">Sonuç:</p>
                                            <p class="font-bold text-slate-800"><?= sanitize($match['result'] ?: '-') ?></p>
                                        </div>
                                        <?php if ($match['is_correct']): ?>
                                            <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">✓</div>
                                        <?php else: ?>
                                            <div class="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">✗</div>
                                        <?php endif; ?>
                                    <?php else: ?>
                                        <div class="text-amber-500 text-sm font-medium">⏳ Bekleniyor</div>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                
                <!-- Özet -->
                <div class="border-t border-dashed border-slate-200 my-6 pt-6">
                    <?php if ($user_coupon['revealed']): ?>
                        <div class="space-y-2 mb-4">
                            <div class="flex justify-between">
                                <span class="text-slate-500">Toplam Oran:</span>
                                <span class="font-mono font-bold text-purple-600"><?= number_format($user_coupon['total_odds'], 4) ?></span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-500">Yatırılan:</span>
                                <span class="font-mono font-bold"><?= formatMoney($user_coupon['purchase_price']) ?></span>
                            </div>
                            <div class="flex justify-between text-lg">
                                <span class="font-bold">MAKSİMUM KAZANÇ:</span>
                                <span class="font-mono font-bold text-green-600"><?= formatMoney($user_coupon['max_win']) ?></span>
                            </div>
                        </div>
                        
                        <!-- Durum -->
                        <?php if ($user_coupon['coupon_status'] === 'kazandi'): ?>
                            <div class="bg-gradient-to-r from-green-400 to-emerald-500 text-white py-4 rounded-xl text-center font-black text-xl tracking-wider">
                                ✓ KAZANDI
                            </div>
                        <?php elseif ($user_coupon['coupon_status'] === 'kaybetti'): ?>
                            <div class="bg-gradient-to-r from-red-400 to-red-500 text-white py-4 rounded-xl text-center font-black text-xl tracking-wider">
                                ✗ KAYBETTİ
                            </div>
                        <?php else: ?>
                            <div class="bg-gradient-to-r from-amber-400 to-orange-500 text-white py-4 rounded-xl text-center font-black text-xl tracking-wider">
                                ⏳ BEKLEMEDE
                            </div>
                        <?php endif; ?>
                    <?php else: ?>
                        <div class="text-center py-8">
                            <div class="text-6xl mb-4">⏳</div>
                            <h3 class="font-bold text-xl text-slate-800 mb-2">Sonuçlar Bekleniyor</h3>
                            <p class="text-slate-500">Maçlarınız devam ediyor. Maçlar bittiğinde sonuçlar burada görünecektir.</p>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        
        <div class="text-center mt-6">
            <a href="my_coupons.php" class="text-purple-600 font-semibold">← Kuponlarıma Dön</a>
        </div>
    </main>
</body>
</html>
