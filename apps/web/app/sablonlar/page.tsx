'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { MessageSquare, Printer, Copy, Check, Phone, AlertTriangle, Search, Heart, Building, MapPin, Clipboard, FileText } from 'lucide-react';

interface TemplateField {
  key: string;
  label: string;
  labelEn: string;
  type: 'text' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface Template {
  id: string;
  title: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  description: string;
  fields: TemplateField[];
  generate: (values: Record<string, string>) => string;
  generatePrint: (values: Record<string, string>) => string;
}

function formatNow(): string {
  return new Date().toLocaleString('tr-TR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

const TEMPLATES: Template[] = [
  {
    id: 'guvendeyim',
    title: 'Güvendeyim',
    titleEn: "I'm Safe",
    icon: Phone,
    iconColor: 'text-green-400',
    description: 'Ailenize ve yakınlarınıza güvende olduğunuzu bildirin',
    fields: [
      { key: 'isim', label: 'İsim', labelEn: 'Name', type: 'text', placeholder: 'Adınız Soyadınız' },
      { key: 'konum', label: 'Konum', labelEn: 'Location', type: 'text', placeholder: 'Bulunduğunuz yer' },
      {
        key: 'ihtiyac', label: 'İhtiyaç', labelEn: 'Need', type: 'select',
        options: [
          { value: 'yok', label: 'İhtiyacım yok' },
          { value: 'su', label: 'Su lazım' },
          { value: 'yiyecek', label: 'Yiyecek lazım' },
          { value: 'ilac', label: 'İlaç lazım' },
          { value: 'barinak', label: 'Barınak lazım' },
        ]
      },
      { key: 'aileMesaj', label: 'Ailem için Mesaj', labelEn: 'Message for family', type: 'text', placeholder: 'Ailenize mesajınız...' },
    ],
    generate: (v) => {
      return `GÜVENDEYİM MESAJI
İsim: ${v.isim || '[isim]'}
Konumum: ${v.konum || '[yer]'}
İhtiyacım: ${v.ihtiyac || 'yok'}
Tarih: ${formatNow()}

Ailem için: ${v.aileMesaj || '[mesaj]'}`;
    },
    generatePrint: (v) => {
      return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Güvendeyim</title>
<style>body{font-family:Arial,sans-serif;max-width:500px;margin:30px auto;padding:20px;color:#000}h1{font-size:28px;text-align:center;border:3px solid #22c55e;padding:16px;margin-bottom:20px;background:#f0fdf4}p{font-size:18px;line-height:1.8;margin:8px 0}.label{font-weight:bold}.footer{margin-top:30px;font-size:12px;color:#666;text-align:center;border-top:1px solid #ccc;padding-top:8px}@media print{body{margin:0}}</style></head><body>
<h1>GÜVENDEYİM / I'M SAFE</h1>
<p><span class="label">İsim:</span> ${v.isim || '[isim]'}</p>
<p><span class="label">Konum:</span> ${v.konum || '[yer]'}</p>
<p><span class="label">İhtiyaç:</span> ${v.ihtiyac || 'yok'}</p>
<p><span class="label">Tarih:</span> ${formatNow()}</p>
<p><span class="label">Mesaj:</span> ${v.aileMesaj || '[mesaj]'}</p>
<div class="footer">PrepTürk -- ${formatNow()}</div></body></html>`;
    },
  },
  {
    id: 'yardim',
    title: 'Yardım Lazım',
    titleEn: 'Need Help',
    icon: AlertTriangle,
    iconColor: 'text-red-400',
    description: 'Acil yardım çağrısı gönderin',
    fields: [
      { key: 'isim', label: 'İsim', labelEn: 'Name', type: 'text', placeholder: 'Adınız Soyadınız' },
      { key: 'adres', label: 'Adres', labelEn: 'Address', type: 'text', placeholder: 'Açık adresiniz' },
      {
        key: 'durum', label: 'Durum', labelEn: 'Status', type: 'select',
        options: [
          { value: 'yarali', label: 'Yaralı var' },
          { value: 'mahsurum', label: 'Mahsurum' },
          { value: 'saglik', label: 'Sağlık sorunu' },
          { value: 'bina-hasarli', label: 'Bina hasarlı' },
          { value: 'sel', label: 'Sel tehlikesi' },
        ]
      },
      {
        key: 'ihtiyac', label: 'İhtiyaç', labelEn: 'Need', type: 'select',
        options: [
          { value: 'ambulance', label: 'Ambulans' },
          { value: 'arama-kurtarma', label: 'Arama Kurtarma' },
          { value: 'su', label: 'Su' },
          { value: 'yardim-ekibi', label: 'Yardım Ekibi' },
        ]
      },
      { key: 'kisiSayisi', label: 'Kişi Sayısı', labelEn: 'Number of people', type: 'text', placeholder: 'Etkilenen kişi sayısı' },
    ],
    generate: (v) => {
      return `YARDIM ÇAĞRISI
İsim: ${v.isim || '[isim]'}
Konum: ${v.adres || '[adres]'}
Durum: ${v.durum || '[durum]'}
İhtiyaç: ${v.ihtiyac || '[ihtiyac]'}
Kişi sayısı: ${v.kisiSayisi || '[sayi]'}`;
    },
    generatePrint: (v) => {
      return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Yardım Çağrısı</title>
<style>body{font-family:Arial,sans-serif;max-width:500px;margin:30px auto;padding:20px;color:#000}h1{font-size:28px;text-align:center;border:3px solid #ef4444;padding:16px;margin-bottom:20px;background:#fef2f2}p{font-size:18px;line-height:1.8;margin:8px 0}.label{font-weight:bold}.urg{font-size:22px;text-align:center;padding:12px;background:#fee2e2;border:2px solid #ef4444;margin:16px 0}.footer{margin-top:30px;font-size:12px;color:#666;text-align:center;border-top:1px solid #ccc;padding-top:8px}@media print{body{margin:0}}</style></head><body>
<h1>YARDIM ÇAĞRISI / HELP NEEDED</h1>
<p><span class="label">İsim:</span> ${v.isim || '[isim]'}</p>
<p><span class="label">Konum:</span> ${v.adres || '[adres]'}</p>
<p><span class="label">Durum:</span> ${v.durum || '[durum]'}</p>
<p><span class="label">İhtiyaç:</span> ${v.ihtiyac || '[ihtiyac]'}</p>
<p><span class="label">Kişi Sayısı:</span> ${v.kisiSayisi || '[sayi]'}</p>
<div class="urg">ACİL -- 112&apos;YI ARAYIN</div>
<div class="footer">PrepTürk -- ${formatNow()}</div></body></html>`;
    },
  },
  {
    id: 'kayip',
    title: 'Kayıp Raporu',
    titleEn: 'Missing Person',
    icon: Search,
    iconColor: 'text-amber-400',
    description: 'Kayıp yakınları için rapor oluşturun',
    fields: [
      { key: 'isim', label: 'Kayıp İsim', labelEn: 'Missing person name', type: 'text', placeholder: 'Kayıp kişinin adı' },
      { key: 'yas', label: 'Yaş', labelEn: 'Age', type: 'text', placeholder: 'Yaşı' },
      { key: 'boy', label: 'Boy', labelEn: 'Height', type: 'text', placeholder: 'Boyu (cm)' },
      { key: 'sacRengi', label: 'Saç Rengi', labelEn: 'Hair color', type: 'text', placeholder: 'Saç rengi' },
      { key: 'sonYer', label: 'Son Görüldüğü Yer', labelEn: 'Last seen location', type: 'text', placeholder: 'En son nerede görüldü' },
      { key: 'sonZaman', label: 'Son Görüldüğü Zaman', labelEn: 'Last seen time', type: 'text', placeholder: 'Ne zaman görüldü' },
      { key: 'ozellikler', label: 'Ayırt Edici Özellikler', labelEn: 'Distinguishing features', type: 'text', placeholder: 'Özel işaretler, giysiler, vs.' },
      { key: 'iletisim', label: 'İletişim', labelEn: 'Contact', type: 'text', placeholder: 'Telefon numaranız' },
    ],
    generate: (v) => {
      return `KAYIP RAPORU
İsim: ${v.isim || '[isim]'}
Yaş: ${v.yas || '[yas]'}
Boy: ${v.boy || '[boy]'}
Saç rengi: ${v.sacRengi || '[renk]'}
Son görüldüğü yer: ${v.sonYer || '[yer]'}
Son görüldüğü zaman: ${v.sonZaman || '[zaman]'}
Özellikler: ${v.ozellikler || '[ozellik]'}
İletişim: ${v.iletisim || '[tel]'}`;
    },
    generatePrint: (v) => {
      return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Kayıp Raporu</title>
<style>body{font-family:Arial,sans-serif;max-width:500px;margin:30px auto;padding:20px;color:#000}h1{font-size:28px;text-align:center;border:3px solid #f59e0b;padding:16px;margin-bottom:20px;background:#fffbeb}p{font-size:16px;line-height:1.8;margin:6px 0}.label{font-weight:bold}.footer{margin-top:30px;font-size:12px;color:#666;text-align:center;border-top:1px solid #ccc;padding-top:8px}@media print{body{margin:0}}</style></head><body>
<h1>KAYIP RAPORU / MISSING PERSON</h1>
<p><span class="label">İsim:</span> ${v.isim || '[isim]'}</p>
<p><span class="label">Yaş:</span> ${v.yas || '[yas]'}</p>
<p><span class="label">Boy:</span> ${v.boy || '[boy]'}</p>
<p><span class="label">Saç Rengi:</span> ${v.sacRengi || '[renk]'}</p>
<p><span class="label">Son Yer:</span> ${v.sonYer || '[yer]'}</p>
<p><span class="label">Son Zaman:</span> ${v.sonZaman || '[zaman]'}</p>
<p><span class="label">Özellikler:</span> ${v.ozellikler || '[ozellik]'}</p>
<p><span class="label">İletişim:</span> ${v.iletisim || '[tel]'}</p>
<div class="footer">PrepTürk -- ${formatNow()}</div></body></html>`;
    },
  },
  {
    id: 'hasar',
    title: 'Hasar Raporu',
    titleEn: 'Building Damage',
    icon: Building,
    iconColor: 'text-orange-400',
    description: 'Bina hasarını raporlayın',
    fields: [
      { key: 'adres', label: 'Adres', labelEn: 'Address', type: 'text', placeholder: 'Bina adresi' },
      {
        key: 'binaTipi', label: 'Bina Tipi', labelEn: 'Building type', type: 'select',
        options: [
          { value: 'beton', label: 'Betonarme' },
          { value: 'tugla', label: 'Tuğla' },
          { value: 'ahsap', label: 'Ahşap' },
          { value: 'prefabrik', label: 'Prefabrik' },
        ]
      },
      { key: 'katSayisi', label: 'Kat Sayısı', labelEn: 'Number of floors', type: 'text', placeholder: 'Bina kat sayısı' },
      {
        key: 'hasar', label: 'Hasar Durumu', labelEn: 'Damage level', type: 'select',
        options: [
          { value: 'hafif', label: 'Hafif (çatlaklar)' },
          { value: 'orta', label: 'Orta (yapısal hasar)' },
          { value: 'agir', label: 'Ağır (kısmi çökme)' },
          { value: 'yikildi', label: 'Tam yıkıldı' },
        ]
      },
      {
        key: 'tehlike', label: 'Tehlike', labelEn: 'Hazard', type: 'select',
        options: [
          { value: 'yok', label: 'Yok' },
          { value: 'gaz', label: 'Gaz kaçağı' },
          { value: 'elektrik', label: 'Elektrik tehlikesi' },
          { value: 'cokme', label: 'Çökme tehlikesi' },
          { value: 'gaz+elektrik', label: 'Gaz + Elektrik' },
        ]
      },
      { key: 'icerde', label: 'İçerde İnsan Var Mı?', labelEn: 'People inside?', type: 'select', options: [
        { value: 'evet', label: 'Evet' },
        { value: 'hayir', label: 'Hayır' },
        { value: 'bilinmiyor', label: 'Bilinmiyor' },
      ]},
      { key: 'icerdeSayi', label: 'Tahmini Sayı', labelEn: 'Estimated number', type: 'text', placeholder: 'İçerde tahmini kişi sayısı' },
    ],
    generate: (v) => {
      return `BİNA HASAR RAPORU
Adres: ${v.adres || '[adres]'}
Bina tipi: ${v.binaTipi || '[beton/tuğla/ahşap]'}
Kat sayısı: ${v.katSayisi || '[sayı]'}
Hasar: ${v.hasar || '[hafif/orta/ağır/yıkıldı]'}
Tehlike: ${v.tehlike || '[gaz/elektrik/çökme]'}
İçerde insan: ${v.icerde || '[evet/hayır]'}${v.icerde === 'evet' ? ` -- Tahmini sayı: ${v.icerdeSayi || '?'}` : ''}`;
    },
    generatePrint: (v) => {
      return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Hasar Raporu</title>
<style>body{font-family:Arial,sans-serif;max-width:500px;margin:30px auto;padding:20px;color:#000}h1{font-size:24px;text-align:center;border:3px solid #f97316;padding:16px;margin-bottom:20px;background:#fff7ed}p{font-size:16px;line-height:1.8;margin:6px 0}.label{font-weight:bold}.danger{font-size:20px;text-align:center;padding:12px;background:#fee2e2;border:2px solid #ef4444;margin:16px 0}.footer{margin-top:30px;font-size:12px;color:#666;text-align:center;border-top:1px solid #ccc;padding-top:8px}@media print{body{margin:0}}</style></head><body>
<h1>BİNA HASAR RAPORU</h1>
<p><span class="label">Adres:</span> ${v.adres || '[adres]'}</p>
<p><span class="label">Bina Tipi:</span> ${v.binaTipi || '[tip]'}</p>
<p><span class="label">Kat Sayısı:</span> ${v.katSayisi || '[sayı]'}</p>
<p><span class="label">Hasar:</span> ${v.hasar || '[durum]'}</p>
<p><span class="label">Tehlike:</span> ${v.tehlike || '[tehlike]'}</p>
<p><span class="label">İçerde İnsan:</span> ${v.icerde || '[evet/hayır]'}</p>
${v.icerde === 'evet' ? `<p><span class="label">Sayı:</span> ${v.icerdeSayi || '?'}</p>` : ''}
<div class="danger">TEHLİKE: Gerekli önlemleri alın!</div>
<div class="footer">PrepTürk -- ${formatNow()}</div></body></html>`;
    },
  },
  {
    id: 'saglik',
    title: 'Sağlık Talebi',
    titleEn: 'Medical Request',
    icon: Heart,
    iconColor: 'text-pink-400',
    description: 'Sağlık yardımı talebi oluşturun',
    fields: [
      { key: 'isim', label: 'Hasta İsmi', labelEn: 'Patient name', type: 'text', placeholder: 'Hastanın adı' },
      { key: 'yas', label: 'Yaş', labelEn: 'Age', type: 'text', placeholder: 'Hastanın yaşı' },
      {
        key: 'durum', label: 'Aciliyet', labelEn: 'Urgency', type: 'select',
        options: [
          { value: 'acil', label: 'ACİL (hayati tehlike)' },
          { value: 'orta', label: 'Orta (doktor gerekli)' },
          { value: 'hafif', label: 'Hafif (ilk yardım yeterli)' },
        ]
      },
      { key: 'belirtiler', label: 'Belirtiler', labelEn: 'Symptoms', type: 'text', placeholder: 'Hasta semptomları' },
      { key: 'alerji', label: 'Alerji', labelEn: 'Allergies', type: 'text', placeholder: 'Bilinen alerjiler' },
      { key: 'kanGrubu', label: 'Kan Grubu', labelEn: 'Blood type', type: 'text', placeholder: 'A+, B-, O+, vs.' },
      { key: 'ilaclar', label: 'Kullanılan İlaçlar', labelEn: 'Current medications', type: 'text', placeholder: 'Halihazırda kullanılan ilaçlar' },
      { key: 'iletisim', label: 'İletişim', labelEn: 'Contact', type: 'text', placeholder: 'Yakın telefon numarası' },
    ],
    generate: (v) => {
      return `SAĞLIK YARDIM
Hasta: ${v.isim || '[isim]'}
Yaş: ${v.yas || '[yas]'}
Durum: ${v.durum || '[acil/orta/hafif]'}
Belirtiler: ${v.belirtiler || '[belirtiler]'}
Alerji: ${v.alerji || '[alerji]'}
Kan grubu: ${v.kanGrubu || '[grup]'}
İlaçlar: ${v.ilaclar || '[ilaclar]'}
İletişim: ${v.iletisim || '[tel]'}`;
    },
    generatePrint: (v) => {
      return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Sağlık Talebi</title>
<style>body{font-family:Arial,sans-serif;max-width:500px;margin:30px auto;padding:20px;color:#000}h1{font-size:24px;text-align:center;border:3px solid #ec4899;padding:16px;margin-bottom:20px;background:#fdf2f8}p{font-size:16px;line-height:1.8;margin:6px 0}.label{font-weight:bold}.critical{font-size:22px;text-align:center;padding:12px;background:#fee2e2;border:2px solid #ef4444;margin:16px 0}.footer{margin-top:30px;font-size:12px;color:#666;text-align:center;border-top:1px solid #ccc;padding-top:8px}@media print{body{margin:0}}</style></head><body>
<h1>SAĞLIK YARDIM / MEDICAL REQUEST</h1>
<p><span class="label">Hasta:</span> ${v.isim || '[isim]'}</p>
<p><span class="label">Yaş:</span> ${v.yas || '[yas]'}</p>
<p><span class="label">Durum:</span> ${v.durum || '[acil/orta/hafif]'}</p>
<p><span class="label">Belirtiler:</span> ${v.belirtiler || '[belirtiler]'}</p>
<p><span class="label">Alerji:</span> ${v.alerji || '[alerji]'}</p>
<p><span class="label">Kan Grubu:</span> ${v.kanGrubu || '[grup]'}</p>
<p><span class="label">İlaçlar:</span> ${v.ilaclar || '[ilaclar]'}</p>
<p><span class="label">İletişim:</span> ${v.iletisim || '[tel]'}</p>
${v.durum === 'acil' ? '<div class="critical">ACİL -- HEMEN 112&apos;YI ARAYIN!</div>' : ''}
<div class="footer">PrepTürk -- ${formatNow()}</div></body></html>`;
    },
  },
  {
    id: 'bolge',
    title: 'Bölge Güvenli',
    titleEn: 'Area Status',
    icon: MapPin,
    iconColor: 'text-cyan-400',
    description: 'Bölgenizin güvenlik durumunu raporlayın',
    fields: [
      { key: 'bolge', label: 'Bölge', labelEn: 'Area', type: 'text', placeholder: 'Bölge/mahalle adı' },
      {
        key: 'durum', label: 'Durum', labelEn: 'Status', type: 'select',
        options: [
          { value: 'guvenli', label: 'Güvenli' },
          { value: 'tehlikeli', label: 'Tehlikeli' },
          { value: 'erken-uyari', label: 'Erken uyarı aşamasında' },
        ]
      },
      {
        key: 'altyapi', label: 'Altyapı Durumu', labelEn: 'Infrastructure', type: 'select',
        options: [
          { value: 'calisiyor', label: 'Çalışıyor' },
          { value: 'hasarli', label: 'Hasarlı' },
          { value: 'coktu', label: 'Tamamen çöktü' },
        ]
      },
      {
        key: 'ihtiyac', label: 'Bölge İhtiyacı', labelEn: 'Area need', type: 'select',
        options: [
          { value: 'yok', label: 'İhtiyaç yok' },
          { value: 'az', label: 'Az miktarda yardım gerekli' },
          { value: 'cok', label: 'Çok acil yardım gerekli' },
        ]
      },
      { key: 'yardimVarisi', label: 'Yardım Ulaşıyor Mu?', labelEn: 'Help reaching?', type: 'select', options: [
        { value: 'evet', label: 'Evet' },
        { value: 'hayir', label: 'Hayır' },
      ]},
    ],
    generate: (v) => {
      return `BÖLGE DURUMU
Bölge: ${v.bolge || '[bolge]'}
Durum: ${v.durum || '[güvenli/tehlikeli/erken uyarı]'}
Altyapı: ${v.altyapi || '[çalışıyor/hasarlı/çöktü]'}
İhtiyaç: ${v.ihtiyac || '[yok/az/çok]'}
Yardım varışı: ${v.yardimVarisi || '[evet/hayır]'}
Tarih: ${formatNow()}`;
    },
    generatePrint: (v) => {
      return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Bölge Durumu</title>
<style>body{font-family:Arial,sans-serif;max-width:500px;margin:30px auto;padding:20px;color:#000}h1{font-size:24px;text-align:center;border:3px solid #06b6d4;padding:16px;margin-bottom:20px;background:#ecfeff}p{font-size:16px;line-height:1.8;margin:6px 0}.label{font-weight:bold}.footer{margin-top:30px;font-size:12px;color:#666;text-align:center;border-top:1px solid #ccc;padding-top:8px}@media print{body{margin:0}}</style></head><body>
<h1>BÖLGE DURUMU / AREA STATUS</h1>
<p><span class="label">Bölge:</span> ${v.bolge || '[bolge]'}</p>
<p><span class="label">Durum:</span> ${v.durum || '[durum]'}</p>
<p><span class="label">Altyapı:</span> ${v.altyapi || '[altyapi]'}</p>
<p><span class="label">İhtiyaç:</span> ${v.ihtiyac || '[ihtiyac]'}</p>
<p><span class="label">Yardım Ulaşıyor:</span> ${v.yardimVarisi || '[evet/hayır]'}</p>
<p><span class="label">Tarih:</span> ${formatNow()}</p>
<div class="footer">PrepTürk -- ${formatNow()}</div></body></html>`;
    },
  },
];

export default function SablonlarPage() {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, string>>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const currentTemplate = useMemo(() => TEMPLATES.find((t) => t.id === activeTemplate), [activeTemplate]);

  const handleFieldChange = useCallback((templateId: string, fieldKey: string, value: string) => {
    setFieldValues((prev) => ({
      ...prev,
      [templateId]: { ...(prev[templateId] || {}), [fieldKey]: value },
    }));
  }, []);

  const getOutput = useCallback((template: Template) => {
    const values = fieldValues[template.id] || {};
    return template.generate(values);
  }, [fieldValues]);

  const copyToClipboard = useCallback(async (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const output = getOutput(template);
    try {
      await navigator.clipboard.writeText(output);
      setCopiedId(templateId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* clipboard not available */ }
  }, [getOutput]);

  const printTemplate = useCallback((template: Template) => {
    const values = fieldValues[template.id] || {};
    const html = template.generatePrint(values);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 250);
    }
  }, [fieldValues]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Acil Mesaj Şablonları / Emergency Templates</h1>
        <p className="text-nomad-slate text-sm mt-1">
          Önceden hazırlanmış mesaj şablonlarını doldurun, kopyalayın veya yazdırın
        </p>
      </div>

      {/* Template Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          const isActive = activeTemplate === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTemplate(t.id)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                isActive
                  ? 'border-nomad-green bg-nomad-green/10'
                  : 'border-nomad-border bg-nomad-surface hover:border-nomad-green/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${t.iconColor}`} />
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-nomad-slate">{t.titleEn}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Template Editor */}
      {currentTemplate && (
        <Card className="border-nomad-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-nomad-bg ${currentTemplate.iconColor}`}>
                  <currentTemplate.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>{currentTemplate.title}</CardTitle>
                  <CardDescription>{currentTemplate.description}</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fields */}
            <div className="space-y-4">
              {currentTemplate.fields.map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium mb-1 block">
                    {field.label} <span className="text-nomad-slate font-normal">({field.labelEn})</span>
                  </label>
                  {field.type === 'select' && field.options ? (
                    <select
                      value={fieldValues[currentTemplate.id]?.[field.key] || ''}
                      onChange={(e) => handleFieldChange(currentTemplate.id, field.key, e.target.value)}
                      className="input-field w-full"
                    >
                      <option value="">Seçiniz...</option>
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type="text"
                      value={fieldValues[currentTemplate.id]?.[field.key] || ''}
                      onChange={(e) => handleFieldChange(currentTemplate.id, field.key, e.target.value)}
                      placeholder={field.placeholder || ''}
                      className="w-full"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Output Preview */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Mesaj Önizleme / Message Preview
              </h4>
              <div className="p-4 bg-nomad-bg rounded-lg border border-nomad-border font-mono text-sm whitespace-pre-wrap leading-relaxed">
                {getOutput(currentTemplate)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="default"
                onClick={() => copyToClipboard(currentTemplate.id)}
                size="lg"
              >
                {copiedId === currentTemplate.id ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-white" />
                    Kopyalandı!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Panoya Kopyala
                  </>
                )}
              </Button>
              <Button variant="outline" size="lg" onClick={() => printTemplate(currentTemplate)}>
                <Printer className="h-4 w-4 mr-2" />
                Yazdır
              </Button>
            </div>

            {/* Screenshot hint */}
            <div className="p-3 bg-nomad-bg rounded-lg border border-nomad-border">
              <p className="text-xs text-nomad-slate flex items-center gap-2">
                <Clipboard className="h-3 w-3" />
                İpucu: Mesaj önizleme bölgesinin ekran görüntüsünü alarak WhatsApp veya SMS ile hızlıca gönderebilirsiniz.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick reference */}
      {!currentTemplate && (
        <Card className="border-nomad-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-nomad-green" />
              Hızlı Başvuru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEMPLATES.map((t) => {
                const Icon = t.icon;
                return (
                  <div key={t.id} className="flex items-start gap-3 p-3 bg-nomad-bg rounded-lg border border-nomad-border">
                    <Icon className={`h-5 w-5 ${t.iconColor} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className="text-sm font-medium">{t.title} -- {t.titleEn}</p>
                      <p className="text-xs text-nomad-slate mt-1">{t.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
