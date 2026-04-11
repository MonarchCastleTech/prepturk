'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useAIChat } from '../../hooks/useAI';
import { useHomeworkMode } from '../../hooks/useHomeworkMode';
import { useAIChatStore } from '../../lib/stores';
import { formatTurkishDate } from '../../lib/turkish';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import StatusChip from '../../components/StatusChip';
import {
  AlertTriangle,
  Baby,
  BookMarked,
  FileText,
  GraduationCap,
  ListTodo,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Trash2
} from 'lucide-react';

export default function AIChatPage() {
  const { messages, send, isSending, clear } = useAIChat();
  const { isHomeworkMode, toggleHomeworkMode } = useHomeworkMode();
  const {
    officialOnly, setOfficialOnly,
    childSafe, setChildSafe,
    explain15, setExplain15,
    stepByStep, setStepByStep,
  } = useAIChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isSending) return;
    send(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const confidenceLabel = (c?: string) => {
    switch (c) {
      case 'high':
        return { status: 'success' as const, label: 'Yüksek Güven' };
      case 'medium':
        return { status: 'warning' as const, label: 'Orta Güven' };
      case 'low':
        return { status: 'info' as const, label: 'Düşük Güven' };
      default:
        return { status: 'info' as const, label: 'Kaynak Yok' };
    }
  };

  const modeButtons = [
    {
      label: 'Ödev Modu',
      active: isHomeworkMode,
      onClick: toggleHomeworkMode,
      icon: BookMarked,
      activeClassName: 'bg-amber-600 hover:bg-amber-700 border-amber-500/40',
    },
    {
      label: 'Sadece Resmî',
      active: officialOnly,
      onClick: () => setOfficialOnly(!officialOnly),
      icon: ShieldCheck,
      activeClassName: 'bg-emerald-700 hover:bg-emerald-800 border-emerald-500/40',
    },
    {
      label: 'Çocuk Güvenli',
      active: childSafe,
      onClick: () => setChildSafe(!childSafe),
      icon: Baby,
      activeClassName: 'bg-sky-700 hover:bg-sky-800 border-sky-500/40',
    },
    {
      label: '15 Yaş Açıklama',
      active: explain15,
      onClick: () => setExplain15(!explain15),
      icon: GraduationCap,
      activeClassName: 'bg-indigo-700 hover:bg-indigo-800 border-indigo-500/40',
    },
    {
      label: 'Adım Adım',
      active: stepByStep,
      onClick: () => setStepByStep(!stepByStep),
      icon: ListTodo,
      activeClassName: 'bg-slate-700 hover:bg-slate-800 border-slate-500/40',
    },
  ];

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </Link>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={clear} className="text-slate-400 hover:text-red-400 hover:bg-red-400/5">
            <Trash2 className="h-4 w-4 mr-1" />
            Sohbeti Temizle
          </Button>
        </div>
      </div>

      <section className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(20,28,35,0.96),rgba(13,18,24,0.94))] p-5 shadow-panel sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
          <div>
            <p className="shell-kicker">Asistan Merkezi</p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              <Sparkles className="h-7 w-7 text-emerald-300" />
              Yapay Zekâ Asistanı
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Yerel RAG destekli akıllı asistan. Sorularınızı cihazınızdaki belgelerle çapraz referans vererek cevaplar.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4 flex flex-col justify-center">
            <p className="shell-muted-label">Güvenlik Durumu</p>
            <p className="mt-2 text-sm leading-6 text-emerald-200/80 font-medium flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              %100 Çevrimdışı ve Gizli
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Verileriniz asla cihaz dışına çıkmaz.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="rounded-[1.7rem] border border-white/8 bg-[linear-gradient(180deg,rgba(16,21,26,0.94),rgba(10,13,17,0.9))] p-5 shadow-panel sm:p-6 flex flex-col min-h-[600px]">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="text-xl font-semibold text-white">Sohbet Akışı</h2>
            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
              Yerel Model
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-[1.4rem] border border-dashed border-white/10 bg-black/15 px-6 py-10 text-center">
                <div className="max-w-md">
                  <div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 mb-4">
                    <MessageSquare className="h-10 w-10 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Size nasıl yardımcı olabilirim?</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Mevzuat, acil durum protokolleri veya eğitim materyalleri hakkında sorular sorabilirsiniz.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {[
                      'Deprem anında ne yapmalıyım?', 
                      'Su arıtma yöntemleri nelerdir?', 
                      'İlkyardım çantası hazırlama'
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2 text-xs text-slate-300 transition-all hover:border-emerald-400/30 hover:bg-emerald-400/5"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : ''}`}>
                      <div
                        className={`rounded-2xl p-4 shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-emerald-600 text-white rounded-tr-none'
                            : 'bg-white/5 border border-white/10 rounded-tl-none'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="mb-3 flex items-center gap-2">
                            <StatusChip {...confidenceLabel(msg.confidence)} />
                          </div>
                        )}

                        <div className={`text-sm leading-relaxed ${msg.role === 'user' ? '' : 'prose prose-invert prose-sm max-w-none text-slate-200'}`}>
                          {msg.role === 'user' ? <p>{msg.content}</p> : <ReactMarkdown>{msg.content}</ReactMarkdown>}
                        </div>

                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-4 border-t border-white/10 pt-3">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kaynaklar</p>
                            <div className="mt-2 space-y-2">
                              {msg.citations.map((cit, i) => (
                                <Link
                                  key={i}
                                  href={`/documents/${cit.document_id}`}
                                  className="flex items-start gap-2 rounded-xl border border-white/5 bg-black/20 p-3 transition-colors hover:border-emerald-400/20"
                                >
                                  <FileText className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400/60" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs text-slate-300 truncate">{cit.citation_text}</p>
                                    <div className="mt-1">
                                      <Badge variant="outline" className="text-[9px] h-4 bg-emerald-500/5 text-emerald-400 border-emerald-500/20">
                                        GÜVEN: {Math.round((cit.confidence_score || 0) * 100)}%
                                      </Badge>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <p className={`mt-1 px-1 text-[10px] text-slate-500 ${msg.role === 'user' ? 'text-right' : ''}`}>
                        {formatTurkishDate(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {isSending && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-none bg-white/5 border border-white/10 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '0ms' }} />
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '150ms' }} />
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-slate-400 font-medium">Analiz ediliyor...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-6 flex items-center gap-2 bg-black/20 p-2 rounded-2xl border border-white/5">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mesajınızı yazın..."
              className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              disabled={isSending}
            />
            <Button 
              onClick={handleSend} 
              disabled={isSending || !input.trim()}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white h-10 w-10 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[1.7rem] border border-white/8 bg-[linear-gradient(180deg,rgba(16,21,26,0.94),rgba(10,13,17,0.9))] p-5 shadow-panel sm:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Yanıt Modları</h2>
            <div className="grid gap-2">
              {modeButtons.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.label}
                    onClick={mode.onClick}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      mode.active 
                        ? `${mode.activeClassName} border-transparent` 
                        : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-300'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${mode.active ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-xs font-medium">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.7rem] border border-white/8 bg-black/20 p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Sistem Notları</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <p className="text-xs leading-5 text-slate-400">
                  Tüm yanıtlar yerel kütüphanenizdeki resmî belgelerden alıntılanır.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <p className="text-xs leading-5 text-slate-400">
                  Belirsizlik durumunda yapay zekâ bunu açıkça belirtir ve sizi resmî kurumlara yönlendirir.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
