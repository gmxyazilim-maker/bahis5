<?php
require_once 'config.php';

// Zaten giriş yapmışsa yönlendir
if (isLoggedIn()) {
    redirect(isAdmin() ? 'admin/index.php' : 'panel/index.php');
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = sanitize($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $captcha_answer = intval($_POST['captcha_answer'] ?? 0);
    $captcha_correct = intval($_SESSION['captcha_result'] ?? 0);
    
    if ($captcha_answer !== $captcha_correct) {
        $error = 'Güvenlik sorusu yanlış!';
    } else {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password'])) {
            if ($user['status'] === 'pending') {
                $error = 'Hesabınız henüz onaylanmadı. Lütfen bekleyin.';
            } elseif ($user['status'] === 'rejected') {
                $error = 'Hesabınız reddedildi.';
            } else {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['role'] = $user['role'];
                
                redirect($user['role'] === 'admin' ? 'admin/index.php' : 'panel/index.php');
            }
        } else {
            $error = 'Kullanıcı adı veya şifre hatalı!';
        }
    }
}

// Captcha oluştur
$num1 = rand(1, 10);
$num2 = rand(1, 10);
$_SESSION['captcha_result'] = $num1 + $num2;
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Giriş Yap - <?= SITE_NAME ?></title>
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
            <div class="text-center mb-8">
                <h1 class="text-3xl font-black text-slate-800 mb-2">GİRİŞ YAP</h1>
                <p class="text-slate-500 text-sm">Hesabınıza giriş yapın</p>
            </div>
            
            <?php if ($error): ?>
                <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                    <?= $error ?>
                </div>
            <?php endif; ?>
            
            <form method="POST" class="space-y-5">
                <div>
                    <label class="block text-slate-700 text-sm font-medium mb-2">Kullanıcı Adı</label>
                    <input type="text" name="username" required
                           class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                           placeholder="Kullanıcı adınızı girin">
                </div>
                
                <div>
                    <label class="block text-slate-700 text-sm font-medium mb-2">Şifre</label>
                    <input type="password" name="password" required
                           class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                           placeholder="Şifrenizi girin">
                </div>
                
                <div>
                    <label class="block text-slate-700 text-sm font-medium mb-2">Güvenlik Sorusu</label>
                    <div class="flex items-center gap-3">
                        <div class="bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl px-4 py-3 font-mono font-bold">
                            <?= $num1 ?> + <?= $num2 ?> = ?
                        </div>
                        <input type="number" name="captcha_answer" required
                               class="w-24 px-4 py-3 rounded-xl border border-slate-200 text-center font-mono focus:ring-2 focus:ring-purple-500"
                               placeholder="?">
                    </div>
                </div>
                
                <button type="submit" 
                        class="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition shadow-lg">
                    GİRİŞ YAP
                </button>
            </form>
            
            <div class="mt-6 text-center">
                <p class="text-slate-500 text-sm">
                    Hesabınız yok mu? 
                    <a href="register.php" class="text-purple-600 hover:text-purple-500 font-semibold">Kayıt Ol</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
