'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { BookOpen, Download, CheckCircle, Clock, Shield, Users, GraduationCap } from 'lucide-react';

interface Material {
  id: string;
  title: string;
  level: string;
  subject: string;
  type: string;
  offline: boolean;
  rightsStatus: string;
  description: string;
}

const mockMaterials: Material[] = [
  { id: '1', title: 'Turkce Dil Bilgisi - 5. Sinif', level: 'ilkokul', subject: 'turkce', type: 'ders-kitabi', offline: true, rightsStatus: 'public-download', description: 'Temel dil bilgisi kurallari, noktalama isaretleri.' },
  { id: '2', title: 'Matematik - Temel Geometri', level: 'ortaokul', subject: 'matematik', type: 'ders-kitabi', offline: true, rightsStatus: 'public-download', description: 'Acilar, ucgenler, dortgenler ve alan hesaplamalari.' },
  { id: '3', title: 'Fizik - Kuvvet ve Hareket', level: 'lise', subject: 'fizik', type: 'ders-kitabi', offline: true, rightsStatus: 'public-download', description: 'Newton kanunlari, serbest dusme, egik atis.' },
  { id: '4', title: 'Tarih - Osmanli Imparatorlugu', level: 'ortaokul', subject: 'tarih', type: 'kaynak', offline: false, rightsStatus: 'public-read-limited-redistribution', description: "Kurulus'tan yikilisa Osmanli tarihi." },
  { id: '5', title: 'Biyoloji - Hucre ve Bolunme', level: 'lise', subject: 'biyoloji', type: 'ders-kitabi', offline: true, rightsStatus: 'public-download', description: 'Hucre yapisi, mitoz, mayoz bolunme.' },
  { id: '6', title: 'Ataturk Ilke ve Inkilaplari', level: 'universite', subject: 'ataturk', type: 'ders-kitabi', offline: true, rightsStatus: 'public-download', description: 'Zorunlu universite dersi kaynak kitabi.' },
];

const levels = [
  { id: 'all', label: 'Tum Seviyeler', icon: Users },
  { id: 'ilkokul', label: 'Ilkokul', icon: BookOpen },
  { id: 'ortaokul', label: 'Ortaokul', icon: BookOpen },
  { id: 'lise', label: 'Lise', icon: GraduationCap },
  { id: 'universite', label: 'Universite', icon: GraduationCap },
];

const subjects = ['turkce', 'matematik', 'fen', 'fizik', 'kimya', 'biyoloji', 'tarih', 'cografya', 'ataturk'];
const materialTypes = ['ders-kitabi', 'kaynak', 'yardimci', 'sorular'];

export default function EducationPage() {
  const [activeLevel, setActiveLevel] = useState('all');
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);

  const filtered = mockMaterials.filter((m) => {
    if (activeLevel !== 'all' && m.level !== activeLevel) return false;
    if (activeSubject && m.subject !== activeSubject) return false;
    if (activeType && m.type !== activeType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Egitim Rafi</h1>
        <p className="text-nomad-slate text-sm">Cevrimdisi egitim kaynaklari ve ders materyalleri</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {levels.map((level) => (
          <Button
            key={level.id}
            variant={activeLevel === level.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveLevel(level.id)}
          >
            <level.icon className="h-3.5 w-3.5 mr-1" />
            {level.label}
          </Button>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="w-56 flex-shrink-0 space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Konu</h3>
            <div className="space-y-1">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubject(activeSubject === sub ? null : sub)}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm capitalize transition-colors ${
                    activeSubject === sub
                      ? 'bg-nomad-green/10 text-nomad-green'
                      : 'hover:bg-nomad-border'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Materyal Tipi</h3>
            <div className="space-y-1">
              {materialTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveType(activeType === t ? null : t)}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm capitalize transition-colors ${
                    activeType === t
                      ? 'bg-nomad-green/10 text-nomad-green'
                      : 'hover:bg-nomad-border'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-12 w-12 text-nomad-slate mx-auto mb-4" />
              <p className="text-nomad-slate">Bu filtrelerle eslesen materyal bulunamadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((material) => (
                <Card key={material.id} className="border-nomad-border card-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{material.title}</CardTitle>
                      <div className="flex flex-col items-end gap-1">
                        {material.offline ? (
                          <Badge variant="default" className="text-[10px]">
                            <CheckCircle className="h-2.5 w-2.5 mr-1" />
                            Cevrimdisi
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            <Clock className="h-2.5 w-2.5 mr-1" />
                            Senkronize Degil
                          </Badge>
                        )}
                        {material.rightsStatus === 'public-download' && (
                          <Badge variant="outline" className="text-[10px]">
                            <Shield className="h-2.5 w-2.5 mr-1" />
                            Herkese Acik
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-nomad-slate mb-3">{material.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className="text-[10px] capitalize">{material.subject}</Badge>
                        <Badge variant="outline" className="text-[10px] capitalize">{material.type}</Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Indir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
