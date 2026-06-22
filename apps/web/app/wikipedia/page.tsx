'use client';

import { Database } from 'lucide-react';
import ExternalServiceView from '../../components/ExternalServiceView';

export default function WikipediaPage() {
  return (
    <ExternalServiceView
      title="Wikipedia (Kiwix)"
      kicker="Çevrimdışı Ansiklopedi"
      icon={Database}
      enabled={process.env.NEXT_PUBLIC_ENABLE_KIWIX === 'true'}
      url={process.env.NEXT_PUBLIC_KIWIX_URL || 'http://localhost:8090'}
      enableFlag="ENABLE_KIWIX"
      description="Kiwix üzerinden sunulan tam Türkçe Wikipedia arşivi ve WikiMed tıp ansiklopedisi. İnternet olmadan milyonlarca maddeye erişin."
      features={[
        'Tam Türkçe Wikipedia arşivi (ZIM)',
        'WikiMed çevrimdışı tıp ansiklopedisi',
        'Hızlı yerel tam metin arama',
        'Gutenberg e-kitap koleksiyonu desteği',
      ]}
    />
  );
}
