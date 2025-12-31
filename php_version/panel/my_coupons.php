<?php
require_once '../config.php';
requireLogin();

$user_id = $_SESSION['user_id'];

// Satın alınan kuponlar
$stmt = $pdo->prepare("SELECT uc.*, c.name, c.consultant_name, c.total_odds, c.max_win, c.status as coupon_status
                       FROM user_coupons uc
                       JOIN coupons c ON uc.coupon_id = c.id
                       WHERE uc.user_id = ?
                       ORDER BY uc.purchased_at DESC");
$stmt->execute([$user_id]);
$my_coupons = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kuponlarım - <?= SITE_NAME ?></title>
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
            <h1 class="text-xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                <?= SITE_NAME ?>
            </h1>
            <nav class="flex items-center gap-4">
                <a href="index.php" class="text-slate-600 hover:text-purple-600">Dashboard</a>
                <a href="deposit.php" class="text-slate-600 hover:text-purple-600">Para Yatır</a>
                <a href="my_coupons.php" class="text-purple-600 font-semibold">Kuponlarım</a>
                <a href="withdraw.php" class="text-slate-600 hover:text-purple-600">Para Çek</a>
                <a href="../logout.php" class="text-red-500 font-semibold">Çıkış</a>
            </nav>
        </div>
    </header>
    
    <main class="max-w-7xl mx-auto px-4 py-8">
        <?php showAlert(); ?>
        
        <div class="text-center mb-8">
            <h2 class="text-3xl font-black text-slate-800 mb-2">🎟️ KUPONLARIM</h2>
            <p class="text-slate-500">Satın aldığınız kuponlar</p>
        </div>
        
        <?php if (empty($my_coupons)): ?>
            <div class="glass rounded-2xl p-12 text-center shadow-lg">
                <p class="text-slate-500 text-lg mb-6">Henüz kupon satın almadınız.</p>
                <a href="../index.php" class="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-8 py-4 rounded-xl font-bold inline-block hover:opacity-90">
                    🎯 Kupon Markete Git
                </a>
            </div>
        <?php else: ?>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <?php foreach ($my_coupons as $coupon): ?>
                    <div class="glass rounded-2xl overflow-hidden shadow-xl">
                        <div class="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-4">
                            <h3 class="font-black"><?= sanitize($coupon['name']) ?></h3>
                            <p class="text-purple-200 text-sm"><?= sanitize($coupon['consultant_name']) ?></p>
                        </div>
                        <div class="p-5">
                            <div class="flex justify-between mb-4">
                                <div>
                                    <p class="text-slate-500 text-sm">Toplam Oran</p>
                                    <p class="text-xl font-black text-purple-600"><?= number_format($coupon['total_odds'], 2) ?></p>
                                </div>
                                <div class="text-right">
                                    <p class="text-slate-500 text-sm">Tahmini Kazanç</p>
                                    <p class="text-xl font-black text-green-600"><?= formatMoney($coupon['max_win']) ?></p>
                                </div>
                            </div>
                            
                            <div class="mb-4">
                                <?php if ($coupon['revealed']): ?>
                                    <?php if ($coupon['coupon_status'] === 'kazandi'): ?>
                                        <div class="bg-green-100 text-green-700 py-3 rounded-xl text-center font-black text-lg">
                                            ✓ KAZANDI
                                        </div>
                                    <?php elseif ($coupon['coupon_status'] === 'kaybetti'): ?>
                                        <div class="bg-red-100 text-red-700 py-3 rounded-xl text-center font-black text-lg">
                                            ✗ KAYBETTİ
                                        </div>
                                    <?php else: ?>
                                        <div class="bg-amber-100 text-amber-700 py-3 rounded-xl text-center font-bold">
                                            ⏳ BEKLEMEDE
                                        </div>
                                    <?php endif; ?>
                                <?php else: ?>
                                    <div class="bg-slate-100 text-slate-600 py-3 rounded-xl text-center font-bold">
                                        ⏳ MAÇLAR DEVAM EDİYOR
                                    </div>
                                <?php endif; ?>
                            </div>
                            
                            <a href="view_coupon.php?id=<?= $coupon['id'] ?>" 
                               class="block w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-3 rounded-xl font-bold text-center hover:opacity-90">
                                DETAYI GÖR
                            </a>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </main>
</body>
</html>
