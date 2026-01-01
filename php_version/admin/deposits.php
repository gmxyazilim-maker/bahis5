<?php
require_once '../config.php';
requireAdmin();

// Para yatırma taleplerini al
$stmt = $pdo->query("SELECT d.*, u.username, u.phone FROM deposits d JOIN users u ON d.user_id = u.id ORDER BY d.created_at DESC");
$deposits = $stmt->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $deposit_id = intval($_POST['deposit_id'] ?? 0);
    
    $stmt = $pdo->prepare("SELECT * FROM deposits WHERE id = ?");
    $stmt->execute([$deposit_id]);
    $deposit = $stmt->fetch();
    
    if ($deposit) {
        if ($action === 'approve') {
            $stmt = $pdo->prepare("UPDATE deposits SET status = 'approved' WHERE id = ?");
            $stmt->execute([$deposit_id]);
            
            $stmt = $pdo->prepare("UPDATE users SET balance = balance + ?, status = 'active' WHERE id = ?");
            $stmt->execute([$deposit['amount'], $deposit['user_id']]);
            
            alert('Para yatırma onaylandı! Bakiye eklendi.', 'success');
        } elseif ($action === 'reject') {
            $stmt = $pdo->prepare("UPDATE deposits SET status = 'rejected' WHERE id = ?");
            $stmt->execute([$deposit_id]);
            alert('Para yatırma reddedildi.', 'warning');
        }
    }
    redirect('deposits.php');
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Para Yatırma - Admin Panel</title>
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
                <a href="users.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">👥 Kullanıcılar</a>
                <a href="deposits.php" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold">💰 Para Yatırma</a>
                <a href="western.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">🌐 Western Union</a>
                <a href="masak.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">🛡️ MASAK</a>
                <a href="settings.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">⚙️ Ayarlar</a>
            </nav>
        </aside>
        
        <main class="flex-1 ml-64 p-8">
            <?php showAlert(); ?>
            
            <h2 class="text-3xl font-black text-slate-800 mb-2">💰 Para Yatırma Talepleri</h2>
            <p class="text-slate-500 mb-8">Kullanıcı para yatırma taleplerini onaylayın</p>
            
            <div class="glass rounded-2xl shadow-lg overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-slate-50">
                            <tr>
                                <th class="text-left py-4 px-6 text-slate-600 font-semibold">Tarih</th>
                                <th class="text-left py-4 px-6 text-slate-600 font-semibold">Kullanıcı</th>
                                <th class="text-left py-4 px-6 text-slate-600 font-semibold">Telefon</th>
                                <th class="text-left py-4 px-6 text-slate-600 font-semibold">Tutar</th>
                                <th class="text-left py-4 px-6 text-slate-600 font-semibold">Durum</th>
                                <th class="text-left py-4 px-6 text-slate-600 font-semibold">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($deposits as $deposit): ?>
                            <tr class="border-t border-slate-100">
                                <td class="py-4 px-6 text-slate-500 text-sm"><?= date('d.m.Y H:i', strtotime($deposit['created_at'])) ?></td>
                                <td class="py-4 px-6 font-bold text-slate-800"><?= sanitize($deposit['username']) ?></td>
                                <td class="py-4 px-6 text-slate-600 font-mono"><?= sanitize($deposit['phone']) ?></td>
                                <td class="py-4 px-6 font-bold text-purple-600 font-mono"><?= formatMoney($deposit['amount']) ?></td>
                                <td class="py-4 px-6">
                                    <?php if ($deposit['status'] === 'pending'): ?>
                                        <span class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold">BEKLEMEDE</span>
                                    <?php elseif ($deposit['status'] === 'approved'): ?>
                                        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">ONAYLANDI</span>
                                    <?php else: ?>
                                        <span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">REDDEDİLDİ</span>
                                    <?php endif; ?>
                                </td>
                                <td class="py-4 px-6">
                                    <?php if ($deposit['status'] === 'pending'): ?>
                                        <form method="POST" class="inline-flex gap-2">
                                            <input type="hidden" name="deposit_id" value="<?= $deposit['id'] ?>">
                                            <button type="submit" name="action" value="approve" class="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600">✓ Onayla</button>
                                            <button type="submit" name="action" value="reject" class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600">✗ Reddet</button>
                                        </form>
                                    <?php else: ?>
                                        <span class="text-slate-400 text-sm">-</span>
                                    <?php endif; ?>
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
