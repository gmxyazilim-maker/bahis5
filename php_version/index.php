<?php
require_once 'config.php';

// Kupon marketi - giriş yapmadan da görülebilir
$stmt = $pdo->query("SELECT c.*, COUNT(cm.id) as match_count 
                     FROM coupons c 
                     LEFT JOIN coupon_matches cm ON c.id = cm.coupon_id 
                     WHERE c.is_market = 1 AND c.status = 'satilik'
                     GROUP BY c.id
                     ORDER BY c.created_at DESC");
$coupons = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kupon Market - <?= SITE_NAME ?></title>
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
            <h1 class="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                <?= SITE_NAME ?>
            </h1>
            <div class="flex items-center gap-4">
                <?php if (isLoggedIn()): ?>
                    <a href="panel/index.php" class="text-purple-600 font-semibold hover:text-purple-500">Panelim</a>
                    <a href="logout.php" class="text-red-500 font-semibold hover:text-red-400">Çıkış</a>
                <?php else: ?>
                    <a href="login.php" class="text-purple-600 font-semibold hover:text-purple-500">Giriş Yap</a>
                    <a href="register.php" class="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-4 py-2 rounded-xl font-bold hover:opacity-90">
                        Kayıt Ol
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </header>
    
    <!-- Hero Section -->
    <section class="py-16 px-4">
        <div class="max-w-4xl mx-auto text-center">
            <h2 class="text-4xl md:text-5xl font-black text-slate-800 mb-4">
                🎯 KUPON MARKETİ
            </h2>
            <p class="text-xl text-slate-600 mb-8">
                Profesyonel danışmanlardan hazır kuponlar. Seç, satın al, kazan!
            </p>
        </div>
    </section>
    
    <!-- Kupon Grid -->
    <section class="max-w-7xl mx-auto px-4 pb-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <?php foreach ($coupons as $coupon): ?>
                <div class="glass rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
                    <!-- Kupon Header -->
                    <div class="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-4">
                        <h3 class="font-black text-lg"><?= sanitize($coupon['name']) ?></h3>
                        <p class="text-purple-200 text-sm"><?= sanitize($coupon['consultant_name']) ?></p>
                    </div>
                    
                    <!-- Kupon Body -->
                    <div class="p-5">
                        <div class="flex justify-between items-center mb-4">
                            <div>
                                <p class="text-slate-500 text-sm">Toplam Oran</p>
                                <p class="text-2xl font-black text-purple-600"><?= number_format($coupon['total_odds'], 2) ?></p>
                            </div>
                            <div class="text-right">
                                <p class="text-slate-500 text-sm">Maç Sayısı</p>
                                <p class="text-2xl font-black text-slate-800"><?= $coupon['match_count'] ?></p>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border border-green-100">
                            <p class="text-slate-500 text-sm">Tahmini Kazanç</p>
                            <p class="text-2xl font-black text-green-600"><?= formatMoney($coupon['max_win']) ?></p>
                        </div>
                        
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-slate-500 text-sm">Kupon Fiyatı</p>
                                <p class="text-xl font-black text-slate-800"><?= formatMoney($coupon['price']) ?></p>
                            </div>
                            <?php if (isLoggedIn()): ?>
                                <a href="panel/buy_coupon.php?id=<?= $coupon['id'] ?>" 
                                   class="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition">
                                    SATIN AL
                                </a>
                            <?php else: ?>
                                <a href="register.php" 
                                   class="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition">
                                    KAYIT OL
                                </a>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
            
            <?php if (empty($coupons)): ?>
                <div class="col-span-full text-center py-16">
                    <p class="text-slate-500 text-lg">Henüz satışta kupon bulunmuyor.</p>
                </div>
            <?php endif; ?>
        </div>
    </section>
    
    <!-- Footer -->
    <footer class="glass border-t border-slate-200 py-8 text-center">
        <p class="text-slate-500">&copy; <?= date('Y') ?> <?= SITE_NAME ?>. Tüm hakları saklıdır.</p>
    </footer>
</body>
</html>
