<?php
require_once '../config.php';
requireLogin();

$user_id = $_SESSION['user_id'];

// Kullanıcı bilgilerini al
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch();

// Satın alınan kuponlar
$stmt = $pdo->prepare("SELECT uc.*, c.name, c.consultant_name, c.total_odds, c.max_win, c.status as coupon_status
                       FROM user_coupons uc
                       JOIN coupons c ON uc.coupon_id = c.id
                       WHERE uc.user_id = ?
                       ORDER BY uc.purchased_at DESC");
$stmt->execute([$user_id]);
$my_coupons = $stmt->fetchAll();

$settings = getSettings($pdo);
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panelim - <?= SITE_NAME ?></title>
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
                <a href="index.php" class="text-purple-600 font-semibold">Dashboard</a>
                <a href="deposit.php" class="text-slate-600 hover:text-purple-600">Para Yatır</a>
                <a href="my_coupons.php" class="text-slate-600 hover:text-purple-600">Kuponlarım</a>
                <a href="withdraw.php" class="text-slate-600 hover:text-purple-600">Para Çek</a>
                <a href="../index.php" class="text-slate-600 hover:text-purple-600">Market</a>
                <a href="../logout.php" class="text-red-500 font-semibold">Çıkış</a>
            </nav>
        </div>
    </header>
    
    <main class="max-w-7xl mx-auto px-4 py-8">
        <?php showAlert(); ?>
        
        <!-- Hero Card -->
        <div class="glass rounded-2xl p-8 mb-8 shadow-xl bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500 text-white">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <p class="text-purple-100 mb-2">Hoş geldiniz,</p>
                    <h2 class="text-3xl font-black mb-4"><?= sanitize($user['username']) ?></h2>
                    <p class="text-purple-100">Mevcut Bakiye:</p>
                    <p class="text-4xl font-black font-mono"><?= formatMoney($user['balance']) ?></p>
                </div>
                <div class="flex flex-col gap-3">
                    <a href="deposit.php" class="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold text-center hover:bg-slate-100">
                        💰 Para Yatır
                    </a>
                    <a href="../index.php" class="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-center hover:opacity-90">
                        🎯 Kupon Satın Al
                    </a>
                    <?php if ($user['balance'] > 0): ?>
                        <a href="withdraw.php" class="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold text-center hover:opacity-90">
                            💸 Para Çek
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        
        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="glass rounded-xl p-6 shadow-lg">
                <p class="text-slate-500 text-sm mb-1">Toplam Kupon</p>
                <p class="text-3xl font-black text-purple-600"><?= count($my_coupons) ?></p>
            </div>
            <div class="glass rounded-xl p-6 shadow-lg">
                <p class="text-slate-500 text-sm mb-1">Bakiye</p>
                <p class="text-3xl font-black text-green-600"><?= formatMoney($user['balance']) ?></p>
            </div>
            <div class="glass rounded-xl p-6 shadow-lg">
                <p class="text-slate-500 text-sm mb-1">Hesap Durumu</p>
                <p class="text-xl font-bold text-<?= $user['status'] === 'active' ? 'green' : 'amber' ?>-600">
                    <?= $user['status'] === 'active' ? '✓ Aktif' : '⏳ Beklemede' ?>
                </p>
            </div>
        </div>
        
        <!-- Son Kuponlar -->
        <div class="glass rounded-2xl p-6 shadow-xl">
            <h3 class="text-xl font-bold text-slate-800 mb-4">Son Kuponlarım</h3>
            <?php if (empty($my_coupons)): ?>
                <div class="text-center py-8">
                    <p class="text-slate-500 mb-4">Henüz kupon satın almadınız.</p>
                    <a href="../index.php" class="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-xl font-bold inline-block">
                        Kupon Markete Git
                    </a>
                </div>
            <?php else: ?>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-slate-200">
                                <th class="text-left py-3 px-4 text-slate-500 font-medium">Kupon</th>
                                <th class="text-left py-3 px-4 text-slate-500 font-medium">Oran</th>
                                <th class="text-left py-3 px-4 text-slate-500 font-medium">Kazanç</th>
                                <th class="text-left py-3 px-4 text-slate-500 font-medium">Durum</th>
                                <th class="text-left py-3 px-4 text-slate-500 font-medium">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach (array_slice($my_coupons, 0, 5) as $coupon): ?>
                                <tr class="border-b border-slate-100">
                                    <td class="py-3 px-4">
                                        <p class="font-bold text-slate-800"><?= sanitize($coupon['name']) ?></p>
                                        <p class="text-slate-500 text-sm"><?= sanitize($coupon['consultant_name']) ?></p>
                                    </td>
                                    <td class="py-3 px-4 font-mono text-purple-600 font-bold"><?= number_format($coupon['total_odds'], 2) ?></td>
                                    <td class="py-3 px-4 font-mono text-green-600 font-bold"><?= formatMoney($coupon['max_win']) ?></td>
                                    <td class="py-3 px-4">
                                        <?php if ($coupon['revealed']): ?>
                                            <?php if ($coupon['coupon_status'] === 'kazandi'): ?>
                                                <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">KAZANDI</span>
                                            <?php elseif ($coupon['coupon_status'] === 'kaybetti'): ?>
                                                <span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">KAYBETTİ</span>
                                            <?php else: ?>
                                                <span class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold">BEKLEMEDE</span>
                                            <?php endif; ?>
                                        <?php else: ?>
                                            <span class="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-bold">⏳ MAÇLAR DEVAM</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="py-3 px-4">
                                        <a href="view_coupon.php?id=<?= $coupon['id'] ?>" class="text-purple-600 font-semibold hover:text-purple-500">Detay</a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <?php if (count($my_coupons) > 5): ?>
                    <div class="text-center mt-4">
                        <a href="my_coupons.php" class="text-purple-600 font-semibold">Tüm kuponları gör →</a>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
        </div>
    </main>
</body>
</html>
