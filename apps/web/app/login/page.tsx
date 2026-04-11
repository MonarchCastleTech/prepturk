'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-nomad-bg flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-sm text-nomad-slate">Yonlendiriliyor...</p>
      </div>
    </div>
  );
}
