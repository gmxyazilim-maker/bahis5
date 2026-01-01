# KUPON PAYLAŞIM SCRİPTİ - VPS KURULUM REHBERİ

## 📋 GEREKSİNİMLER

- Ubuntu 20.04 / 22.04 VPS (minimum 1GB RAM)
- PHP 8.0+ 
- MySQL 5.7+ veya MariaDB 10.3+
- Apache veya Nginx web sunucusu

---

## 🚀 ADIM ADIM KURULUM

### 1. VPS'e Bağlanın

```bash
ssh root@SUNUCU_IP_ADRESI
```

### 2. Sistemi Güncelleyin

```bash
apt update && apt upgrade -y
```

### 3. LAMP Stack Kurun (Apache + MySQL + PHP)

```bash
# Apache
apt install apache2 -y
systemctl enable apache2
systemctl start apache2

# MySQL
apt install mysql-server -y
mysql_secure_installation

# PHP
apt install php php-mysql php-mbstring php-xml php-curl -y

# Apache için PHP modülü
apt install libapache2-mod-php -y
systemctl restart apache2
```

### 4. Veritabanı Oluşturun

```bash
# MySQL'e girin
mysql -u root -p

# Komutları çalıştırın:
CREATE DATABASE kupon_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kupon_user'@'localhost' IDENTIFIED BY 'GucluSifre123!';
GRANT ALL PRIVILEGES ON kupon_db.* TO 'kupon_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. Dosyaları Yükleyin

```bash
# Web dizinine gidin
cd /var/www/html

# Eski dosyaları silin
rm -rf *

# Dosyaları buraya yükleyin (FTP veya SCP ile)
# Örnek SCP komutu (kendi bilgisayarınızdan):
# scp -r /path/to/php_files/* root@SUNUCU_IP:/var/www/html/
```

### 6. Veritabanı Tablolarını Oluşturun

```bash
mysql -u kupon_user -p kupon_db < /var/www/html/database.sql
```

### 7. Config Dosyasını Düzenleyin

```bash
nano /var/www/html/config.php
```

Şu satırları düzenleyin:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'kupon_db');
define('DB_USER', 'kupon_user');
define('DB_PASS', 'GucluSifre123!');  // Kendi şifrenizi yazın
define('SITE_URL', 'https://siteniz.com');  // Kendi domain'inizi yazın
```

### 8. Dosya İzinlerini Ayarlayın

```bash
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
```

### 9. Apache Virtual Host (Opsiyonel - Domain için)

```bash
nano /etc/apache2/sites-available/kupon.conf
```

İçeriği:
```apache
<VirtualHost *:80>
    ServerName siteniz.com
    ServerAlias www.siteniz.com
    DocumentRoot /var/www/html
    
    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/kupon_error.log
    CustomLog ${APACHE_LOG_DIR}/kupon_access.log combined
</VirtualHost>
```

```bash
a2ensite kupon.conf
a2enmod rewrite
systemctl restart apache2
```

### 10. SSL Sertifikası (HTTPS) - Let's Encrypt

```bash
apt install certbot python3-certbot-apache -y
certbot --apache -d siteniz.com -d www.siteniz.com
```

---

## 🔐 GİRİŞ BİLGİLERİ

**Admin Paneli:** `https://siteniz.com/admin/`
- Kullanıcı: `admin`
- Şifre: `admin123`

**ÖNEMLİ:** İlk girişten sonra admin şifresini değiştirin!

---

## 📁 DOSYA YAPISI

```
/var/www/html/
├── config.php          # Veritabanı ayarları
├── database.sql        # Veritabanı şeması
├── index.php           # Ana sayfa (Kupon Market)
├── login.php           # Giriş sayfası
├── register.php        # Kayıt sayfası
├── logout.php          # Çıkış
├── panel/              # Üye Paneli
│   ├── index.php       # Dashboard
│   ├── deposit.php     # Para yatır
│   ├── my_coupons.php  # Kuponlarım
│   ├── buy_coupon.php  # Kupon satın al
│   ├── view_coupon.php # Kupon detay
│   └── withdraw.php    # Para çek
└── admin/              # Admin Paneli
    ├── index.php       # Dashboard
    ├── coupons.php     # Kupon market yönetimi
    ├── users.php       # Kullanıcı yönetimi
    ├── deposits.php    # Para yatırma onay
    ├── western.php     # Western Union onay
    ├── masak.php       # MASAK onay
    └── settings.php    # Ayarlar
```

---

## ⚙️ AYARLAR

Admin panelinden (`/admin/settings.php`) şunları ayarlayabilirsiniz:

1. **IBAN Bilgileri** - Ödeme yapılacak hesap
2. **WhatsApp Numarası** - Dekont gönderimi için
3. **Western Union Komisyonu (%)** - Varsayılan: 7.5
4. **MASAK Vergi Oranı (%)** - Varsayılan: 15
5. **MASAK Bonus Oranı (%)** - Varsayılan: 35

---

## 🔧 SORUN GİDERME

### Beyaz Sayfa / 500 Hatası
```bash
tail -f /var/log/apache2/error.log
```

### Veritabanı Bağlantı Hatası
- config.php'deki bilgileri kontrol edin
- MySQL servisini kontrol edin: `systemctl status mysql`

### Dosya İzin Hatası
```bash
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
```

---

## 📞 DESTEK

Sorularınız için iletişime geçebilirsiniz.

---

**Not:** Bu script eğitim amaçlıdır. Gerçek para işlemlerinde kullanmayın.
