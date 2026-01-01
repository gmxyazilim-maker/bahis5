<?php
require_once '../config.php';
requireAdmin();

// Kullanıcıları al
$stmt = $pdo->query("SELECT u.*, 
                     (SELECT COUNT(*) FROM user_coupons WHERE user_id = u.id) as coupon_count
                     FROM users u WHERE u.role = 'user' ORDER BY u.created_at DESC");
$users = $stmt->fetchAll();

// Kuponlar (atama için)
$stmt = $pdo->query("SELECT * FROM coupons ORDER BY created_at DESC");
$coupons = $stmt->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'reveal_coupon') {
        $uc_id = intval($_POST['uc_id'] ?? 0);
        $stmt = $pdo->prepare("UPDATE user_coupons SET revealed = 1 WHERE id = ?");
        $stmt->execute([$uc_id]);
        alert('Kupon sonuçları kullanıcıya gösterildi!', 'success');
        
    } elseif ($action === 'update_balance') {
        $user_id = intval($_POST['user_id'] ?? 0);
        $balance = floatval($_POST['balance'] ?? 0);
        $stmt = $pdo->prepare("UPDATE users SET balance = ? WHERE id = ?");
        $stmt->execute([$balance, $user_id]);
        alert('Bakiye güncellendi!', 'success');
        
    } elseif ($action === 'complete_withdrawal') {
        $user_id = intval($_POST['user_id'] ?? 0);
        $stmt = $pdo->prepare("UPDATE users SET withdrawal_status = 'completed', balance = 0 WHERE id = ?");
        $stmt->execute([$user_id]);
        alert('Çekim tamamlandı!', 'success');
        
    } elseif ($action === 'delete_user') {
        $user_id = intval($_POST['user_id'] ?? 0);
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND role != 'admin'");
        $stmt->execute([$user_id]);
        alert('Kullanıcı silindi!', 'success');
    }
    redirect('users.php');
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kullanıcılar - Admin Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', sans-serif; } .gradient-bg { background: linear-gradient(135deg, #e0f2fe 0%, #f0e6ff 50%, #ecfdf5 100%); } .glass { background: rgba(255, 255, 255, 0.85); }</style>
</head>
<body class="gradient-bg min-h-screen">
    <div class="flex">
        <aside class="w-64 bg-white/90 backdrop-blur min-h-screen border-r border-slate-200 fixed">
            <div class="p-6 border-b border-slate-200"><h1 class="text-xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">YÖNETİCİ</h1></div>
            <nav class="p-4 space-y-1">
                <a href="index.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">📊 Dashboard</a>
                <a href="coupons.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">🎟️ Kupon Market</a>
                <a href="users.php" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold">👥 Kullanıcılar</a>
                <a href="deposits.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">💰 Para Yatırma</a>
                <a href="western.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">🌐 Western Union</a>
                <a href="masak.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">🛡️ MASAK</a>
                <a href="settings.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">⚙️ Ayarlar</a>
            </nav>
        </aside>
        
        <main class="flex-1 ml-64 p-8">
            <?php showAlert(); ?>
            
            <h2 class="text-3xl font-black text-slate-800 mb-2">👥 Kullanıcılar</h2>
            <p class="text-slate-500 mb-8">Tüm kullanıcıları yönetin</p>
            
            <div class="glass rounded-2xl shadow-lg overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-slate-50">
                            <tr>
                                <th class="text-left py-4 px-6 text-slate-600 font-semibold">Kullanıcı</th>
                                <th class="text-left py-4 px-6 text-slate-600 font-semibold">Bakiye</th>
                                <th class="text-left py-4 px-6 text-slate-600 font-semibold">Kupon</th>
                                <th class="text-left py-4 px-6 text-slate-600 font-semibold">Çekim Durumu</th>
                                <th class="text-left py-4 px-6 text-slate-600 font-semibold">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($users as $user): ?>
                            <?php 
                            $stmt = $pdo->prepare("SELECT uc.*, c.name FROM user_coupons uc JOIN coupons c ON uc.coupon_id = c.id WHERE uc.user_id = ? ORDER BY uc.purchased_at DESC LIMIT 1");
                            $stmt->execute([$user['id']]);
                            $last_coupon = $stmt->fetch();
                            ?>
                            <tr class="border-t border-slate-100">
                                <td class="py-4 px-6">
                                    <p class="font-bold text-slate-800"><?= sanitize($user['username']) ?></p>
                                    <p class="text-slate-500 text-sm"><?= sanitize($user['phone']) ?></p>
                                </td>
                                <td class="py-4 px-6">
                                    <form method="POST" class="flex items-center gap-2">
                                        <input type="hidden" name="action" value="update_balance">
                                        <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                        <input type="number" name="balance" value="<?= $user['balance'] ?>" class="w-32 px-3 py-1 rounded border border-slate-200 font-mono text-sm">
                                        <button type="submit" class="text-blue-500 text-sm">💾</button>
                                    </form>
                                </td>
                                <td class="py-4 px-6">
                                    <?php if ($last_coupon): ?>
                                        <p class="text-slate-800 text-sm"><?= sanitize($last_coupon['name']) ?></p>
                                        <?php if (!$last_coupon['revealed']): ?>
                                            <form method="POST" class="inline">
                                                <input type="hidden" name="action" value="reveal_coupon">
                                                <input type="hidden" name="uc_id" value="<?= $last_coupon['id'] ?>">
                                                <button type="submit" class="text-blue-500 text-sm font-semibold">👁️ Göster</button>
                                            </form>
                                        <?php else: ?>
                                            <span class="text-green-500 text-sm">✓ Gösterildi</span>
                                        <?php endif; ?>
                                    <?php else: ?>
                                        <span class="text-slate-400 text-sm">-</span>
                                    <?php endif; ?>
                                </td>
                                <td class="py-4 px-6">
                                    <?php if ($user['withdrawal_status'] === 'completed'): ?>
                                        <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-bold">Tamamlandı</span>
                                    <?php elseif ($user['withdrawal_status'] && $user['withdrawal_status'] !== 'none'): ?>
                                        <span class="bg-amber-100 text-amber-700 px-2 py-1 rounded text-sm font-bold"><?= $user['withdrawal_status'] ?></span>
                                        <form method="POST" class="inline ml-2">
                                            <input type="hidden" name="action" value="complete_withdrawal">
                                            <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                            <button type="submit" class="text-green-500 text-sm font-semibold">✓ Tamamla</button>
                                        </form>
                                    <?php else: ?>
                                        <span class="text-slate-400 text-sm">-</span>
                                    <?php endif; ?>
                                </td>
                                <td class="py-4 px-6">
                                    <form method="POST" class="inline" onsubmit="return confirm('Kullanıcıyı silmek istediğinize emin misiniz?')">
                                        <input type="hidden" name="action" value="delete_user">
                                        <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                        <button type="submit" class="text-red-500 text-sm">🗑️</button>
                                    </form>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
</body>
</html>
