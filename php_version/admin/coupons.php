<?php
require_once '../config.php';
requireAdmin();

// Kuponları al
$stmt = $pdo->query("SELECT c.*, COUNT(cm.id) as match_count FROM coupons c LEFT JOIN coupon_matches cm ON c.id = cm.coupon_id GROUP BY c.id ORDER BY c.created_at DESC");
$coupons = $stmt->fetchAll();

// Kupon ekleme/düzenleme
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'add_coupon') {
        $name = sanitize($_POST['name'] ?? '');
        $consultant_name = sanitize($_POST['consultant_name'] ?? 'Bahis Danışmanı');
        $price = floatval($_POST['price'] ?? 1000);
        $status = $_POST['status'] ?? 'satilik';
        
        $stmt = $pdo->prepare("INSERT INTO coupons (name, consultant_name, price, status, is_market, total_odds, max_win) VALUES (?, ?, ?, ?, 1, 1, ?)");
        $stmt->execute([$name, $consultant_name, $price, $status, $price]);
        
        alert('Kupon oluşturuldu! Şimdi maç ekleyebilirsiniz.', 'success');
        redirect('coupons.php');
        
    } elseif ($action === 'add_match') {
        $coupon_id = intval($_POST['coupon_id'] ?? 0);
        $teams = sanitize($_POST['teams'] ?? '');
        $prediction = sanitize($_POST['prediction'] ?? '');
        $odds = floatval($_POST['odds'] ?? 1);
        
        $stmt = $pdo->prepare("INSERT INTO coupon_matches (coupon_id, teams, prediction, odds) VALUES (?, ?, ?, ?)");
        $stmt->execute([$coupon_id, $teams, $prediction, $odds]);
        
        // Toplam oranı güncelle
        $stmt = $pdo->prepare("SELECT SUM(LOG(odds)) as log_sum FROM coupon_matches WHERE coupon_id = ?");
        $stmt->execute([$coupon_id]);
        $result = $stmt->fetch();
        $total_odds = exp($result['log_sum'] ?? 0);
        
        $stmt = $pdo->prepare("SELECT price FROM coupons WHERE id = ?");
        $stmt->execute([$coupon_id]);
        $coupon = $stmt->fetch();
        $max_win = $coupon['price'] * $total_odds;
        
        $stmt = $pdo->prepare("UPDATE coupons SET total_odds = ?, max_win = ? WHERE id = ?");
        $stmt->execute([round($total_odds, 2), round($max_win, 2), $coupon_id]);
        
        alert('Maç eklendi!', 'success');
        redirect('coupons.php?edit=' . $coupon_id);
        
    } elseif ($action === 'update_status') {
        $coupon_id = intval($_POST['coupon_id'] ?? 0);
        $status = $_POST['status'] ?? 'beklemede';
        
        $stmt = $pdo->prepare("UPDATE coupons SET status = ? WHERE id = ?");
        $stmt->execute([$status, $coupon_id]);
        
        alert('Durum güncellendi!', 'success');
        redirect('coupons.php');
        
    } elseif ($action === 'update_match') {
        $match_id = intval($_POST['match_id'] ?? 0);
        $result = sanitize($_POST['result'] ?? '');
        $is_correct = isset($_POST['is_correct']) ? 1 : 0;
        
        $stmt = $pdo->prepare("UPDATE coupon_matches SET result = ?, is_correct = ? WHERE id = ?");
        $stmt->execute([$result, $is_correct, $match_id]);
        
        alert('Maç sonucu güncellendi!', 'success');
        redirect('coupons.php?edit=' . intval($_POST['coupon_id'] ?? 0));
        
    } elseif ($action === 'delete_coupon') {
        $coupon_id = intval($_POST['coupon_id'] ?? 0);
        $stmt = $pdo->prepare("DELETE FROM coupons WHERE id = ?");
        $stmt->execute([$coupon_id]);
        alert('Kupon silindi!', 'success');
        redirect('coupons.php');
    }
}

$edit_coupon = null;
$edit_matches = [];
if (isset($_GET['edit'])) {
    $edit_id = intval($_GET['edit']);
    $stmt = $pdo->prepare("SELECT * FROM coupons WHERE id = ?");
    $stmt->execute([$edit_id]);
    $edit_coupon = $stmt->fetch();
    
    $stmt = $pdo->prepare("SELECT * FROM coupon_matches WHERE coupon_id = ?");
    $stmt->execute([$edit_id]);
    $edit_matches = $stmt->fetchAll();
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kupon Market - Admin Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', sans-serif; } .gradient-bg { background: linear-gradient(135deg, #e0f2fe 0%, #f0e6ff 50%, #ecfdf5 100%); } .glass { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); }</style>
</head>
<body class="gradient-bg min-h-screen">
    <div class="flex">
        <aside class="w-64 bg-white/90 backdrop-blur min-h-screen border-r border-slate-200 fixed">
            <div class="p-6 border-b border-slate-200"><h1 class="text-xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">YÖNETİCİ</h1></div>
            <nav class="p-4 space-y-1">
                <a href="index.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">📊 Dashboard</a>
                <a href="coupons.php" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold">🎟️ Kupon Market</a>
                <a href="users.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">👥 Kullanıcılar</a>
                <a href="deposits.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">💰 Para Yatırma</a>
                <a href="western.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">🌐 Western Union</a>
                <a href="masak.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">🛡️ MASAK</a>
                <a href="settings.php" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100">⚙️ Ayarlar</a>
            </nav>
        </aside>
        
        <main class="flex-1 ml-64 p-8">
            <?php showAlert(); ?>
            
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-3xl font-black text-slate-800 mb-2">🎟️ Kupon Market</h2>
                    <p class="text-slate-500">Satılık kuponları yönetin</p>
                </div>
            </div>
            
            <?php if ($edit_coupon): ?>
            <!-- Kupon Düzenleme -->
            <div class="glass rounded-2xl p-6 shadow-lg mb-8">
                <h3 class="font-bold text-slate-800 mb-4">📝 Kupon Düzenle: <?= sanitize($edit_coupon['name']) ?></h3>
                
                <!-- Maç Ekleme -->
                <form method="POST" class="mb-6 p-4 bg-slate-50 rounded-xl">
                    <input type="hidden" name="action" value="add_match">
                    <input type="hidden" name="coupon_id" value="<?= $edit_coupon['id'] ?>">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input type="text" name="teams" required placeholder="Takımlar (FB - GS)" class="px-4 py-2 rounded-lg border border-slate-200">
                        <input type="text" name="prediction" required placeholder="Tahmin (MS 1)" class="px-4 py-2 rounded-lg border border-slate-200">
                        <input type="number" step="0.01" name="odds" required placeholder="Oran" class="px-4 py-2 rounded-lg border border-slate-200">
                        <button type="submit" class="bg-green-500 text-white rounded-lg font-bold hover:bg-green-600">+ Maç Ekle</button>
                    </div>
                </form>
                
                <!-- Mevcut Maçlar -->
                <div class="space-y-3">
                    <?php foreach ($edit_matches as $match): ?>
                    <form method="POST" class="flex items-center gap-4 p-3 bg-white rounded-lg border border-slate-200">
                        <input type="hidden" name="action" value="update_match">
                        <input type="hidden" name="match_id" value="<?= $match['id'] ?>">
                        <input type="hidden" name="coupon_id" value="<?= $edit_coupon['id'] ?>">
                        <div class="flex-1">
                            <p class="font-bold text-slate-800"><?= sanitize($match['teams']) ?></p>
                            <p class="text-slate-500 text-sm"><?= sanitize($match['prediction']) ?> | Oran: <?= $match['odds'] ?></p>
                        </div>
                        <input type="text" name="result" value="<?= sanitize($match['result'] ?? '') ?>" placeholder="Sonuç" class="w-24 px-3 py-2 rounded-lg border border-slate-200 text-center">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" name="is_correct" <?= $match['is_correct'] ? 'checked' : '' ?> class="w-5 h-5">
                            <span class="text-sm text-slate-600">Doğru</span>
                        </label>
                        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">Kaydet</button>
                    </form>
                    <?php endforeach; ?>
                </div>
                
                <div class="mt-4 flex gap-4">
                    <a href="coupons.php" class="text-purple-600 font-semibold">← Geri</a>
                    <form method="POST" class="inline" onsubmit="return confirm('Kuponu silmek istediğinize emin misiniz?')">
                        <input type="hidden" name="action" value="delete_coupon">
                        <input type="hidden" name="coupon_id" value="<?= $edit_coupon['id'] ?>">
                        <button type="submit" class="text-red-500 font-semibold">🗑️ Kuponu Sil</button>
                    </form>
                </div>
            </div>
            <?php endif; ?>
            
            <!-- Yeni Kupon Ekle -->
            <div class="glass rounded-2xl p-6 shadow-lg mb-8">
                <h3 class="font-bold text-slate-800 mb-4">➕ Yeni Kupon Ekle</h3>
                <form method="POST" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="hidden" name="action" value="add_coupon">
                    <input type="text" name="name" required placeholder="Kupon Adı" class="px-4 py-3 rounded-xl border border-slate-200">
                    <input type="text" name="consultant_name" placeholder="Danışman Adı" class="px-4 py-3 rounded-xl border border-slate-200">
                    <input type="number" name="price" required placeholder="Fiyat (TL)" class="px-4 py-3 rounded-xl border border-slate-200">
                    <button type="submit" class="bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-bold hover:opacity-90">Kupon Oluştur</button>
                </form>
            </div>
            
            <!-- Kupon Listesi -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <?php foreach ($coupons as $coupon): ?>
                <div class="glass rounded-2xl overflow-hidden shadow-lg">
                    <div class="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-4">
                        <h4 class="font-bold"><?= sanitize($coupon['name']) ?></h4>
                        <p class="text-purple-200 text-sm"><?= sanitize($coupon['consultant_name']) ?></p>
                    </div>
                    <div class="p-4">
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-slate-500">Fiyat:</span>
                            <span class="font-bold"><?= formatMoney($coupon['price']) ?></span>
                        </div>
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-slate-500">Oran:</span>
                            <span class="font-bold text-purple-600"><?= number_format($coupon['total_odds'], 2) ?></span>
                        </div>
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-slate-500">Kazanç:</span>
                            <span class="font-bold text-green-600"><?= formatMoney($coupon['max_win']) ?></span>
                        </div>
                        <div class="flex justify-between text-sm mb-4">
                            <span class="text-slate-500">Maç:</span>
                            <span class="font-bold"><?= $coupon['match_count'] ?></span>
                        </div>
                        
                        <form method="POST" class="mb-3">
                            <input type="hidden" name="action" value="update_status">
                            <input type="hidden" name="coupon_id" value="<?= $coupon['id'] ?>">
                            <select name="status" onchange="this.form.submit()" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold <?= $coupon['status'] === 'kazandi' ? 'bg-green-100 text-green-700' : ($coupon['status'] === 'kaybetti' ? 'bg-red-100 text-red-700' : ($coupon['status'] === 'satilik' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700')) ?>">
                                <option value="satilik" <?= $coupon['status'] === 'satilik' ? 'selected' : '' ?>>SATILIK</option>
                                <option value="beklemede" <?= $coupon['status'] === 'beklemede' ? 'selected' : '' ?>>BEKLEMEDE</option>
                                <option value="kazandi" <?= $coupon['status'] === 'kazandi' ? 'selected' : '' ?>>KAZANDI</option>
                                <option value="kaybetti" <?= $coupon['status'] === 'kaybetti' ? 'selected' : '' ?>>KAYBETTİ</option>
                            </select>
                        </form>
                        
                        <a href="coupons.php?edit=<?= $coupon['id'] ?>" class="block w-full text-center bg-slate-100 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-200">✏️ Düzenle</a>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </main>
    </div>
</body>
</html>
