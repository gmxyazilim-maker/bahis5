<?php
require_once '../config.php';
requireAdmin();

// İstatistikler
$stats = [
    'pending_users' => $pdo->query("SELECT COUNT(*) FROM deposits WHERE status = 'pending'")->fetchColumn(),
    'active_users' => $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'user' AND status = 'active'")->fetchColumn(),
    'coupons' => $pdo->query("SELECT COUNT(*) FROM coupons WHERE is_market = 1")->fetchColumn(),
    'pending_withdrawals' => $pdo->query("SELECT COUNT(*) FROM western_payments WHERE status = 'pending'")->fetchColumn(),
];
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - <?= SITE_NAME ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #e0f2fe 0%, #f0e6ff 50%, #ecfdf5 100%); }
        .glass { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); }
    </style>
</head>
<body class="gradient-bg min-h-screen">
    <div class="flex">
        <!-- Sidebar -->
        <aside class="w-64 bg-white/90 backdrop-blur min-h-screen border-r border-slate-200 fixed">
            <div class="p-6 border-b border-slate-200">
                <h1 class="text-xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">YÖNETİCİ</h1>
            </div>
            <nav class="p-4 space-y-1">
                <a href="index.php" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold">
                    📊 Dashboard
                </a>
                <a href="coupons.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">
                    🎟️ Kupon Market
                </a>
                <a href="users.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">
                    👥 Kullanıcılar
                </a>
                <a href="deposits.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">
                    💰 Para Yatırma
                </a>
                <a href="western.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">
                    🌐 Western Union
                </a>
                <a href="masak.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">
                    🛡️ MASAK
                </a>
                <a href="settings.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">
                    ⚙️ Ayarlar
                </a>
            </nav>
            <div class="absolute bottom-0 w-full p-4 border-t border-slate-200">
                <a href="../logout.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50">
                    🚪 Çıkış Yap
                </a>
            </div>
        </aside>
        
        <!-- Main Content -->
        <main class="flex-1 ml-64 p-8">
            <h2 class="text-3xl font-black text-slate-800 mb-2">Dashboard</h2>
            <p class="text-slate-500 mb-8">Genel bakış</p>
            
            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="glass rounded-2xl p-6 shadow-lg bg-gradient-to-r from-amber-100 to-orange-100">
                    <p class="text-slate-600 text-sm mb-1">Onay Bekleyen</p>
                    <p class="text-3xl font-black text-amber-600"><?= $stats['pending_users'] ?></p>
                </div>
                <div class="glass rounded-2xl p-6 shadow-lg bg-gradient-to-r from-green-100 to-emerald-100">
                    <p class="text-slate-600 text-sm mb-1">Aktif Kullanıcı</p>
                    <p class="text-3xl font-black text-green-600"><?= $stats['active_users'] ?></p>
                </div>
                <div class="glass rounded-2xl p-6 shadow-lg bg-gradient-to-r from-blue-100 to-cyan-100">
                    <p class="text-slate-600 text-sm mb-1">Market Kuponları</p>
                    <p class="text-3xl font-black text-blue-600"><?= $stats['coupons'] ?></p>
                </div>
                <div class="glass rounded-2xl p-6 shadow-lg bg-gradient-to-r from-purple-100 to-violet-100">
                    <p class="text-slate-600 text-sm mb-1">Bekleyen Çekim</p>
                    <p class="text-3xl font-black text-purple-600"><?= $stats['pending_withdrawals'] ?></p>
                </div>
            </div>
            
            <div class="glass rounded-2xl p-6 shadow-lg">
                <h3 class="font-bold text-slate-800 mb-4">Hoş Geldiniz</h3>
                <p class="text-slate-600">Sol menüyü kullanarak kupon market yönetimi, kullanıcı işlemleri, para yatırma/çekme onayları ve sistem ayarlarını yönetebilirsiniz.</p>
            </div>
        </main>
    </div>
</body>
</html>
