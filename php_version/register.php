<?php
require_once 'config.php';

if (isLoggedIn()) {
    redirect(isAdmin() ? 'admin/index.php' : 'panel/index.php');
}

$error = '';
$success = '';
$settings = getSettings($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = sanitize($_POST['username'] ?? '');
    $phone = sanitize($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $deposit_amount = floatval($_POST['deposit_amount'] ?? 0);
    $captcha_answer = intval($_POST['captcha_answer'] ?? 0);
    $captcha_correct = intval($_SESSION['captcha_result'] ?? 0);
    
    if ($captcha_answer !== $captcha_correct) {
        $error = 'Güvenlik sorusu yanlış!';
    } elseif (strlen($password) < 6) {
        $error = 'Şifre en az 6 karakter olmalıdır!';
    } elseif ($password !== $confirm_password) {
        $error = 'Şifreler eşleşmiyor!';
    } elseif ($deposit_amount < 500) {
        $error = 'Minimum yatırım tutarı 500 TL\'dir!';
    } else {
        // Kullanıcı adı kontrolü
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            $error = 'Bu kullanıcı adı zaten kullanılıyor!';
        } else {
            // Kullanıcı oluştur
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (username, phone, password, status) VALUES (?, ?, ?, 'pending')");
            $stmt->execute([$username, $phone, $hashed_password]);
            $user_id = $pdo->lastInsertId();
            
            // Para yatırma talebi oluştur
            $stmt = $pdo->prepare("INSERT INTO deposits (user_id, amount, status) VALUES (?, ?, 'pending')");
            $stmt->execute([$user_id, $deposit_amount]);
            
            $success = 'Kayıt başarılı! WhatsApp üzerinden ' . formatMoney($deposit_amount) . ' tutarında dekont gönderin. Onay sonrası giriş yapabilirsiniz.';
        }
    }
}

// Captcha
$num1 = rand(1, 10);
$num2 = rand(1, 10);
$_SESSION['captcha_result'] = $num1 + $num2;

$presetAmounts = [500, 1000, 2000, 3000, 5000];
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kayıt Ol - <?= SITE_NAME ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #e0f2fe 0%, #f0e6ff 50%, #ecfdf5 100%); }
        .glass { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); }
    </style>
</head>
<body class="gradient-bg min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <div class="glass rounded-2xl p-8 shadow-2xl">
            <div class="text-center mb-6">
                <h1 class="text-3xl font-black text-slate-800 mb-2">KAYIT OL</h1>
                <p class="text-slate-500 text-sm">Yeni hesap oluşturun</p>
            </div>
            
            <?php if ($error): ?>
                <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded"><?= $error ?></div>
            <?php endif; ?>
            
            <?php if ($success): ?>
                <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
                    <?= $success ?>
                    <div class="mt-3">
                        <a href="https://wa.me/<?= $settings['whatsapp'] ?? '' ?>?text=Merhaba, kayıt oldum. Dekont göndermek istiyorum." 
                           target="_blank"
                           class="inline-block bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600">
                            📱 WhatsApp'tan Dekont Gönder
                        </a>
                    </div>
                </div>
            <?php endif; ?>
            
            <form method="POST" class="space-y-4">
                <div>
                    <label class="block text-slate-700 text-sm font-medium mb-2">İsim Soyisim</label>
                    <input type="text" name="username" required
                           class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500"
                           placeholder="Ör: Ahmet Yılmaz">
                </div>
                
                <div>
                    <label class="block text-slate-700 text-sm font-medium mb-2">Telefon</label>
                    <input type="text" name="phone" required
                           class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500"
                           placeholder="5XX XXX XX XX">
                </div>
                
                <!-- Para Yatırma Tutarı -->
                <div>
                    <label class="block text-slate-700 text-sm font-medium mb-2">Yatırım Tutarı Seçin (TL)</label>
                    <div class="grid grid-cols-5 gap-2 mb-2">
                        <?php foreach ($presetAmounts as $amount): ?>
                            <button type="button" onclick="selectAmount(<?= $amount ?>)"
                                    class="amount-btn py-2 px-2 rounded-lg font-bold text-sm border-2 border-purple-200 text-purple-600 hover:border-purple-400 transition"
                                    data-amount="<?= $amount ?>">
                                <?= number_format($amount, 0, '', '.') ?>
                            </button>
                        <?php endforeach; ?>
                    </div>
                    <input type="number" name="deposit_amount" id="deposit_amount" required min="500"
                           class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500"
                           placeholder="Veya elle girin (min 500 TL)">
                </div>
                
                <!-- Ödeme Bilgileri -->
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                    <p class="text-sm font-semibold text-blue-700 mb-2">💳 ÖDEME YAPILACAK HESAP</p>
                    <p class="font-bold text-slate-800"><?= $settings['iban_holder'] ?? '' ?></p>
                    <p class="text-slate-600 text-sm"><?= $settings['bank_name'] ?? '' ?></p>
                    <p class="font-mono text-purple-700 font-bold text-sm"><?= $settings['iban'] ?? '' ?></p>
                </div>
                
                <div>
                    <label class="block text-slate-700 text-sm font-medium mb-2">Şifre</label>
                    <input type="password" name="password" required minlength="6"
                           class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500"
                           placeholder="En az 6 karakter">
                </div>
                
                <div>
                    <label class="block text-slate-700 text-sm font-medium mb-2">Şifre Tekrar</label>
                    <input type="password" name="confirm_password" required
                           class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500"
                           placeholder="Şifreyi tekrar girin">
                </div>
                
                <div>
                    <label class="block text-slate-700 text-sm font-medium mb-2">Güvenlik Sorusu</label>
                    <div class="flex items-center gap-3">
                        <div class="bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl px-4 py-3 font-mono font-bold">
                            <?= $num1 ?> + <?= $num2 ?> = ?
                        </div>
                        <input type="number" name="captcha_answer" required
                               class="w-24 px-4 py-3 rounded-xl border border-slate-200 text-center font-mono">
                    </div>
                </div>
                
                <button type="submit" 
                        class="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition shadow-lg">
                    KAYIT OL
                </button>
            </form>
            
            <div class="mt-6 text-center">
                <p class="text-slate-500 text-sm">
                    Zaten hesabınız var mı? 
                    <a href="login.php" class="text-purple-600 hover:text-purple-500 font-semibold">Giriş Yap</a>
                </p>
            </div>
        </div>
    </div>
    
    <script>
        function selectAmount(amount) {
            document.getElementById('deposit_amount').value = amount;
            document.querySelectorAll('.amount-btn').forEach(btn => {
                if (parseInt(btn.dataset.amount) === amount) {
                    btn.classList.remove('border-purple-200', 'text-purple-600');
                    btn.classList.add('bg-gradient-to-r', 'from-purple-500', 'to-violet-600', 'text-white', 'border-transparent');
                } else {
                    btn.classList.add('border-purple-200', 'text-purple-600');
                    btn.classList.remove('bg-gradient-to-r', 'from-purple-500', 'to-violet-600', 'text-white', 'border-transparent');
                }
            });
        }
    </script>
</body>
</html>
