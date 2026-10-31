# LojiTR · Yeni Nesil Akıllı Filo, Sefer ve Nakliye Yönetim Platformu

[![Vitest](https://img.shields.io/badge/Vitest-17%2F17%20Passing-brightgreen?style=flat-square&logo=vitest)](https://vitest.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-indigo?style=flat-square)](#)

LojiTR, Türkiye nakliye, lojistik ve filo operasyonlarının tüm operasyonel, hesapsal ve finansal dinamiklerine özel olarak geliştirilmiş kurumsal SaaS ve Nakliye Yönetim Sistemidir (TMS).

---

## 🌟 V3 Algoritmik ve Matematiksel Derinlik

LojiTR V3 mimarisi, yüzeysel CRUD panellerinin ötesinde derin matematiksel motorlarla güçlendirilmiştir:

### 1. 3-Bilinmeyenli Yakıt Telemetri Çözücüsü (`solveFuelEquation`)
- **Denklem:** $\text{Tutar} = \text{Litre} \times \text{Birim Fiyat}$
- Kullanıcı herhangi iki parametreyi girdiğinde üçüncü bilinmeyen otomatik olarak çözülür.
- **Formül Örnekleri:**
  - $Litre = \frac{Tutar}{Birim Fiyat}$
  - $Tutar = Litre \times Birim Fiyat$
  - $Birim Fiyat = \frac{Tutar}{Litre}$

### 2. Delta KM Tüketim Fiziği & Yakıt Hırsızlık Tespiti (`calculateFuelConsumption`)
- Önceki KM ($KM_1$) ve Sonraki KM ($KM_2$) farkından net mesafe: $\Delta KM = KM_2 - KM_1$
- 100 KM Başına Tüketim: $T = \frac{Litre \times 100}{\Delta KM}$
- KM Başına Yakıt Maliyeti: $M_{KM} = \frac{Tutar}{\Delta KM}$
- **Anomali ve Yakıt Hırsızlığı Tespiti:** Araç tipi, tonaj ve mevsim katsayılarına göre standart normlardan (örneğin 40 ton yüklü çekici için 32-38 LT/100 KM) sapma gösteren tüketimler anında **Kırmızı Hırsızlık/Kaçak Alarmı** veya **Turuncu Aşırı Sarfiyat Uyarısı** olarak işaretlenir.

### 3. Türkiye 81 İl Rota ve Mesafe Matrisi (`lookupRouteInfo` & `solveKmTriangle`)
- Türkiye'nin 81 ili arasındaki resmi karayolu mesafe matrisi ve köprü/otoyol geçiş ücreti projeksiyonu.
- Sefer başlangıç, ara durak ve varış noktalarındaki KM tutarsızlıklarını çözen üçgen kontrol algoritması.

### 4. Canlı Sefer Başabaş (Break-Even) & Kârlılık Simülatörü (`simulateTripBreakEven`)
- Yakıt, AdBlue, HGS/otoyol, şoför harcırahı, lastik amortismanı ve genel gider payını birleştirerek bir seferin zarar etmemesi için gereken minimum navlun tutarını ve başabaş navlunu hesaplar.

### 5. Görsel Çift Teker Dingil Simetrisi & Lastik Aşınma Motoru (`analyzeTireWear`)
- Kuşbakışı şasi üzerinde steer (ön) ve drive (çeker çift teker) lastiklerinin diş derinliği ($mm$) ölçümleri.
- Aynı dingildeki iç ve dış lastikler arasındaki aşınma farkını denetleyerek diferansiyel kilitlenme riskini önceden tespit eder ($>1.5\text{ mm}$ farkta rotasyon önerisi).

### 6. Çift Kriterli Kestirimci Bakım Motoru (`predictMaintenanceSchedule`)
- Hem KM sınırını ($KM_{kalan} = KM_{hedef} - KM_{guncel}$) hem de takvim süresini gün bazında izleyen ve önce dolana göre aciliyet sırası belirleyen hibrit bakım algoritması.

### 7. Dinamik Cari Hesap Ekstresi & Borç/Alacak Defteri (`computeDynamicAccountLedger`)
- Alacak, borç, fatura, tevkifat ve tahsilat hareketlerini kronolojik sırada işleyip her satırda dinamik bakiye hesaplayan muhasebe defteri motoru.

### 8. Müşteri Kredi Risk Puanlaması & Faktoring İskonto Motoru (`scoreContactCreditRisk`)
- 100 üzerinden firma kredi risk skoru ve çek kırdırma / erken tahsilat faktoring iskonto simülasyonu.

---

## 🖨️ A4 Resmi Çıktı & e-Belge Motoru

- **GİB Uyumlu e-Fatura Şablonu:** 2/10 Yük Taşımacılığı KDV Tevkifatı, matrah, hesaplanan KDV, tevkif edilen KDV ve ödenecek net navlun dökümü.
- **Resmi Şoför Hakediş & İbraname Fişi:** Sefer navlunu, prim, avans, sefer masrafları ve net ödenecek şoför hakedişini yasal formatta A4 çıktısına dönüştürür.
- **Rakamı Türkçe Yazıya Çevirme (`numberToTurkishWords`):** Fatura altındaki resmi tutarı kuruş hanesiyle birlikte hatasız Türkçe metne çevirir.

---

## 🌐 Müstakil Tanıtım Anasayfası (`/tanitim`)

Kullanıcıların ve potansiyel müşterilerin sistemi interaktif olarak deneyimleyebileceği müstakil pazarlama sayfası:
- **3 Canlı İnteraktif Hesap Makinesi:**
  1. *3-Yönlü Yakıt Telemetri Çözücü*
  2. *Sefer Başabaş & 2/10 Tevkifat Simülatörü*
  3. *Filo ROI & Yıllık Tasarruf Hesaplayıcı*
- **12 Temel Modül Bento Izgarası**
- **Şeffaf Yıllık Abonelik Kartları**
- **Akordeon Sıkça Sorulan Sorular (SSS)**

---

## 🎨 Modern Açık Tema (Default Light Theme)

- Uzun süreli filo operasyonlarında göz yormayan, ferah ve modern Açık Tema varsayılan olarak aktiftir.
- Kullanıcı dilediğinde Ayarlar sayfasından veya Gece Modu geçişiyle Koyu Temayı (Dark Theme) seçebilir.
- Tercihler `localStorage` üzerinden kalıcı olarak saklanır.

---

## 🧪 Testler ve Doğrulama

Vitest ile yazılmış 17 kapsamlı birim test:

```bash
npm test
```

```text
 ✓ src/domain/math/__tests__/v3Algorithms.test.ts (17 tests) 16ms

 Test Files  1 passed (1)
      Tests  17 passed (17)
```

---

## 📦 Kurulum ve Çalıştırma

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Geliştirme sunucusunu başlatın
npm run dev

# 3. Birim testleri çalıştırın
npm test

# 4. Üretim derlemesi oluşturun
npm run build
```

© 2026 LojiTR Bilişim ve Lojistik Teknolojileri A.Ş. Tüm hakları saklıdır.
