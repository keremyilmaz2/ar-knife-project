# MindAR Marker Oluşturma Rehberi

## Yöntem 1: Online Compiler (Önerilen)

1. https://hiukim.github.io/mind-ar-js-doc/tools/compile adresine git
2. `public/targets/marker.svg` dosyasını veya marker.png'yi yükle
3. "Start" butonuna bas
4. İndirilen `targets.mind` dosyasını `public/targets/knife-marker.mind` olarak kaydet

## Yöntem 2: Programatik Derleme

```bash
npm install -g mind-ar
mindar-compile marker.png -o knife-marker.mind
```

## Marker Tasarım İpuçları

MindAR'ın iyi çalışması için marker:
- Yüksek kontrast olmalı
- Benzersiz özellikler içermeli (köşeler, desenler)
- En az 300x300 piksel olmalı
- Düz renklerden kaçınılmalı
- Simetrik olmamalı (tracking zorlaşır)

## Test Etme

1. `npm run dev` ile projeyi başlat
2. Marker görselini bir kağıda yazdır veya başka bir ekranda aç
3. iPhone'dan "AR Başlat" butonuna bas
4. Kamerayı marker'a doğrult
5. Bıçak modeli marker üzerinde görünmeli

## Sorun Giderme

- Marker bulunamıyorsa: Işık yetersiz olabilir
- Model görünmüyorsa: Console'u kontrol et
- iOS'ta kamera izni: Safari ayarlarından kontrol et
