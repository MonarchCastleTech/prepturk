'use client';

import { GraduationCap } from 'lucide-react';
import ExternalServiceView from '../../components/ExternalServiceView';

export default function KolibriPage() {
  return (
    <ExternalServiceView
      title="Kolibri LMS"
      kicker="Eğitim Platformu"
      icon={GraduationCap}
      enabled={process.env.NEXT_PUBLIC_ENABLE_KOLIBRI === 'true'}
      url={process.env.NEXT_PUBLIC_KOLIBRI_URL || 'http://localhost:8080'}
      enableFlag="ENABLE_KOLIBRI"
      description="Çevrimdışı çalışan profesyonel öğrenme platformu. Binlerce ders, video ve alıştırmayı internet olmadan sunar."
      features={[
        'İlkokuldan liseye kadar yapılandırılmış ders kataloğu',
        'Video, sunum ve interaktif alıştırma desteği',
        'Öğrenci ilerleme takibi ve raporlama',
        'Tamamen yerel; içerik cihazınızda saklanır',
      ]}
    />
  );
}
