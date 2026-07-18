# PrepTürk

<p align="center">
  <img src="apps/web/public/logo.png" width="256" alt="PrepTürk Taktik Logo">
</p>

<p align="center">
  <a href="README.md">🇬🇧 English</a> | <a href="README.tr.md">🇹🇷 Türkçe</a> | <a href="README.ru.md">🇷🇺 Русский</a> | <a href="README.ar.md">🇸🇾 العربية</a>
</p>

> **Türkiye'nin Tam Bağımsız Çevrimdışı Hazırlık Komuta Merkezi**
>
> 🇹🇷 *Türkiye İçin Çevrimdışı Bilgi, Eğitim, Resmî Belge ve Dayanıklılık Sistemi*
>
> _Şebekenin çökeceğini varsayın. Verinize sahip çıkın. Topluluğunuzu koruyun._

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-green.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/downloads/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Offline-First](https://img.shields.io/badge/Airgapped-Ready-orange.svg)](#offline-first-design)

---

## 🛑 Problem

2023 depremleri gibi büyük bir kriz vurduğunda, çantada keklik sandığımız dijital altyapı ortadan kaybolur. Baz istasyonları çöker. Devlet portalları çevrimdışı kalır. Kritik müdahale protokolleri, tam da en çok ihtiyaç duyulduğu anda erişilemez hale gelir. Topluluklar kör kalır; mahalle toplanma alanlarını, kritik ilk yardım prosedürlerini veya resmi afet müdahale planlarını bulamazlar.

## 🛡️ Çözüm

**PrepTürk**, Türkiye'nin risk profili için özel olarak tasarlanmış tavizsiz, önceliği çevrimdışı kullanım olan bir istihbarat ve hayatta kalma platformudur. Bu bir bulut hizmeti değildir. Tamamen kendi donanımınız üzerinde çalışan egemen bir komuta merkezidir.

Yerel içerik ve modeller hazırlandıktan sonra PrepTürk, dış internet bağımlılığı olmadan çalışmaya devam edebilir. Ağ yalıtımı, dağıtım ortamındaki güvenlik duvarı ve ana makine kontrolleriyle ayrıca doğrulanmalıdır. Sistem şunları sağlar:
*   Resmi hükümet yönergelerine anında erişim (AFAD, Sağlık Bakanlığı, MEB).
*   Yerel belge depolarında yapay zeka destekli anlamsal (semantic) arama.
*   Türkiye gerçeklerine uyarlanmış hayat kurtaran tıbbi ve hayatta kalma protokolleri.
*   Uzun süreli kesintilerde çocukların eğitimine devam etmesi için eğitim kaynakları.
*   Ailenizin kritik belgeleri için kriptografik, özel bir kasa.

İster bir acil durum çantasındaki Raspberry Pi'ye, ister bir ev sunucusuna veya eski bir dizüstü bilgisayara kurun. Şebeke çöktüğünde PrepTürk ayakta kalır.

---

## ⚡ Temel Yetenekler

PrepTürk, 6 kritik operasyonel alanda **45 benzersiz özelliği** kapsayan uyumlu ve birleşik bir gösterge paneli sunar.

### 1. Acil Durum ve Kriz Komutası
*   **Sıfır Gecikmeli SOS**: Kritik çevrimdışı prosedürleri ve numaraları (112, 110, 155, 156, 177) anında ekrana getirir.
*   **Prosedür Kontrol Listeleri**: Deprem, Yangın, Sel ve KBRN tehditleri için uygulanabilir, adım adım yanıtlar.
*   **Toplanma Alanları**: 81 il için resmi toplanma alanlarının hiper yerel haritalandırması.

### 2. Doğrulanmış Sağlık ve Tıbbi İstihbarat
*   **Kesin Kaynak**: Tüm tıbbi tavsiyeler kesinlikle T.C. Sağlık Bakanlığı ve AFAD kaynaklarından aynen yansıtılır.
*   **Semptom Kontrolü**: Teşhis koymak için değil, *112'nin ne zaman aranacağını* belirlemek için tasarlanmış muhafazakar bir triyaj motoru.
*   **Kronik Durum Yönetimi**: Diyabet, Hipertansiyon, Astım ve daha fazlası için detaylı acil durum protokolleri.

### 3. Hayatta Kalma ve Kaynak Yönetimi
*   **Kaynak Hesaplayıcıları**: Yerel ilinize göre güneş paneli verimini ve pil çalışma sürelerini doğru bir şekilde tahmin eder.
*   **Beslenme Rehberleri**: Su arıtma yöntemleri ve geleneksel Türk gıda saklama teknikleri.
*   **Envanter Takibi**: Ev stoklarınızı (su, yakıt, ilaç) görsel tükenme uyarılarıyla izleyin.

### 4. Egemen Yapay Zeka Asistanı (Yerel YZ)
*   **%100 İnternetsiz**: Ollama tarafından desteklenir. Sorgularınız asla cihazınızı terk etmez.
*   **RAG Entegrasyonu**: Asistan, yerel olarak depolanmış resmi belgelerinize çapraz referans vererek soruları yanıtlar ve kaynak gösterir.
*   **Güvenlik Sınırları**: Acil durumlarda tıbbi teşhis koymayı reddedecek ve agresif bir şekilde resmi protokollere öncelik verecek şekilde donanımsal kodlanmıştır.

### 5. Eğitim ve Süreklilik
*   **Kesintisiz Öğrenme**: MEB ders kitabı kataloglarını ve etkileşimli materyalleri barındırır.
*   **Sınav Hazırlığı**: LGS, YKS ve KPSS için entegre çalışma zamanlayıcıları ve geri sayımlar.
*   **Çocuklar İçin Güvenli Mod**: Stresli olaylar sırasında dili basitleştiren ve genç kullanıcılar için içeriği düzenleyen özel bir kullanıcı arayüzü.

### 6. Kişisel Şifreli Kasa
*   **AES-256-GCM Güvenliği**: Ailenizin tapularını, kimliklerini ve finansal kayıtlarını yerel olarak şifrelenmiş bir ortamda saklayın.
*   **Yazdırılabilir Hazırlık Paketleri**: Acil durum planlarınızın ve çocuk kimlik kartlarınızın fiziksel kağıt yedeklerini tek bir tıklamayla oluşturun.

---

## 🏗️ Mimari

PrepTürk, aşırı taşınabilirlik ve düşük kaynak kullanımı için tasarlanmış esnek ve modern bir teknoloji yığını üzerine inşa edilmiştir.

*   **Frontend**: Next.js 15 (React 19) — Güçlü önbelleğe alma ve çevrimdışı PWA özellikleriyle hızlı, uygulama benzeri bir deneyim sağlar.
*   **Backend**: FastAPI (Python 3.12) — Belge alımı, arama ve AI orkestrasyonunu işleyen yüksek performanslı asenkron API.
*   **Veritabanı**: PostgreSQL 16 — Kullanıcı rollerini, belge meta verilerini ve tam metin aramayı (FTS) yönetir.
*   **Vektör Arama**: Qdrant — Işık hızında anlamsal (semantic) arama ve RAG yetenekleri sağlar.
*   **Yerel YZ**: Ollama — Optimize edilmiş LLM'leri (örneğin `qwen2.5:0.5b-instruct`) CPU veya GPU üzerinde yerel olarak çalıştırır.
*   **Dağıtım**: Linux, macOS ve Windows'ta tek tıklamayla dağıtım için Docker Compose ile tamamen kapsayıcı (container) mimarisi.

---

## 🔒 OPSEC ve Güvenlik Modeli

Verilerinize ve güvenliğinize en yüksek paranoyayla yaklaşıyoruz.

*   **İnternetsiz (Airgap) Mod**: `AIRGAP_MODE`, arka plan çalışanlarındaki zamanlanmış dış kaynak alımını devre dışı bırakır. Gerçek dış ağ yalıtımı, ana makine, konteyner ve güvenlik duvarı kurallarıyla uygulanır.
*   **Ağ İzolasyonu**: API, tarayıcının harici analitik, yazı tipi veya izleme komut dosyalarını aramasını önleyen agresif bir `Content-Security-Policy (CSP)` uygular.
*   **Sadece Yerel Yazı Tipleri**: Google Yazı Tiplerine güvenilmez. UI, çevrimdışı ortamda kusursuz oluşturma sağlamak için yerel sistem yazı tiplerini kullanır.
*   **Telemetri Yok**: Next.js telemetrisi kalıcı olarak devre dışıdır.
*   **Sıfır Güven (Zero-Trust) Kurulumu**: Kutudan çıktığı andan itibaren güvenli şifre yapılandırması gerektirir; isteğe bağlı TOTP 2FA ile JWT kimlik doğrulaması.

---

## 🚀 Hızlı Başlangıç

**Minimum Gereksinimler:** 4GB RAM, 2 çekirdekli CPU, 20GB Depolama. (Yerel AI özellikleri için 16GB RAM önerilir).

### 1. Klonla ve Yapılandır
```bash
git clone https://github.com/akgularda/prepturk.git
cd prepturk
cp .env.example .env
```
*`APP_SECRET_KEY` ve veritabanı şifrelerinizi ayarlamak için `.env` dosyasını düzenleyin.*

### 2. Dağıt
```bash
docker compose up -d
```

### 3. Başlat
İlk kurulum sihirbazını tamamlamak, yönetici hesabınızı oluşturmak ve resmi belgelerin ilk yerel senkronizasyonunu tetiklemek için tarayıcınızda `http://localhost:3000` adresine gidin.

---

## 🤝 Katkıda Bulunma

PrepTürk, Türk halkının dayanıklılığına adanmış açık kaynaklı bir projedir. Adaptörler, il paketleri, kullanıcı arayüzü geliştirmeleri ve belgelendirme konusundaki katkıları memnuniyetle karşılıyoruz.

1. Depoyu fork'layın.
2. Bir özellik dalı (feature branch) oluşturun (`git checkout -b feature/harika-ozellik`).
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Harika özellik eklendi'`).
4. Dalı push'layın (`git push origin feature/harika-ozellik`).
5. Bir Pull Request açın.

---

## ⚖️ Lisans ve Sorumluluk Reddi

**PrepTürk**, [AGPL-3.0 Lisansı](LICENSE) altındadır.

**SORUMLULUK REDDİ:** Bu yazılım yalnızca bilgilendirme ve hazırlık amacıyla sağlanmıştır. Resmi acil durum hizmetlerinin, profesyonel tıbbi tavsiyelerin veya hükümet yönergelerinin yerine geçmez. Türkiye'deki herhangi bir acil durumda **her zaman 112'yi arayın** ve AFAD ile yerel yetkililerin talimatlarını izleyin.

---
<p align="center">
  <i>Deprem bölgelerindeki vatandaşlarımıza adanmıştır.</i><br>
  <b>Türkiye için, Türkiye'den.</b>
</p>
