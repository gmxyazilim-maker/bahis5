# DOCKER İLE KURULUM REHBERİ
# Kupon Paylaşım Scripti - FastAPI + React + MongoDB

## 📋 ADIM ADIM KURULUM

### 1. Dosyaları VPS'e Yükleyin

Tüm proje dosyalarını VPS'inize yükleyin. Dosya yapısı şöyle olmalı:

```
/home/kupon/  (veya istediğiniz klasör)
├── docker-compose.yml
├── nginx.conf
├── backend/
│   ├── Dockerfile
│   ├── server.py
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── yarn.lock
    └── src/
```

### 2. docker-compose.yml Düzenleyin

`docker-compose.yml` dosyasında şu satırı bulun ve kendi sunucu IP'nizi yazın:

```yaml
args:
  - REACT_APP_BACKEND_URL=http://SUNUCU_IP:8001
```

Örnek:
```yaml
args:
  - REACT_APP_BACKEND_URL=http://185.123.45.67:8001
```

Veya domain'iniz varsa:
```yaml
args:
  - REACT_APP_BACKEND_URL=https://api.siteniz.com
```

### 3. Docker Compose ile Başlatın

```bash
cd /home/kupon  # Proje klasörüne gidin

# Build ve başlat
docker-compose up -d --build

# Logları izle
docker-compose logs -f
```

### 4. Admin Kullanıcısı Oluşturun

```bash
curl -X POST http://localhost:8001/api/seed-admin
```

### 5. Tarayıcıdan Test Edin

- **Site:** `http://SUNUCU_IP`
- **API:** `http://SUNUCU_IP:8001/api/`

---

## 🔐 GİRİŞ BİLGİLERİ

- **Kullanıcı:** `admin`
- **Şifre:** `admin123`

---

## 🛠️ DOCKER PANELİ KULLANANLAR İÇİN

Eğer Portainer, Docker Desktop veya başka bir panel kullanıyorsanız:

### Portainer ile:

1. **Stacks** bölümüne gidin
2. **Add Stack** tıklayın
3. `docker-compose.yml` içeriğini yapıştırın
4. **Deploy** tıklayın

### Konteyner Listesi:

| Konteyner | Port | Açıklama |
|-----------|------|----------|
| kupon_frontend | 80 | Web sitesi |
| kupon_nginx | 8001 | API Gateway |
| kupon_backend | - | FastAPI |
| kupon_mongodb | - | Veritabanı |

---

## 🔧 YARARLI KOMUTLAR

```bash
# Durumu kontrol et
docker-compose ps

# Logları izle
docker-compose logs -f

# Yeniden başlat
docker-compose restart

# Durdur
docker-compose down

# Tamamen sil (veriler dahil)
docker-compose down -v

# Sadece backend'i yeniden başlat
docker-compose restart backend

# Yeniden build et
docker-compose up -d --build
```

---

## 🔄 GÜNCELLEME

```bash
cd /home/kupon

# Yeni dosyaları yükleyin

# Yeniden build et
docker-compose up -d --build
```

---

## 🌐 DOMAIN + SSL (Opsiyonel)

Eğer domain kullanmak istiyorsanız, `docker-compose.yml` dosyasına Traefik veya Nginx Proxy Manager ekleyebilirsiniz.

### Basit Yöntem: Cloudflare

1. Domain'i Cloudflare'e ekleyin
2. DNS'te A kaydı oluşturun: `@ -> SUNUCU_IP`
3. SSL modunu "Flexible" yapın
4. `docker-compose.yml`'de REACT_APP_BACKEND_URL'i güncelleyin

---

## 🐛 SORUN GİDERME

### Konteynerler başlamıyor
```bash
docker-compose logs backend
docker-compose logs frontend
```

### MongoDB bağlantı hatası
```bash
docker-compose logs mongodb
docker-compose restart mongodb
```

### Port kullanımda hatası
```bash
# Hangi process kullanıyor?
netstat -tlnp | grep 80
netstat -tlnp | grep 8001

# Process'i durdur veya portu değiştir
```

### Disk dolu
```bash
# Docker temizliği
docker system prune -a
```

---

## 📊 KAYNAK KULLANIMI

Minimum gereksinimler:
- **RAM:** 1GB (2GB önerilir)
- **CPU:** 1 vCPU
- **Disk:** 10GB

---

## ✅ KURULUM TAMAMLANDI!

Site: `http://SUNUCU_IP`
Admin: `admin` / `admin123`
