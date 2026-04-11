export interface AssemblyPoint {
  id: string;
  province: string;
  provinceCode: string;
  district: string;
  neighborhood: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'park' | 'school' | 'stadium' | 'square' | 'cemetery';
  capacity: string;
  notes: string;
}

export const PROVINCES = [
  { code: '06', name: 'Ankara' },
  { code: '34', name: 'Istanbul' },
  { code: '35', name: 'Izmir' },
  { code: '01', name: 'Adana' },
  { code: '16', name: 'Bursa' },
  { code: '07', name: 'Antalya' },
  { code: '42', name: 'Konya' },
  { code: '27', name: 'Gaziantep' },
  { code: '41', name: 'Kocaeli' },
  { code: '03', name: 'Afyonkarahisar' },
  { code: '04', name: 'Agri' },
  { code: '68', name: 'Aksaray' },
  { code: '05', name: 'Amasya' },
  { code: '08', name: 'Artvin' },
  { code: '09', name: 'Aydin' },
  { code: '10', name: 'Balikesir' },
  { code: '74', name: 'Bartin' },
  { code: '72', name: 'Batman' },
  { code: '67', name: 'Zonguldak' },
  { code: '54', name: 'Sakarya' },
  { code: '55', name: 'Samsun' },
  { code: '58', name: 'Sivas' },
  { code: '61', name: 'Trabzon' },
  { code: '65', name: 'Van' },
  { code: '63', name: 'Sanliurfa' },
  { code: '33', name: 'Mersin' },
  { code: '38', name: 'Kayseri' },
  { code: '20', name: 'Denizli' },
  { code: '21', name: 'Diyarbakir' },
  { code: '22', name: 'Edirne' },
  { code: '23', name: 'Elazig' },
  { code: '24', name: 'Erzincan' },
  { code: '25', name: 'Erzurum' },
  { code: '31', name: 'Hatay' },
  { code: '32', name: 'Isparta' },
  { code: '46', name: 'Kahramanmaras' },
  { code: '43', name: 'Kutahya' },
  { code: '44', name: 'Malatya' },
  { code: '45', name: 'Manisa' },
  { code: '47', name: 'Mardin' },
  { code: '48', name: 'Mugla' },
  { code: '50', name: 'Nevsehir' },
  { code: '51', name: 'Nigde' },
  { code: '52', name: 'Ordu' },
  { code: '53', name: 'Rize' },
  { code: '56', name: 'Siirt' },
  { code: '57', name: 'Sinop' },
  { code: '59', name: 'Tekirdag' },
  { code: '60', name: 'Tokat' },
  { code: '64', name: 'Usak' },
  { code: '66', name: 'Yozgat' },
  { code: '77', name: 'Yalova' },
  { code: '11', name: 'Bilecik' },
  { code: '12', name: 'Bingol' },
  { code: '13', name: 'Bitlis' },
  { code: '14', name: 'Bolu' },
  { code: '15', name: 'Burdur' },
  { code: '17', name: 'Canakkale' },
  { code: '18', name: 'Cankiri' },
  { code: '19', name: 'Corum' },
  { code: '26', name: 'Eskisehir' },
  { code: '28', name: 'Giresun' },
  { code: '29', name: 'Gumushane' },
  { code: '30', name: 'Hakkari' },
  { code: '34', name: 'Istanbul' },
  { code: '36', name: 'Kars' },
  { code: '37', name: 'Kastamonu' },
  { code: '39', name: 'Kirklareli' },
  { code: '40', name: 'Kirsehir' },
  { code: '71', name: 'Kirikkale' },
  { code: '49', name: 'Mus' },
  { code: '62', name: 'Tunceli' },
  { code: '69', name: 'Bayburt' },
  { code: '70', name: 'Karaman' },
  { code: '73', name: 'Sirnak' },
  { code: '75', name: 'Ardahan' },
  { code: '76', name: 'Igdir' },
  { code: '78', name: 'Karabuk' },
  { code: '79', name: 'Kilis' },
  { code: '80', name: 'Osmaniye' },
  { code: '81', name: 'Duzce' },
];

export const DISTRICTS: Record<string, string[]> = {
  Ankara: ['Cankaya', 'Kecioren', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Sincan', 'Altindag', 'Ulus', 'Kizilay', 'Besevler', 'Bahcelievler', 'Dikmen', 'Cayyolu', 'Umitkoy', 'Pursaklar'],
  Istanbul: ['Kadikoy', 'Besiktas', 'Uskudar', 'Fatih', 'Beyoglu', 'Sisli', 'Bakirkoy', 'Atasehir', 'Umraniye', 'Maltepe', 'Kartal', 'Pendik', 'Beylikduzu', 'Esenyurt', 'Buyukcekmece'],
  Izmir: ['Konak', 'Bornova', 'Karsiyaka', 'Alsancak', 'Buca', 'Urla', 'Cesme', 'Foca'],
  Adana: ['Seyhan', 'Yuregir', 'Cukurova', 'Sarıcam', 'Kozan'],
  Bursa: ['Osmangazi', 'Yildirim', 'Nilufer', 'Mudanya', 'Gemlik'],
  Antalya: ['Muratpasa', 'Konyaalti', 'Kepez', 'Alanya', 'Manavgat'],
};

export const NEIGHBORHOODS: Record<string, Record<string, string[]>> = {
  Ankara: {
    Cankaya: ['Kizilay', 'Bahcelievler', 'Kavaklidere', 'Gaziosmanpasa', 'Dikmen', 'Cayyolu', 'Balgat', 'Sogutozu'],
    Kecioren: ['Kecioren Merkez', 'Senlik', 'Sancaktepe', 'Etlik', 'Akdere'],
    Yenimahalle: ['Batikent', 'Sentepe', 'Yenimahalle Merkez', 'Serdar', 'Macunkoy'],
    Mamak: ['Mamak Merkez', 'Fahri Koruturk', 'Bogaziçi', 'Huseyingazi', 'General Zeki Dogan'],
    Etimesgut: ['Etimesgut Merkez', 'Eryaman', 'Guzelyurt', 'Turgutreis', 'Devlet'],
  },
  Istanbul: {
    Kadikoy: ['Moda', 'Fenerbahce', 'Goztepe', 'Suadiye', 'Bostanci', 'Hasanpasa', 'Kozyatagi', 'Caddebostan'],
    Besiktas: ['Besiktas Merkez', 'Levent', 'Etiler', 'Bebek', 'Ortakoy', 'Yildiz', 'Gayrettepe', 'Sinanpasa'],
    Uskudar: ['Uskudar Merkez', 'Baglarbasi', 'Kisikli', 'Beylerbeyi', 'Selamsiz', 'Kuzguncuk', 'Salacak', 'Acibadem'],
    Fatih: ['Sultanahmet', 'Eminonu', 'Aksaray', 'Fener', 'Balat', 'Cerrahpasa', 'Kocamustafapasa', 'Vezneciler'],
    Beyoglu: ['Taksim', 'Galata', 'Beyoglu Merkez', 'Cihangir', 'Pera', 'Karakoy', 'Haskoy'],
  },
};

export const ASSEMBLY_POINTS: AssemblyPoint[] = [
  // Ankara - Cankaya - Kizilay
  {
    id: 'ank-cankaya-001',
    province: 'Ankara',
    provinceCode: '06',
    district: 'Cankaya',
    neighborhood: 'Kizilay',
    name: 'Kizilay Guven Park',
    address: 'Kizilay Mah. Ataturk Blv. No: 123, Kizilay',
    lat: 39.9208,
    lng: 32.8541,
    type: 'park',
    capacity: '5000 kisi',
    notes: 'Genis acik alan, su kaynaklari yakin. Metro girisine 200m.',
  },
  {
    id: 'ank-cankaya-002',
    province: 'Ankara',
    provinceCode: '06',
    district: 'Cankaya',
    neighborhood: 'Kizilay',
    name: 'Kizilay Meydani',
    address: 'Kizilay Mah. Meşrutiyet Cad., Kizilay',
    lat: 39.9197,
    lng: 32.8546,
    type: 'square',
    capacity: '10000 kisi',
    notes: 'Merkez konum, birden fazla acil durum yolu ulasilabilir.',
  },
  // Ankara - Cankaya - Bahcelievler
  {
    id: 'ank-cankaya-003',
    province: 'Ankara',
    provinceCode: '06',
    district: 'Cankaya',
    neighborhood: 'Bahcelievler',
    name: 'Bahcelievler 7. Cadde Park',
    address: 'Bahcelievler Mah. 7. Cadde No: 45, Bahcelievler',
    lat: 39.9100,
    lng: 32.8200,
    type: 'park',
    capacity: '3000 kisi',
    notes: 'Yerlesim alanina yakin, guvenli toplanma bolgesi.',
  },
  // Ankara - Ulus
  {
    id: 'ank-ulus-001',
    province: 'Ankara',
    provinceCode: '06',
    district: 'Ulus',
    neighborhood: 'Ulus Merkez',
    name: 'Ulus Meydani',
    address: 'Ulus Mah. Ankara Kalesi yani, Ulus',
    lat: 39.9413,
    lng: 32.8614,
    type: 'square',
    capacity: '8000 kisi',
    notes: 'Tarihi bolge, genis acik alan. Kale yakininda yuksek zemin.',
  },
  {
    id: 'ank-ulus-002',
    province: 'Ankara',
    provinceCode: '06',
    district: 'Ulus',
    neighborhood: 'Ulus Merkez',
    name: 'Ankara Lisesi Bahcesi',
    address: 'Ulucak Mah. Birc Sokak No: 14, Ulus',
    lat: 39.9395,
    lng: 32.8580,
    type: 'school',
    capacity: '2000 kisi',
    notes: 'Okul bahcesi, acil durum barinmasi icin uygun.',
  },
  // Ankara - Etimesgut - Eryaman
  {
    id: 'ank-eryaman-001',
    province: 'Ankara',
    provinceCode: '06',
    district: 'Etimesgut',
    neighborhood: 'Eryaman',
    name: 'Eryaman 5. Bolge Park',
    address: 'Eryaman Mah. 245. Cadde, Eryaman',
    lat: 39.9600,
    lng: 32.6700,
    type: 'park',
    capacity: '4000 kisi',
    notes: 'Yeni yerlesim bolgesi, genis park alani.',
  },
  // Istanbul - Kadikoy - Moda
  {
    id: 'ist-kadikoy-001',
    province: 'Istanbul',
    provinceCode: '34',
    district: 'Kadikoy',
    neighborhood: 'Moda',
    name: 'Moda Feneri Park',
    address: 'Moda Cad. No: 1, Moda, Kadikoy',
    lat: 40.9833,
    lng: 29.0333,
    type: 'park',
    capacity: '6000 kisi',
    notes: 'Sahil yakininda, genis acik alan. Deniz seviyesinden yuksek.',
  },
  {
    id: 'ist-kadikoy-002',
    province: 'Istanbul',
    provinceCode: '34',
    district: 'Kadikoy',
    neighborhood: 'Goztepe',
    name: 'Goztepe 60. Yil Park',
    address: 'Goztepe Mah. Bagdat Cad., Goztepe',
    lat: 40.9780,
    lng: 29.0540,
    type: 'park',
    capacity: '4000 kisi',
    notes: 'Bagdat Caddesi uzerinde, ulasimi kolay.',
  },
  // Istanbul - Besiktas - Besiktas Merkez
  {
    id: 'ist-besiktas-001',
    province: 'Istanbul',
    provinceCode: '34',
    district: 'Besiktas',
    neighborhood: 'Besiktas Merkez',
    name: 'Besiktas Inonu Stad',
    address: 'Besiktas Mah. Dolmabahce Cad., Besiktas',
    lat: 41.0422,
    lng: 29.0063,
    type: 'stadium',
    capacity: '50000 kisi',
    notes: 'Buyuk kapasiteli toplanma alani. Il yardim ekipleri mevcut.',
  },
  {
    id: 'ist-besiktas-002',
    province: 'Istanbul',
    provinceCode: '34',
    district: 'Besiktas',
    neighborhood: 'Levent',
    name: 'Levent Is Park',
    address: 'Levent Mah. Buyukdere Cad. No: 185, Levent',
    lat: 41.0800,
    lng: 29.0160,
    type: 'square',
    capacity: '8000 kisi',
    notes: 'Is merkezi bolgesi, genis meydan alani.',
  },
  // Istanbul - Uskudar - Uskudar Merkez
  {
    id: 'ist-uskudar-001',
    province: 'Istanbul',
    provinceCode: '34',
    district: 'Uskudar',
    neighborhood: 'Uskudar Merkez',
    name: 'Uskudar Selimiye Meydani',
    address: 'Selimiye Mah. Uskudar',
    lat: 41.0242,
    lng: 29.0204,
    type: 'square',
    capacity: '12000 kisi',
    notes: 'Tarihi bolge, genis meydan. Selimiye Kislasi yani.',
  },
  {
    id: 'ist-uskudar-002',
    province: 'Istanbul',
    provinceCode: '34',
    district: 'Uskudar',
    neighborhood: 'Baglarbasi',
    name: 'Baglarbasi Ilkokulu Bahcesi',
    address: 'Baglarbasi Mah. Okul Sokak No: 5, Uskudar',
    lat: 41.0280,
    lng: 29.0320,
    type: 'school',
    capacity: '1500 kisi',
    notes: 'Okul bahcesi, acil durumda guvenli toplanma alani.',
  },
  // Istanbul - Kadikoy - Bostanci
  {
    id: 'ist-kadikoy-003',
    province: 'Istanbul',
    provinceCode: '34',
    district: 'Kadikoy',
    neighborhood: 'Bostanci',
    name: 'Bostanci Sahil Park',
    address: 'Bostanci Mah. Sahil Yolu Cad., Kadikoy',
    lat: 40.9650,
    lng: 29.0800,
    type: 'park',
    capacity: '7000 kisi',
    notes: 'Sahil bolgesi, acil durumda deniz ulasimi mumkun.',
  },
  // Ankara - Mamak
  {
    id: 'ank-mamak-001',
    province: 'Ankara',
    provinceCode: '06',
    district: 'Mamak',
    neighborhood: 'Mamak Merkez',
    name: 'Mamak Dogukent Park',
    address: 'Dogukent Mah. Dogukent Cad., Mamak',
    lat: 39.9300,
    lng: 32.9200,
    type: 'park',
    capacity: '3500 kisi',
    notes: 'Yerlesim bolgesi icinde, genis park alani.',
  },
  // Istanbul - Fatih
  {
    id: 'ist-fatih-001',
    province: 'Istanbul',
    provinceCode: '34',
    district: 'Fatih',
    neighborhood: 'Sultanahmet',
    name: 'Sultanahmet Meydani',
    address: 'Sultanahmet Mah. Ayasofya yani, Fatih',
    lat: 41.0054,
    lng: 28.9768,
    type: 'square',
    capacity: '15000 kisi',
    notes: 'Tarihi yarimada, genis acik alan. Turist yogun bolge.',
  },
];

export function getDistrictsForProvince(province: string): string[] {
  return DISTRICTS[province] || [];
}

export function getNeighborhoodsForDistrict(province: string, district: string): string[] {
  const provData = NEIGHBORHOODS[province];
  if (!provData) return [];
  return provData[district] || [];
}

export function getAssemblyPoints(province: string, district?: string, neighborhood?: string): AssemblyPoint[] {
  let results = ASSEMBLY_POINTS.filter((p) => p.province === province);
  if (district) {
    results = results.filter((p) => p.district === district);
  }
  if (neighborhood) {
    results = results.filter((p) => p.neighborhood === neighborhood);
  }
  return results;
}

export function getNearbyPoints(lat: number, lng: number, maxKm = 5): AssemblyPoint[] {
  return ASSEMBLY_POINTS.map((p) => {
    const dlat = p.lat - lat;
    const dlng = p.lng - lng;
    const dist = Math.sqrt(dlat * dlat + dlng * dlng) * 111;
    return { ...p, _distance: dist };
  })
    .filter((p) => (p as AssemblyPoint & { _distance: number })._distance <= maxKm)
    .sort((a, b) => (a as AssemblyPoint & { _distance: number })._distance - (b as AssemblyPoint & { _distance: number })._distance) as AssemblyPoint[];
}

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * DISABLED: Returns empty string. Google Maps requires internet.
 * Use internal map view instead.
 */
export function getGoogleMapsUrl(_lat: number, _lng: number): string {
  return ''; // OFFLINE: No external links
}

export const TYPE_LABELS: Record<AssemblyPoint['type'], string> = {
  park: 'Park',
  school: 'Okul',
  stadium: 'Stad',
  square: 'Meydan',
  cemetery: 'Mezarlik',
};

export const TYPE_ICONS: Record<AssemblyPoint['type'], string> = {
  park: '🌳',
  school: '🏫',
  stadium: '🏟️',
  square: '📍',
  cemetery: '🪦',
};
