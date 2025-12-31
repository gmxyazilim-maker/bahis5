# Kupon Paylaşma Scripti PRD

## Proje Özeti
Bahis danışmanlık kupon paylaşma ve yönetim platformu. Admin ve üye panelli, JWT authentication ile güvenli giriş sistemi.

## Kullanıcı Personaları
1. **Admin**: Kupon şablonları oluşturur, maç sonuçlarını girer, kullanıcıları yönetir, ödemeleri onaylar
2. **Üye (Kullanıcı/Müşteri)**: Kupon tutarı seçer, maçları görür, sonuçları bekler, kazanç çeker

## Temel Gereksinimler (Statik)
- JWT tabanlı kimlik doğrulama
- Captcha ile güvenlik
- TL para birimi
- Canlı renkli tema (beyaz, mavi, yeşil, mor)
- Admin paneli (kupon yönetimi, kullanıcı yönetimi, ödeme onayları)
- Üye paneli (kupon görüntüleme, para çekme)
- Kupon sonuçlarının gizlenmesi (admin açıklayana kadar)
- Western Union aktivasyon ödemesi (admin ayarlı %)
- MASAK prosedürü güvenlik kontrolü (admin ayarlı %)
- WhatsApp dekont gönderme entegrasyonu
- İletişim & IBAN ayarları

## Uygulanan Özellikler (31 Aralık 2025 - Güncellendi)

### Kayıt Sistemi
- ✅ Tutar seçimi butonları (1000, 2000, 3000, 4000, 5000 TL)
- ✅ Elle tutar girişi
- ✅ Captcha güvenlik sorusu

### Admin Paneli
- ✅ Dashboard (istatistikler) - Canlı renkli tasarım
- ✅ Kupon Şablonları Oluşturma/Silme/Düzenleme
- ✅ Kupon durumu değiştirme (Beklemede/Kazandı/Kaybetti)
- ✅ Kayıtlı Kullanıcılar Yönetimi
- ✅ **Kupon Sonuçlarını Gösterme** (Göz ikonu ile reveal)
- ✅ Para Çekim Talepleri (onay/red)
- ✅ Ödemeler/Dekont Kontrolü
- ✅ Western Union Onay
- ✅ MASAK Onay
- ✅ Aktivasyon Onay
- ✅ **Vergi/Komisyon Oranları Ayarı** (Western Union %, MASAK %, Bonus %)
- ✅ İletişim & Banka Ayarları (IBAN, WhatsApp)

### Üye Paneli
- ✅ Dashboard (bakiye gizli/görünür)
- ✅ **Kuponlarım - Sonuçlar Gizli** (Admin açıklayana kadar)
- ✅ Kuponlarım - Sonuçlar Görünür (Admin reveal ettikten sonra)
- ✅ Para Çekme Akışı:
  - IBAN form girişi
  - Western Union ödeme sayfası (admin ayarlı %)
  - **WhatsApp'tan dekont gönderme butonu**
  - MASAK prosedürü sayfası (admin ayarlı %)
  - **WhatsApp'tan dekont gönderme butonu**
  - İşlem İnceleniyor durumu
  - Tebrikler/Başarılı çekim mesajı

### Tasarım
- ✅ Canlı renkler (mavi, mor, yeşil, beyaz gradyanlar)
- ✅ Profesyonel BETLIVE temalı kupon tasarımı
- ✅ Responsive tasarım
- ✅ Glass morphism efektleri

## Akış Özeti

1. **Müşteri kayıt olur** → Tutar seçer (1000-5000 TL) → WhatsApp'tan dekont atar
2. **Admin onaylar** → Müşteri hesabına kupon atanır (sonuçlar gizli)
3. **Maçlar oynanır** → Müşteri sadece maçları görür, sonuçları GÖRMEZ
4. **Maçlar biter** → Admin skorları/oranları/kazancı girer → Kuponu "Kazandı" yapar
5. **Admin reveal eder** → Müşteri kupon sonuçlarını ve kazancı görür
6. **Müşteri çekim başlatır** → IBAN girer → Western Union ödemesi
7. **Müşteri WhatsApp'tan dekont atar** → Admin onaylar → MASAK prosedürü
8. **Müşteri WhatsApp'tan dekont atar** → Admin onaylar → Para aktarılır

## Öncelikli Backlog

### P0 (Kritik)
- Tamamlandı

### P1 (Yüksek)
- Dekont görsel yükleme (dosya upload)
- Email/SMS bildirim sistemi

### P2 (Orta)
- Çoklu kupon desteği
- Raporlama ve analitik dashboard
- Kullanıcı aktivite logları

## Giriş Bilgileri
- **Admin:** `admin` / `admin123`
- **Test Müşteri:** `musteri1` / `123456`
