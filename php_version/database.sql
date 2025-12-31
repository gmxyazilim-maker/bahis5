-- Kupon Paylaşım Scripti - Veritabanı Yapısı
-- MySQL 5.7+ / MariaDB 10.3+

CREATE DATABASE IF NOT EXISTS kupon_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kupon_db;

-- Kullanıcılar Tablosu
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    balance DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('pending', 'active', 'rejected') DEFAULT 'pending',
    iban VARCHAR(50) NULL,
    bank_name VARCHAR(100) NULL,
    iban_holder VARCHAR(100) NULL,
    withdrawal_status ENUM('none', 'western_pending', 'western_paid', 'masak_pending', 'masak_paid', 'reviewing', 'completed') DEFAULT 'none',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Kupon Şablonları (Market Kuponları)
CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    consultant_name VARCHAR(100) DEFAULT 'Bahis Danışmanı',
    price DECIMAL(15,2) NOT NULL DEFAULT 1000.00,
    total_odds DECIMAL(10,2) DEFAULT 1.00,
    max_win DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('beklemede', 'kazandi', 'kaybetti', 'satilik') DEFAULT 'satilik',
    is_market TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Kupon Maçları
CREATE TABLE IF NOT EXISTS coupon_matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    teams VARCHAR(200) NOT NULL,
    prediction VARCHAR(100) NOT NULL,
    result VARCHAR(50) NULL,
    odds DECIMAL(6,2) DEFAULT 1.00,
    is_correct TINYINT(1) DEFAULT 1,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Kullanıcı Satın Alınan Kuponlar
CREATE TABLE IF NOT EXISTS user_coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    coupon_id INT NOT NULL,
    purchase_price DECIMAL(15,2) NOT NULL,
    revealed TINYINT(1) DEFAULT 0,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Para Yatırma Talepleri
CREATE TABLE IF NOT EXISTS deposits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    dekont_note VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Para Çekme Talepleri
CREATE TABLE IF NOT EXISTS withdrawals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Western Union Ödemeleri
CREATE TABLE IF NOT EXISTS western_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    withdrawal_amount DECIMAL(15,2) NOT NULL,
    fee_percentage DECIMAL(5,2) DEFAULT 7.50,
    fee_amount DECIMAL(15,2) NOT NULL,
    dekont_sent TINYINT(1) DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- MASAK Ödemeleri
CREATE TABLE IF NOT EXISTS masak_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    transfer_amount DECIMAL(15,2) NOT NULL,
    fee_percentage DECIMAL(5,2) DEFAULT 15.00,
    fee_amount DECIMAL(15,2) NOT NULL,
    bonus_percentage DECIMAL(5,2) DEFAULT 35.00,
    bonus_amount DECIMAL(15,2) DEFAULT 0.00,
    dekont_sent TINYINT(1) DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Sistem Ayarları
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL
) ENGINE=InnoDB;

-- Varsayılan Ayarlar
INSERT INTO settings (setting_key, setting_value) VALUES
('iban_holder', 'AHMET YILMAZ'),
('bank_name', 'ZİRAAT BANKASI'),
('iban', 'TR00 0000 0000 0000 0000 0000 00'),
('whatsapp', '905551234567'),
('western_fee', '7.5'),
('masak_fee', '15'),
('masak_bonus', '35')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Admin Kullanıcısı (şifre: admin123)
INSERT INTO users (username, phone, password, role, status, balance) VALUES
('admin', '5555555555', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active', 0)
ON DUPLICATE KEY UPDATE username = username;

-- Örnek Market Kuponları
INSERT INTO coupons (name, consultant_name, price, total_odds, max_win, status, is_market) VALUES
('HAFTALIK SÜPER KUPON', 'MEHMET HOCA', 1000, 150.50, 150500.00, 'satilik', 1),
('GÜNLÜK GARANTİ', 'ALİ DANIŞMAN', 500, 50.25, 25125.00, 'satilik', 1),
('VIP ÖZEL KUPON', 'AHMET ŞEN', 2000, 280.75, 561500.00, 'satilik', 1),
('PREMIUM PAKET', 'HAZAL KOÇ', 3000, 350.00, 1050000.00, 'satilik', 1);

-- Örnek Maçlar
INSERT INTO coupon_matches (coupon_id, teams, prediction, odds) VALUES
(1, 'GALATASARAY - FENERBAHÇE', 'MS 1', 2.50),
(1, 'REAL MADRİD - BARCELONA', 'KG VAR', 1.65),
(1, 'MANCHESTER CITY - LIVERPOOL', '2.5 ÜST', 1.45),
(1, 'BAYERN - DORTMUND', 'MS 1', 1.80),
(2, 'BEŞİKTAŞ - TRABZONSPOR', 'MS X', 3.25),
(2, 'PSG - MONACO', '1.5 ÜST', 1.35),
(2, 'INTER - JUVENTUS', 'KG VAR', 1.75),
(3, 'ARSENAL - CHELSEA', 'MS 1', 2.10),
(3, 'ATLETICO - SEVILLA', 'İY 1', 2.85),
(3, 'NAPOLI - ROMA', '2.5 ÜST', 1.55),
(3, 'AJAX - PSV', 'MS 1-X', 1.40),
(4, 'PORTO - BENFİCA', 'MS 1', 2.20),
(4, 'CELTIC - RANGERS', 'KG VAR', 1.60),
(4, 'LYON - MARSILYA', '1.5 ÜST', 1.30),
(4, 'LAZIO - ROMA', 'MS X', 3.50);
