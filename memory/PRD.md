# Kupon Paylaşma Scripti PRD

## Proje Özeti
Bahis danışmanlık kupon paylaşma ve yönetim platformu. Admin ve üye panelli, JWT authentication ile güvenli giriş sistemi.

## Kullanıcı Personaları
1. **Admin**: Kupon şablonları oluşturur, kullanıcıları yönetir, ödemeleri onaylar
2. **Üye (Kullanıcı)**: Kuponlarını görüntüler, para çekimi yapar

## Temel Gereksinimler (Statik)
- JWT tabanlı kimlik doğrulama
- Captcha ile güvenlik
- TL para birimi
- Admin paneli (kupon yönetimi, kullanıcı yönetimi, ödeme onayları)
- Üye paneli (kupon görüntüleme, para çekme)
- Western Union aktivasyon ödemesi (%7.5)
- MASAK prosedürü güvenlik kontrolü (%15)
- İletişim & IBAN ayarları

## Uygulanan Özellikler (31 Aralık 2025)

### Admin Paneli
- ✅ Dashboard (istatistikler)
- ✅ Kupon Şablonları Oluşturma/Silme
- ✅ Kayıtlı Kullanıcılar Yönetimi (onay/red/ekleme/silme)
- ✅ Para Çekim Talepleri (onay/red)
- ✅ Ödemeler/Dekont Kontrolü
- ✅ Western Union Onay
- ✅ MASAK Onay
- ✅ Aktivasyon Onay
- ✅ İletişim & Banka Ayarları (IBAN, WhatsApp)

### Üye Paneli
- ✅ Dashboard (bakiye, kupon önizleme)
- ✅ Kuponlarım (profesyonel BETLIVE temalı kupon görünümü)
- ✅ Para Çekme Akışı:
  - IBAN form girişi
  - Western Union ödeme sayfası (30 dk timer, %7.5 komisyon)
  - MASAK prosedürü sayfası (%15 vergi, bonus bilgisi)
  - İşlem İnceleniyor durumu
  - Tebrikler/Başarılı çekim mesajı

### Teknik Özellikler
- ✅ JWT Authentication
- ✅ Matematik captcha güvenlik sorusu
- ✅ MongoDB veritabanı
- ✅ FastAPI backend
- ✅ React frontend (Shadcn UI)
- ✅ Profesyonel koyu tema tasarım
- ✅ Responsive tasarım

## Öncelikli Backlog

### P0 (Kritik)
- Tamamlandı

### P1 (Yüksek)
- Dekont yükleme özelliği (dosya upload)
- Email/SMS bildirim sistemi
- Kullanıcı şifre sıfırlama

### P2 (Orta)
- Çoklu kupon desteği
- Raporlama ve analitik dashboard
- Kullanıcı aktivite logları

## Sonraki Görevler
1. Dekont yükleme için dosya upload özelliği ekle
2. WhatsApp buton entegrasyonu (iletişim için)
3. Admin tarafından kullanıcı bakiye manuel güncelleme
4. Export/import özelliği (kullanıcı ve kupon verileri için)
