<?php
/**
 * Kupon Paylaşım Scripti - Konfigürasyon
 */

// Veritabanı Ayarları
define('DB_HOST', 'localhost');
define('DB_NAME', 'kupon_db');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Site Ayarları
define('SITE_NAME', 'BAHİS DANIŞMANI');
define('SITE_URL', 'http://localhost'); // Kendi domain'inizi yazın

// Session Ayarları
session_start();

// Zaman Dilimi
date_default_timezone_set('Europe/Istanbul');

// Hata Raporlama (Canlıda kapatın)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Veritabanı Bağlantısı
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    die("Veritabanı bağlantı hatası: " . $e->getMessage());
}

// Yardımcı Fonksiyonlar
function redirect($url) {
    header("Location: $url");
    exit;
}

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function isAdmin() {
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

function requireLogin() {
    if (!isLoggedIn()) {
        redirect('login.php');
    }
}

function requireAdmin() {
    if (!isAdmin()) {
        redirect('index.php');
    }
}

function sanitize($data) {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

function formatMoney($amount) {
    return number_format($amount, 2, ',', '.') . ' TL';
}

function getSettings($pdo) {
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
    $settings = [];
    while ($row = $stmt->fetch()) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
    return $settings;
}

function alert($message, $type = 'info') {
    $_SESSION['alert'] = ['message' => $message, 'type' => $type];
}

function showAlert() {
    if (isset($_SESSION['alert'])) {
        $alert = $_SESSION['alert'];
        unset($_SESSION['alert']);
        $bgColor = match($alert['type']) {
            'success' => 'bg-green-100 border-green-500 text-green-700',
            'error' => 'bg-red-100 border-red-500 text-red-700',
            'warning' => 'bg-yellow-100 border-yellow-500 text-yellow-700',
            default => 'bg-blue-100 border-blue-500 text-blue-700'
        };
        echo "<div class='border-l-4 p-4 mb-4 {$bgColor}'>{$alert['message']}</div>";
    }
}
?>
