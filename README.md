# LojiTR · Yeni Nesil Filo, Nakliye ve Sefer Yönetim Platformu

LojiTR, Türkiye nakliye ve lojistik sektörünün ihtiyaçlarına özel olarak geliştirilmiş modern, yapay zeka destekli ve tam kapsamlı bir Filo ve Sefer Yönetim (TMS / SaaS) platformudur.

## 🚀 Öne Çıkan Özellikler

1. **KDV & 2/10 Taşımacılık Tevkifat Motoru:** Navlun, hesaplanan KDV, tevkifat tutarı, komisyoncu ve taşeron payları kuruşu kuruşuna anında hesaplanır.
2. **Yapay Zeka / Kamera ile Fiş OCR:** Tesseract WASM motoru ile akaryakıt fişlerinin fotoğrafından tutar, litre, birim fiyat ve istasyon adı otomatik okunur.
3. **Şoför Mobil Uygulaması & Türkçe Sesli Komut (NLP):** Şoförlerin doğal dilde sesli komutla ("Gebze'den İskenderun'a 45 bin") sefer ve masraf girebilmesi.
4. **12 Haftalık Nakit Akışı Tahmini & 60 Günlük Finans Ajandası:** Çekler, senetler, krediler ve sefer vadeleri birleşir; kasanın eksiye düşeceği haftalar önceden tespit edilir.
5. **Görsel Lastik Şasisi & Aşınma Haritası:** Kuşbakışı şasi üzerinde lastik konumları, diş derinliği (mm) ölçümleri ve 3.0 mm altı kritik aşınma uyarıları.
6. **Akıllı Excel Defter İçe Aktarma:** Çok sekmeli (Ocak..Aralık) Excel tablolarından sefer, masraf ve 18 kategori otomatik sınıflandırılır.
7. **Dijital POD & QR Kodlu Belge Doğrulama:** HTML5 dokunmatik e-İmza ile teslimat tutanağı ve herkesin sorgulayabileceği `/dogrula/:token` doğrulama altyapısı.

## 🛠️ Teknoloji Yığını

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, Zustand, TanStack Query
- **Veritabanı & Backend:** Supabase (PostgreSQL 38 tablo, 4 view, 18 RPC fonksiyonu, RLS politikaları, Storage & Edge Functions)
- **OCR:** Tesseract.js WASM + HTML5 Canvas ITU-R BT.601 Kontrast Germe
- **Doğal Dil:** Türkçe hal eki temizleme ve sayı kelimeleri çözümleyici NLP

## 📦 Kurulum ve Çalıştırma

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Üretim derlemesi
npm run build
```

© 2026 LojiTR Bilişim ve Lojistik Teknolojileri A.Ş. Tüm hakları saklıdır.
