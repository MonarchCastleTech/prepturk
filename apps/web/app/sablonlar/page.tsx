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
    title: 'Guvendeyim',
    titleEn: "I'm Safe",
    icon: Phone,
    iconColor: 'text-green-400',
    description: 'Ailenize ve yakinlariniza guvende oldugunuzu bildirin',
    fields: [
      { key: 'isim', label: 'Isim', labelEn: 'Name', type: 'text', placeholder: 'Adiniz Soyadiniz' },
      { key: 'konum', label: 'Konum', labelEn: 'Location', type: 'text', placeholder: 'Bulundugunuz yer' },
      {
        key: 'ihtiyac', label: 'Ihtiyac', labelEn: 'Need', type: 'select',
        options: [
          { value: 'yok', label: 'Ihtiyacim yok' },
          { value: 'su', label: 'Su lazim' },
          { value: 'yiyecek', label: 'Yiyecek lazim' },
          { value: 'ilac', label: 'Ilac lazim' },
          { value: 'barinak', label: 'Barinak lazim' },
        ]
      },
      { key: 'aileMesaj', label: 'Ailem icin Mesaj', labelEn: 'Message for family', type: 'text', placeholder: 'Ailenize mesajiniz...' },
    ],
    generate: (v) => {
      return `GUVENDEYIM MESAJI
Isim: ${v.isim || '[isim]'}
Konumum: ${v.konum || '[yer]'}
Ihtiyacim: ${v.ihtiyac || 'yok'}
Tarih: ${formatNow()}

Ailem icin: ${v.aileMesaj || '[mesaj]'}`;
    },
    generatePrint: (v) => {
      return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Guvendeyim</title>
<style>body{font-family:Arial,sans-serif;max-width:500px;margin:30px auto;padding:20px;color:#000}h1{font-size:28px;text-align:center;border:3px solid #22c55e;padding:16px;margin-bottom:20px;background:#f0fdf4}p{font-size:18px;line-height:1.8;margin:8px 0}.label{font-weight:bold}.footer{margin-top:30px;font-size:12px;color:#666;text-align:center;border-top:1px solid #ccc;padding-top:8px}@media print{body{margin:0}}</style></head><body>
<h1>GUVENDEYIM / I'M SAFE</h1>
<p><span class="label">Isim:</span> ${v.isim || '[isim]'}</p>
<p><span class="label">Konum:</span> ${v.konum || '[yer]'}</p>
<p><span class="label">Ihtiyac:</span> ${v.ihtiyac || 'yok'}</p>
<p><span class="label">Tarih:</span> ${formatNow()}</p>
<p><span class="label">Mesaj:</span> ${v.aileMesaj || '[mesaj]'}</p>
<div class="footer">PrepTurk -- ${formatNow()}</div></body></html>`;
    },
  },
  {
    id: 'yardim',
    title: 'Yardim Lazim',
    titleEn: 'Need Help',
    icon: AlertTriangle,
    iconColor: 'text-red-400',
    description: 'Acil yardim cagrisi gonderin',
    fields: [
      { key: 'isim', label: 'Isim', labelEn: 'Name', type: 'text', placeholder: 'Adiniz Soyadiniz' },
      { key: 'adres', label: 'Adres', labelEn: 'Address', type: 'text', placeholder: 'Acik adresiniz' },
      {
        key: 'durum', label: 'Durum', labelEn: 'Status', type: 'select',
        options: [
          { value: 'yarali', label: 'Yarali var' },
          { value: 'mahsurum', label: 'Mahsurum' },
          { value: 'saglik', label: 'Saglik sorunu' },
          { value: 'bina-hasarli', label: 'Bina hasarli' },
          { value: 'sel', label: 'Sel tehlikesi' },
        ]
      },
      {
        key: 'ihtiyac', label: 'Ihtiyac', labelEn: 'Need', type: 'select',
        options: [
          { value: 'ambulance', label: 'Ambulans' },
          { value: 'arama-kurtarma', label: 'Arama Kurtarma' },
          { value: 'su', label: 'Su' },
          { value: 'yardim-ekibi', label: 'Yardim Ekibi' },
        ]
      },
      { key: 'kisiSayisi', label: 'Kisi Sayisi', labelEn: 'Number of people', type: 'text', placeholder: 'Etkilenen kisi sayisi' },
    ],
    generate: (v) => {
      return `YARDIM CAGRISI
Isim: ${v.isim || '[isim]'}
Konum: ${v.adres || '[adres]'}
Durum: ${v.durum || '[durum]'}
Ihtiyac: ${v.ihtiyac || '[ihtiyac]'}
Kisi sayisi: ${v.kisiSayisi || '[sayi]'}`;
    },
    generatePrint: (v) => {
      return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Yardim Cagrisi</title>
<style>body{font-family:Arial,sans-serif;max-width:500px;margin:30px auto;padding:20px;color:#000}h1{font-size:28px;text-align:center;border:3px solid #ef4444;padding:16px;margin-bottom:20px;background:#fef2f2}p{font-size:18px;line-height:1.8;margin:8px 0}.label{font-weight:bold}.urg{font-size:22px;text-align:center;padding:12px;background:#fee2e2;border:2px solid #ef4444;margin:16px 0}.footer{margin-top:30px;font-size:12px;color:#666;text-align:center;border-top:1px solid #ccc;padding-top:8px}@media print{body{margin:0}}</style></head><body>
<h1>YARDIM CAGRISI / HELP NEEDED</h1>
<p><span class="label">Isim:</span> ${v.isim || '[isim]'}</p>
<p><span class="label">Konum:</span> ${v.adres || '[adres]'}</p>
<p><span class="label">Durum:</span> ${v.durum || '[durum]'}</p>
<p><span class="label">Ihtiyac:</span> ${v.ihtiyac || '[ihtiyac]'}</p>
<p><span class="label">Kisi Sayisi:</span> ${v.kisiSayisi || '[sayi]'}</p>
<div class="urg">ACIL -- 112&apos;YI ARAYIN</div>
<div class="footer">PrepTurk -- ${formatNow()}</div></body></html>`;
    },
  },
  {
    id: 'kayip',
    title: 'Kayip Raporu',
    titleEn: 'Missing Person',
    icon: Search,
    iconColor: 'text-amber-400',
    description: 'Kayip yakınlari icin rapor olusturun',
    fields: [
      { key: 'isim', label: 'Kayip Isim', labelEn: 'Missing person name', type: 'text', placeholder: 'Kayip kisinin adi' },
      { key: 'yas', label: 'Yas', labelEn: 'Age', type: 'text', placeholder: 'Yasi' },
      { key: 'boy', label: 'Boy', labelEn: 'Height', type: 'text', placeholder: 'Boyu (cm)' },
      { key: 'sacRengi', label: 'Sac Rengi', labelEn: 'Hair color', type: 'text', placeholder: 'Sac rengi' },
      { key: 'sonYer', label: 'Son Goruldugu Yer', labelEn: 'Last seen location', type: 'text', placeholder: 'En son nerede goruldu' },
      { key: 'sonZaman', label: 'Son Goruldugu Zaman', labelEn: 'Last seen time', type: 'text', placeholder: 'Ne zaman goruldu' },
      { key: 'ozellikler', label: 'Ayirt Edici Ozellikler', labelEn: 'Distinguishing features', type: 'text', placeholder: 'Ozel isaretler, giysiler, vs.' },
      { key: 'iletisim', label: 'Iletisim', labelEn: 'Contact', type: 'text', placeholder: 'Telefon numaraniz' },
    ],
    generate: (v) => {
      return `KAYIP RAPORU
Isim: ${v.isim || '[isim]'}
Yas: ${v.yas || '[yas]'}
Boy: ${v.boy || '[boy]'}
Sac rengi: ${v.sacRengi || '[renk]'}
Son goruldugu yer: ${v.sonYer || '[yer]'}
Son goruldugu zaman: ${v.sonZaman || '[zaman]'}
Ozellikler: ${v.ozellikler || '[ozellik]'}
Iletisim: ${v.iletisim || '[tel]'}`;
    },
    generatePrint: (v) => {
      return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Kayip Raporu</title>
<style>body{font-family:Arial,sans-serif;max-width:500px;margin:30px auto;padding:20px;color:#000}h1{font-size:28px;text-align:center;border:3px solid #f59e0b;padding:16px;margin-bottom:20px;background:#fffbeb}p{font-size:16px;line-height:1.8;margin:6px 0}.label{font-weight:bold}.footer{margin-top:30px;font-size:12px;color:#666;text-align:center;border-top:1px solid #ccc;padding-top:8px}@media print{body{margin:0}}</style></head><body>
<h1>KAYIP RAPORU / MISSING PERSON</h1>
<p><span class="label">Isim:</span> ${v.isim || '[isim]'}</p>
<p><span class="label">Yas:</span> ${v.yas || '[yas]'}</p>
<p><span class="label">Boy:</span> ${v.boy || '[boy]'}</p>
<p><span class="label">Sac Rengi:</span> ${v.sacRengi || '[renk]'}</p>
<p><span class="label">Son Yer:</span> ${v.sonYer || '[yer]'}</p>
<p><span class="label">Son Zaman:</span> ${v.sonZaman || '[zaman]'}</p>
<p><span class="label">Ozellikler:</span> ${v.ozellikler || '[ozellik]'}</p>
<p><span class="label">Iletisim:</span> ${v.iletisim || '[tel]'}</p>
<div class="footer">PrepTurk -- ${formatNow()}</div></body></html>`;
    },
  },
  {
    id: 'hasar',
    title: 'Hasar Raporu',
    titleEn: 'Building Damage',
    icon: Building,
    iconColor: 'text-orange-400',
    description: 'Bina hasarini raporlayin',
    fields: [
      { key: 'adres', label: 'Adres', labelEn: 'Address', type: 'text', placeholder: 'Bina adresi' },
      {
        key: 'binaTipi', label: 'Bina Tipi', labelEn: 'Building type', type: 'select',
        options: [
          { value: 'beton', label: 'Betonarme' },
          { value: 'tugla', label: 'Tugla' },
          { value: 'ahsap', label: 'Ahşap' },
          { value: 'prefabrik', label: 'Prefabrik' },
        ]
      },
      { key: 'katSayisi', label: 'Kat Sayisi', labelEn: 'Number of floors', type: 'text', placeholder: 'Bina kat sayisi' },
      {
        key: 'hasar', label: 'Hasar Durumu', labelEn: 'Damage level', type: 'select',
        options: [
          { value: 'hafif', label: 'Hafif (catlaklar)' },
          { value: 'orta', label: 'Orta (yapisal hasar)' },
          { value: 'agir', label: 'Agir (kismi cokme)' },
          { value: 'yikildi', label: 'Tam yikildi' },
        ]
      },
      {
        key: 'tehlike', label: 'Tehlike', labelEn: 'Hazard', type: 'select',
        options: [
          { value: 'yok', label: 'Yok' },
          { value: 'gaz', label: 'Gaz kacagi' },
          { value: 'elektrik', label: 'Elektrik tehlikesi' },
          { value: 'cokme', label: 'Cokme tehlikesi' },
          { value: 'gaz+elektrik', label: 'Gaz + Elektrik' },
        ]
      },
      { key: 'icerde', label: 'Icerde Insan Var Mi?', labelEn: 'People inside?', type: 'select', options: [
        { value: 'evet', label: 'Evet' },
        { value: 'hayir', label: 'Hayir' },
        { value: 'bilinmiyor', label: 'Bilinmiyor' },
      ]},
      { key: 'icerdeSayi', label: 'Tahmini Sayi', labelEn: 'Estimated number', type: 'text', placeholder: 'Icerde tahmini kisi sayisi' },
    ],
    generate: (v) => {
      return `BINA HASAR RAPORU
Adres: ${v.adres || '[adres]'}
Bina tipi: ${v.binaTipi || '[beton/tugla/ahsap]'}
Kat sayisi: ${v.katSayisi || '[sayi]'}
Hasar: ${v.hasar || '[hafif/orta/agir/yikildi]'}
Tehlike: ${v.tehlike || '[gaz/elektrik/cokme]'}
Icerde insan: ${v.icerde || '[evet/hayir]'}${v.icerde === 'evet' ? ` -- Tahmini sayi: ${v.icerdeSayi || '?'}` : ''}`;
    },
    generatePrint: (v) => {
      return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Hasar Raporu</title>
<style>body{font-family:Arial,sans-serif;max-width:500px;margin:30px auto;padding:20px;color:#000}h1{font-size:24px;text-align:center;border:3px solid #f97316;padding:16px;margin-bottom:20px;background:#fff7ed}p{font-size:16px;line-height:1.8;margin:6px 0}.label{font-weight:bold}.danger{font-size:20px;text-align:center;padding:12px;background:#fee2e2;border:2px solid #ef4444;margin:16px 0}.footer{margin-top:30px;font-size:12px;color:#666;text-align:center;border-top:1px solid #ccc;padding-top:8px}@media print{body{margin:0}}</style></head><body>
<h1>BINA HASAR RAPORU</h1>
<p><span class="label">Adres:</span> ${v.adres || '[adres]'}</p>
<p><span class="label">Bina Tipi:</span> ${v.binaTipi || '[tip]'}</p>
<p><span class="label">Kat Sayisi:</span> ${v.katSayisi || '[sayi]'}</p>
<p><span class="label">Hasar:</span> ${v.hasar || '[durum]'}</p>
<p><span class="label">Tehlike:</span> ${v.tehlike || '[tehlike]'}</p>
<p><span class="label">Icerde Insan:</span> ${v.icerde || '[evet/hayir]'}</p>
${v.icerde === 'evet' ? `<p><span class="label">Sayi:</span> ${v.icerdeSayi || '?'}</p>` : ''}
<div class="danger">TEHLIKE: Gerekli onlemleri alin!</div>
<div class="footer">PrepTurk -- ${formatNow()}</div></body></html>`;
    },
  },
  {
    id: 'saglik',
    title: 'Saglik Talebi',
    titleEn: 'Medical Request',
    icon: Heart,
    iconColor: 'text-pink-400',
    description: 'Saglik yardimi talebi olusturun',
    fields: [
      { key: 'isim', label: 'Hasta Ismi', labelEn: 'Patient name', type: 'text', placeholder: 'Hastanin adi' },
      { key: 'yas', label: 'Yas', labelEn: 'Age', type: 'text', placeholder: 'Hastanin yasi' },
      {
        key: 'durum', label: 'Aciliyet', labelEn: 'Urgency', type: 'select',
        options: [
          { value: 'acil', label: 'ACIL (hayati tehlike)' },
          { value: 'orta', label: 'Orta (doktor gerekli)' },
          { value: 'hafif', label: 'Hafif (ilk yardim yeterli)' },
        ]
      },
      { key: 'belirtiler', label: 'Belirtiler', labelEn: 'Symptoms', type: 'text', placeholder: 'Hasta semptomlari' },
      { key: 'alerji', label: 'Alerji', labelEn: 'Allergies', type: 'text', placeholder: 'Bilinen alerjiler' },
      { key: 'kanGrubu', label: 'Kan Grubu', labelEn: 'Blood type', type: 'text', placeholder: 'A+, B-, O+, vs.' },
      { key: 'ilaclar', label: 'Kullanilan Ilaclar', labelEn: 'Current medications', type: 'text', placeholder: 'Halihazirda kullanilan ilaclar' },
      { key: 'iletisim', label: 'Iletisim', labelEn: 'Contact', type: 'text', placeholder: 'Yakin telefon numarası' },
    ],
    generate: (v) => {
      return `SAGLIK YARDIM
Hasta: ${v.isim || '[isim]'}
Yas: ${v.yas || '[yas]'}
Durum: ${v.durum || '[acil/orta/hafif]'}
Belirtiler: ${v.belirtiler || '[belirtiler]'}
Alerji: ${v.alerji || '[alerji]'}
Kan grubu: ${v.kanGrubu || '[grup]'}
Ilaclar: ${v.ilaclar || '[ilaclar]'}
Iletisim: ${v.iletisim || '[tel]'}`;
    },
    generatePrint: (v) => {
      return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Saglik Talebi</title>
<style>body{font-family:Arial,sans-serif;max-width:500px;margin:30px auto;padding:20px;color:#000}h1{font-size:24px;text-align:center;border:3px solid #ec4899;padding:16px;margin-bottom:20px;background:#fdf2f8}p{font-size:16px;line-height:1.8;margin:6px 0}.label{font-weight:bold}.critical{font-size:22px;text-align:center;padding:12px;background:#fee2e2;border:2px solid #ef4444;margin:16px 0}.footer{margin-top:30px;font-size:12px;color:#666;text-align:center;border-top:1px solid #ccc;padding-top:8px}@media print{body{margin:0}}</style></head><body>
<h1>SAGLIK YARDIM / MEDICAL REQUEST</h1>
<p><span class="label">Hasta:</span> ${v.isim || '[isim]'}</p>
<p><span class="label">Yas:</span> ${v.yas || '[yas]'}</p>
<p><span class="label">Durum:</span> ${v.durum || '[acil/orta/hafif]'}</p>
<p><span class="label">Belirtiler:</span> ${v.belirtiler || '[belirtiler]'}</p>
<p><span class="label">Alerji:</span> ${v.alerji || '[alerji]'}</p>
<p><span class="label">Kan Grubu:</span> ${v.kanGrubu || '[grup]'}</p>
<p><span class="label">Ilaclar:</span> ${v.ilaclar || '[ilaclar]'}</p>
<p><span class="label">Iletisim:</span> ${v.iletisim || '[tel]'}</p>
${v.durum === 'acil' ? '<div class="critical">ACIL -- HEMEN 112&apos;YI ARAYIN!</div>' : ''}
<div class="footer">PrepTurk -- ${formatNow()}</div></body></html>`;
    },
  },
  {
    id: 'bolge',
    title: 'Bolgu Guvenli',
    titleEn: 'Area Status',
    icon: MapPin,
    iconColor: 'text-cyan-400',
    description: 'Bolgenizin guvenlik durumunu raporlayin',
    fields: [
      { key: 'bolge', label: 'Bolge', labelEn: 'Area', type: 'text', placeholder: 'Bolge/mahalle adi' },
      {
        key: 'durum', label: 'Durum', labelEn: 'Status', type: 'select',
        options: [
          { value: 'guvenli', label: 'Guvenli' },
          { value: 'tehlikeli', label: 'Tehlikeli' },
          { value: 'erken-uyari', label: 'Erken uyari asamasinda' },
        ]
      },
      {
        key: 'altyapi', label: 'Altyapi Durumu', labelEn: 'Infrastructure', type: 'select',
        options: [
          { value: 'calisiyor', label: 'Calisiyor' },
          { value: 'hasarli', label: 'Hasarli' },
          { value: 'coktu', label: 'Tamamen coktu' },
        ]
      },
      {
        key: 'ihtiyac', label: 'Bolge Ihtiyaci', labelEn: 'Area need', type: 'select',
        options: [
          { value: 'yok', label: 'Ihtiyac yok' },
          { value: 'az', label: 'Az miktarda yardim gerekli' },
          { value: 'cok', label: 'Cok acil yardim gerekli' },
        ]
      },
      { key: 'yardimVarisi', label: 'Yardim Ulasiyor Mu?', labelEn: 'Help reaching?', type: 'select', options: [
        { value: 'evet', label: 'Evet' },
        { value: 'hayir', label: 'Hayir' },
      ]},
    ],
    generate: (v) => {
      return `BOLGE DURUMU
Bolge: ${v.bolge || '[bolge]'}
Durum: ${v.durum || '[guvenli/tehlikeli/erken uyari]'}
Altyapi: ${v.altyapi || '[calisiyor/hasarli/coktu]'}
Ihtiyac: ${v.ihtiyac || '[yok/az/cok]'}
Yardim varisi: ${v.yardimVarisi || '[evet/hayir]'}
Tarih: ${formatNow()}`;
    },
    generatePrint: (v) => {
      return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Bolge Durumu</title>
<style>body{font-family:Arial,sans-serif;max-width:500px;margin:30px auto;padding:20px;color:#000}h1{font-size:24px;text-align:center;border:3px solid #06b6d4;padding:16px;margin-bottom:20px;background:#ecfeff}p{font-size:16px;line-height:1.8;margin:6px 0}.label{font-weight:bold}.footer{margin-top:30px;font-size:12px;color:#666;text-align:center;border-top:1px solid #ccc;padding-top:8px}@media print{body{margin:0}}</style></head><body>
<h1>BOLGE DURUMU / AREA STATUS</h1>
<p><span class="label">Bolge:</span> ${v.bolge || '[bolge]'}</p>
<p><span class="label">Durum:</span> ${v.durum || '[durum]'}</p>
<p><span class="label">Altyapi:</span> ${v.altyapi || '[altyapi]'}</p>
<p><span class="label">Ihtiyac:</span> ${v.ihtiyac || '[ihtiyac]'}</p>
<p><span class="label">Yardim Ulasıyor:</span> ${v.yardimVarisi || '[evet/hayir]'}</p>
<p><span class="label">Tarih:</span> ${formatNow()}</p>
<div class="footer">PrepTurk -- ${formatNow()}</div></body></html>`;
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
        <h1 className="text-2xl font-bold">Acil Mesaj Sablonları / Emergency Templates</h1>
        <p className="text-nomad-slate text-sm mt-1">
          Onceden hazırlanmis mesaj sablonlarını doldurun, kopyalayin veya yazdirin
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
                      <option value="">Seciniz...</option>
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
                Mesaj Onizleme / Message Preview
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
                Yazdir
              </Button>
            </div>

            {/* Screenshot hint */}
            <div className="p-3 bg-nomad-bg rounded-lg border border-nomad-border">
              <p className="text-xs text-nomad-slate flex items-center gap-2">
                <Clipboard className="h-3 w-3" />
                Ipucu: Mesaj onizleme bolgesinin ekran goruntusunu alarak WhatsApp veya SMS ile hizlica gonderebilirsiniz.
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
              Hızli Basvuru
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
