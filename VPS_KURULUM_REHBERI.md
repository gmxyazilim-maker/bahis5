# KUPON PAYLAŞIM SCRİPTİ - VPS KURULUM REHBERİ
# FastAPI (Python) + React + MongoDB

## 📋 GEREKSİNİMLER

- Ubuntu 20.04 / 22.04 VPS (minimum 2GB RAM önerilir)
- Domain adı (opsiyonel ama önerilir)

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

### 3. Gerekli Araçları Kurun

```bash
# Temel araçlar
apt install -y curl wget git nano unzip

# Node.js 18+ (React için)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Yarn
npm install -g yarn

# Python 3.10+
apt install -y python3 python3-pip python3-venv

# Nginx (Reverse Proxy)
apt install -y nginx

# Certbot (SSL için)
apt install -y certbot python3-certbot-nginx
```

### 4. MongoDB Kurun

```bash
# MongoDB GPG Key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Repository ekle
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Kur ve başlat
apt update
apt install -y mongodb-org
systemctl enable mongod
systemctl start mongod

# Kontrol
systemctl status mongod
```

### 5. Proje Dizinini Oluşturun

```bash
mkdir -p /var/www/kupon
cd /var/www/kupon
```

### 6. Dosyaları Yükleyin

**Seçenek A: SCP ile (kendi bilgisayarınızdan)**
```bash
# Kendi bilgisayarınızdan çalıştırın:
scp -r /path/to/backend root@SUNUCU_IP:/var/www/kupon/
scp -r /path/to/frontend root@SUNUCU_IP:/var/www/kupon/
```

**Seçenek B: Git ile**
```bash
# Eğer GitHub'a yüklediyseniz:
git clone https://github.com/KULLANICI/REPO.git /var/www/kupon
```

### 7. Backend Kurulumu

```bash
cd /var/www/kupon/backend

# Virtual environment oluştur
python3 -m venv venv
source venv/bin/activate

# Bağımlılıkları kur
pip install --upgrade pip
pip install -r requirements.txt

# .env dosyasını oluştur
cat > .env << 'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=kupon_db
JWT_SECRET=cok-guclu-gizli-anahtar-degistirin-bunu-123456
CORS_ORIGINS=https://siteniz.com,http://localhost:3000
EOF

# Test et
python3 -c "from server import app; print('Backend OK')"
```

### 8. Frontend Kurulumu

```bash
cd /var/www/kupon/frontend

# Bağımlılıkları kur
yarn install

# .env dosyasını oluştur
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=https://siteniz.com
EOF

# Production build
yarn build
```

### 9. Systemd Servisi (Backend için)

```bash
cat > /etc/systemd/system/kupon-backend.service << 'EOF'
[Unit]
Description=Kupon Backend API
After=network.target mongod.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/kupon/backend
Environment="PATH=/var/www/kupon/backend/venv/bin"
ExecStart=/var/www/kupon/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Servisi başlat
systemctl daemon-reload
systemctl enable kupon-backend
systemctl start kupon-backend

# Kontrol
systemctl status kupon-backend
```

### 10. Nginx Konfigürasyonu

```bash
cat > /etc/nginx/sites-available/kupon << 'EOF'
server {
    listen 80;
    server_name siteniz.com www.siteniz.com;  # Kendi domain'inizi yazın

    # Frontend (React build)
    location / {
        root /var/www/kupon/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

# Site'ı aktifleştir
ln -s /etc/nginx/sites-available/kupon /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginx'i test et ve yeniden başlat
nginx -t
systemctl restart nginx
```

### 11. SSL Sertifikası (HTTPS)

```bash
certbot --nginx -d siteniz.com -d www.siteniz.com
```

### 12. Admin Kullanıcısı Oluştur

```bash
curl -X POST http://localhost:8001/api/seed-admin
```

### 13. Firewall Ayarları

```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

---

## ✅ KURULUM TAMAMLANDI!

**Site Adresi:** `https://siteniz.com`

**Admin Girişi:**
- Kullanıcı: `admin`
- Şifre: `admin123`

**ÖNEMLİ:** İlk girişten sonra admin şifresini değiştirin!

---

## 🔧 YARARLI KOMUTLAR

```bash
# Backend loglarını izle
journalctl -u kupon-backend -f

# Backend'i yeniden başlat
systemctl restart kupon-backend

# Nginx'i yeniden başlat
systemctl restart nginx

# MongoDB durumu
systemctl status mongod

# Tüm servisleri kontrol et
systemctl status kupon-backend mongod nginx
```

---

## 🔄 GÜNCELLEME YAPMA

```bash
cd /var/www/kupon

# Yeni dosyaları yükleyin (SCP veya git pull)

# Backend güncelle
cd backend
source venv/bin/activate
pip install -r requirements.txt
systemctl restart kupon-backend

# Frontend güncelle
cd ../frontend
yarn install
yarn build
```

---

## 🐛 SORUN GİDERME

### Backend başlamıyor
```bash
# Logları kontrol et
journalctl -u kupon-backend -n 50

# Manuel test
cd /var/www/kupon/backend
source venv/bin/activate
python3 server.py
```

### MongoDB bağlantı hatası
```bash
systemctl status mongod
systemctl restart mongod
```

### 502 Bad Gateway
```bash
# Backend çalışıyor mu?
systemctl status kupon-backend

# Port dinleniyor mu?
netstat -tlnp | grep 8001
```

### CORS Hatası
`.env` dosyasındaki `CORS_ORIGINS` değerini kontrol edin.

---

## 📁 DOSYA YAPISI

```
/var/www/kupon/
├── backend/
│   ├── server.py         # Ana API dosyası
│   ├── requirements.txt  # Python bağımlılıkları
│   ├── .env              # Ortam değişkenleri
│   └── venv/             # Python virtual environment
│
├── frontend/
│   ├── src/              # React kaynak kodları
│   ├── build/            # Production build (nginx tarafından sunulur)
│   ├── package.json      # Node bağımlılıkları
│   └── .env              # Frontend ortam değişkenleri
│
└── KURULUM.md            # Bu dosya
```

---

## 💡 ÖNERİLER

1. **Yedekleme:** MongoDB'yi düzenli yedekleyin
   ```bash
   mongodump --out /backup/kupon_$(date +%Y%m%d)
   ```

2. **Monitoring:** PM2 veya Supervisor kullanabilirsiniz

3. **Güvenlik:** Fail2ban kurun
   ```bash
   apt install fail2ban
   ```

---

**Not:** Sorularınız için iletişime geçebilirsiniz.
