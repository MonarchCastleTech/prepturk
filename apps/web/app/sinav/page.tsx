'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  GraduationCap,
  Clock,
  Target,
  CheckCircle2,
  Circle,
  Trophy,
  Flame,
  BookOpen,
  Calendar,
  BarChart3,
  Sparkles,
} from 'lucide-react';

interface ExamConfig {
  id: string;
  name: string;
  fullName: string;
  targetDate: string;
  subjects: string[];
}

interface StudyProgress {
  selectedExamId: string;
  studiedTopics: string[];
  sessionsCompleted: number;
  totalStudyMinutes: number;
  lastSession: string;
}

const EXAMS: ExamConfig[] = [
  {
    id: 'lgs',
    name: 'LGS',
    fullName: 'Liselere Geçiş Hazırlığı',
    targetDate: '2026-06-14T09:30:00',
    subjects: [
      'Türkçe - Sözcükte Anlam',
      'Türkçe - Paragraf Yorumu',
      'Matematik - Doğal Sayılar',
      'Matematik - Denklemler',
      'Fen Bilimleri - Mevsimler ve İklim',
      'Fen Bilimleri - DNA ve Genetik Kod',
      'T.C. İnkılap Tarihi - Millî Uyanış',
      'Din Kültürü - Zekât ve Sadaka',
    ],
  },
  {
    id: 'tyt',
    name: 'TYT',
    fullName: 'Temel Yeterlilik Hazırlığı',
    targetDate: '2026-06-20T10:15:00',
    subjects: [
      'Türkçe - Paragraf',
      'Türkçe - Yazım Kuralları',
      'Matematik - Problemler',
      'Matematik - Temel Kavramlar',
      'Tarih - İnkılap Tarihi',
      'Coğrafya - Harita Bilgisi',
      'Fizik - Isı ve Sıcaklık',
      'Kimya - Asitler ve Bazlar',
      'Biyoloji - Ekoloji',
    ],
  },
  {
    id: 'ayt',
    name: 'AYT',
    fullName: 'Alan Yeterlilik Hazırlığı',
    targetDate: '2026-06-21T10:15:00',
    subjects: [
      'Matematik - Limit ve Süreklilik',
      'Matematik - Türev',
      'Matematik - İntegral',
      'Fizik - Newton Hareket Yasaları',
      'Kimya - Elektrokimya',
      'Biyoloji - Fotosentez',
      'Tarih - Atatürk Dönemi',
      'Coğrafya - Bölgesel Kalkınma',
    ],
  },
  {
    id: 'kpss',
    name: 'KPSS',
    fullName: 'Kamu Personeli Hazırlığı',
    targetDate: '2026-07-12T10:00:00',
    subjects: [
      'Türkçe - Anlatım Bozuklukları',
      'Matematik - Grafik Okuma',
      'Tarih - Osmanlı Devleti',
      'Coğrafya - Türkiye İklimi',
      'Vatandaşlık - Anayasa',
      'Vatandaşlık - İdare Hukuku',
      'Güncel Bilgiler - Uluslararası Kuruluşlar',
    ],
  },
  {
    id: 'ales',
    name: 'ALES',
    fullName: 'Akademik Yeterlilik Hazırlığı',
    targetDate: '2026-11-15T10:00:00',
    subjects: [
      'Sözel Yetenek - Sözel Mantık',
      'Sözel Yetenek - Okuduğunu Anlama',
      'Sayısal Yetenek - Sayısal Mantık',
      'Sayısal Yetenek - Problemler',
      'Sayısal Yetenek - Grafik Yorumlama',
    ],
  },
];

const MOTIVATIONAL_PHRASES = [
  'Kısa ama düzenli oturumlar uzun maratonda en güvenilir ritmi kurar.',
  'Bugünün temiz çalışma planı, sınav gününün sakinliğini hazırlar.',
  'Az ama sürekli ilerleme, son hafta telaşından daha değerlidir.',
];

const STORAGE_KEY = 'prepturk:studyProgress';

function loadProgress(): StudyProgress {
  if (typeof window === 'undefined') {
    return {
      selectedExamId: 'lgs',
      studiedTopics: [],
      sessionsCompleted: 0,
      totalStudyMinutes: 0,
      lastSession: '',
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    return {
      selectedExamId: 'lgs',
      studiedTopics: [],
      sessionsCompleted: 0,
      totalStudyMinutes: 0,
      lastSession: '',
    };
  }

  return {
    selectedExamId: 'lgs',
    studiedTopics: [],
    sessionsCompleted: 0,
    totalStudyMinutes: 0,
    lastSession: '',
  };
}

function saveProgress(progress: StudyProgress) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const update = () => {
      const target = new Date(targetDate).getTime();
      const diff = Math.max(0, target - Date.now());

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    };

    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: 'Gün', value: timeLeft.days },
    { label: 'Saat', value: timeLeft.hours },
    { label: 'Dakika', value: timeLeft.minutes },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {units.map((unit) => (
        <div key={unit.label} className="rounded-2xl border border-white/8 bg-black/20 p-4 text-center">
          <div className="text-3xl font-semibold text-white">{String(unit.value).padStart(2, '0')}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{unit.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function ExamPage() {
  const [progress, setProgress] = useState<StudyProgress>(loadProgress);
  const [showSessionTimer, setShowSessionTimer] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);
  const [motivationIdx, setMotivationIdx] = useState(0);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setMotivationIdx((current) => (current + 1) % MOTIVATIONAL_PHRASES.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const selectedExam = EXAMS.find((exam) => exam.id === progress.selectedExamId) || EXAMS[0];

  const handleExamChange = (examId: string) => {
    const nextProgress = { ...progress, selectedExamId: examId, studiedTopics: [] };
    setProgress(nextProgress);
    saveProgress(nextProgress);
  };

  const toggleTopic = (subject: string) => {
    const studiedTopics = progress.studiedTopics.includes(subject)
      ? progress.studiedTopics.filter((entry) => entry !== subject)
      : [...progress.studiedTopics, subject];

    const nextProgress = { ...progress, studiedTopics };
    setProgress(nextProgress);
    saveProgress(nextProgress);
  };

  const startSession = () => {
    setShowSessionTimer(true);
    setSessionMinutes(0);
    const timer = setInterval(() => {
      setSessionMinutes((current) => current + 1);
    }, 60000);
    setSessionTimer(timer as unknown as NodeJS.Timeout);
  };

  const endSession = () => {
    if (sessionTimer) {
      clearInterval(sessionTimer);
    }

    setShowSessionTimer(false);
    const nextProgress = {
      ...progress,
      sessionsCompleted: progress.sessionsCompleted + 1,
      totalStudyMinutes: progress.totalStudyMinutes + sessionMinutes,
      lastSession: new Date().toISOString(),
    };
    setProgress(nextProgress);
    saveProgress(nextProgress);
  };

  const progressPct = selectedExam.subjects.length
    ? Math.round((progress.studiedTopics.length / selectedExam.subjects.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(20,28,35,0.96),rgba(13,18,24,0.94))] p-6 shadow-panel sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              <GraduationCap className="h-3.5 w-3.5 text-emerald-300" />
              Akademik Hazırlık
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Sınav Komuta Merkezi
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Hedef sınav seçimi, çalışma oturumu, ilerleme yüzdesi ve konu takibi aynı hazırlık ekranında yönetilir.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            <div className="flex items-center gap-2 font-medium">
              <Sparkles className="h-4 w-4" />
              {MOTIVATIONAL_PHRASES[motivationIdx]}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Aktif hazırlık</p>
            <p className="mt-3 text-xl font-semibold text-white">{selectedExam.name}</p>
            <p className="mt-2 text-sm text-slate-300">{selectedExam.fullName}</p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/80">Hedef tarih</p>
            <p className="mt-3 text-xl font-semibold text-white">
              {new Date(selectedExam.targetDate).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <p className="mt-2 text-sm text-amber-50/75">Planlanan çalışma hedefi</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Bugünkü çalışma ritmi</p>
            <p className="mt-3 text-xl font-semibold text-white">{progress.sessionsCompleted} oturum</p>
            <p className="mt-2 text-sm text-slate-300">{progress.totalStudyMinutes} dakika toplam çalışma</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr),340px]">
        <div className="space-y-6">
          <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] shadow-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-sky-300" />
                Sınav seçimi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                {EXAMS.map((exam) => (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => handleExamChange(exam.id)}
                    className={
                      progress.selectedExamId === exam.id
                        ? 'rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left'
                        : 'rounded-2xl border border-white/8 bg-black/15 p-4 text-left transition-colors hover:border-white/15 hover:bg-black/25'
                    }
                  >
                    <div className="text-sm font-semibold text-white">{exam.name}</div>
                    <div className="mt-1 text-xs text-slate-300">{exam.fullName}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] shadow-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BookOpen className="h-5 w-5 text-emerald-300" />
                Konu kontrol listesi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedExam.subjects.map((subject) => {
                  const isStudied = progress.studiedTopics.includes(subject);

                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleTopic(subject)}
                      className={
                        isStudied
                          ? 'flex w-full items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-left'
                          : 'flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-black/15 p-3 text-left transition-colors hover:border-white/15 hover:bg-black/25'
                      }
                    >
                      {isStudied ? (
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-300" />
                      ) : (
                        <Circle className="h-5 w-5 flex-shrink-0 text-slate-500" />
                      )}
                      <span className={isStudied ? 'flex-1 text-sm text-slate-300 line-through' : 'flex-1 text-sm text-white'}>
                        {subject}
                      </span>
                      {isStudied && <Badge variant="outline">Tamamlandı</Badge>}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] shadow-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5 text-amber-300" />
                Geri sayım
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CountdownTimer targetDate={selectedExam.targetDate} />
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] shadow-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Flame className="h-5 w-5 text-rose-300" />
                Oturum yönetimi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showSessionTimer ? (
                <Button onClick={startSession} size="lg" className="w-full gap-2">
                  <Flame className="h-4 w-4" />
                  Çalışma oturumunu başlat
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-center">
                    <p className="text-xs uppercase tracking-[0.18em] text-amber-100/80">Aktif oturum</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{sessionMinutes} dk</p>
                  </div>
                  <Button variant="destructive" onClick={endSession} className="w-full">
                    Oturumu bitir
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Trophy className="h-4 w-4 text-emerald-300" />
                    Oturum
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">{progress.sessionsCompleted}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <BarChart3 className="h-4 w-4 text-sky-300" />
                    Süre
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">{progress.totalStudyMinutes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(19,26,33,0.95),rgba(14,20,25,0.95))] shadow-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="h-5 w-5 text-emerald-300" />
                İlerleme görünümü
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-full border border-white/8 bg-black/20">
                <div
                  className="h-4 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{progress.studiedTopics.length} konu tamamlandı</span>
                <span>%{progressPct}</span>
              </div>
              <p className="text-sm text-slate-300">
                Kalan konu sayısı: {selectedExam.subjects.length - progress.studiedTopics.length}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
