'use client';

import { Cpu } from 'lucide-react';
import ExternalServiceView from '../../components/ExternalServiceView';

export default function CyberChefPage() {
  return (
    <ExternalServiceView
      title="CyberChef"
      kicker="Veri Araçları"
      icon={Cpu}
      enabled={process.env.NEXT_PUBLIC_ENABLE_CYBERCHEF === 'true'}
      url={process.env.NEXT_PUBLIC_CYBERCHEF_URL || 'http://localhost:8000/cyberchef/'}
      enableFlag="ENABLE_CYBERCHEF"
      description="Şifreleme, kodlama ve veri dönüştürme için çevrimdışı çalışan kapsamlı araç seti. Tüm işlemler tarayıcınızda, yerelde yapılır."
      features={[
        'Base64, hex ve URL kodlama/çözme',
        'Hash hesaplama (SHA, MD5) ve doğrulama',
        'Şifreleme/şifre çözme (AES, RSA) işlemleri',
        'Veri biçimi dönüştürme ve analiz araçları',
      ]}
    />
  );
}
