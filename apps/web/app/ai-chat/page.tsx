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
} from 'lucide-react';

export default function AIChatPage() {
  const { messages, send, isSending } = useAIChat();
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
        return { status: 'success' as const, label: 'Yuksek Guven' };
      case 'medium':
        return { status: 'warning' as const, label: 'Orta Guven' };
      case 'low':
        return { status: 'info' as const, label: 'Dusuk Guven' };
      default:
        return { status: 'info' as const, label: 'Kaynak Yok' };
    }
  };

  const modeButtons = [
    {
      label: 'Odev Modu',
      active: isHomeworkMode,
      onClick: toggleHomeworkMode,
      icon: BookMarked,
      activeClassName: 'bg-amber-600 hover:bg-amber-700 border-amber-500/40',
    },
    {
      label: 'Sadece Resmi',
      active: officialOnly,
      onClick: () => setOfficialOnly(!officialOnly),
      icon: ShieldCheck,
      activeClassName: 'bg-emerald-700 hover:bg-emerald-800 border-emerald-500/40',
    },
    {
      label: 'Cocuk Guvenli',
      active: childSafe,
      onClick: () => setChildSafe(!childSafe),
      icon: Baby,
      activeClassName: 'bg-sky-700 hover:bg-sky-800 border-sky-500/40',
    },
    {
      label: '15 Yas Aciklama',
      active: explain15,
      onClick: () => setExplain15(!explain15),
      icon: GraduationCap,
      activeClassName: 'bg-indigo-700 hover:bg-indigo-800 border-indigo-500/40',
    },
    {
      label: 'Adim Adim',
      active: stepByStep,
      onClick: () => setStepByStep(!stepByStep),
      icon: ListTodo,
      activeClassName: 'bg-slate-700 hover:bg-slate-800 border-slate-500/40',
    },
  ];

  return (
    <div className="space-y-6 text-white">
      <section className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(20,28,35,0.96),rgba(13,18,24,0.94))] p-5 shadow-panel sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
          <div>
            <p className="shell-kicker">Assistant workspace</p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              <Sparkles className="h-7 w-7 text-emerald-300" />
              AI Asistan
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Yerel RAG destekli yardim katmani. Sorulari belge baglami ve guven sinyali ile cevaplar.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4">
            <p className="shell-muted-label">Kaynak modu</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Cevaplar yerel dokumanlara dayanir, alinti ve guven sinyali ile birlikte gosterilir.
            </p>
          </div>
        </div>
      </section>

      {isHomeworkMode && (
        <section className="rounded-[1.5rem] border border-amber-500/25 bg-amber-500/10 px-4 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-300" />
            <div>
              <p className="text-sm font-semibold text-amber-200">Odev modu aktif</p>
              <p className="mt-1 text-sm leading-6 text-amber-100/85">
                Cevaplar ipucu mantiginda verilir, dogrudan kopyalanabilir sonuc uretilmez.
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="rounded-[1.7rem] border border-white/8 bg-[linear-gradient(180deg,rgba(16,21,26,0.94),rgba(10,13,17,0.9))] p-5 shadow-panel sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-white">Sohbet Akisi</h2>
            <div className="hidden rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 sm:inline-flex">
              Yerel yanit
            </div>
          </div>

          <div className="mt-5 min-h-[26rem] space-y-4">
            {messages.length === 0 ? (
              <div className="flex min-h-[24rem] items-center justify-center rounded-[1.4rem] border border-dashed border-white/10 bg-black/15 px-6 py-10 text-center">
                <div className="max-w-md">
                  <MessageSquare className="mx-auto h-14 w-14 text-slate-500" />
                  <h3 className="mt-4 text-lg font-semibold text-white">Nasil yardimci olabilirim?</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Mevzuat, acil durum, egitim veya idari konularda soru sorabilirsiniz. Tum yanitlar
                    yerel belge baglami ile desteklenir.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {['Deprem aninda ne yapmaliyim?', 'Ehliyet almak icin gerekenler', 'Iscilik kanunu ozeti'].map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200 transition-colors hover:border-emerald-400/25 hover:bg-emerald-400/[0.07]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-2xl ${msg.role === 'user' ? 'order-2' : ''}`}>
                      <div
                        className={`rounded-[1.2rem] p-4 ${
                          msg.role === 'user'
                            ? 'border border-emerald-500/25 bg-emerald-500/10'
                            : 'border border-white/8 bg-white/[0.03]'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="mb-3 flex items-center gap-2">
                            <StatusChip {...confidenceLabel(msg.confidence)} />
                          </div>
                        )}

                        <div className={`text-sm ${msg.role === 'user' ? '' : 'prose prose-invert prose-sm max-w-none'}`}>
                          {msg.role === 'user' ? <p>{msg.content}</p> : <ReactMarkdown>{msg.content}</ReactMarkdown>}
                        </div>

                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-4 border-t border-white/8 pt-3">
                            <p className="text-xs font-medium text-slate-400">Kaynaklar</p>
                            <div className="mt-2 space-y-2">
                              {msg.citations.map((cit, i) => (
                                <Link
                                  key={i}
                                  href={`/documents/${cit.document_id}`}
                                  className="flex items-start gap-2 rounded-xl border border-white/8 bg-black/15 p-3 transition-colors hover:border-emerald-400/25"
                                >
                                  <FileText className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs text-slate-200">{cit.citation_text}</p>
                                    <div className="mt-2">
                                      <Badge variant="outline" className="text-[10px]">
                                        Guven: {Math.round((cit.confidence_score || 0) * 100)}%
                                      </Badge>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <p className="mt-1 px-1 text-[10px] text-slate-500">
                        {formatTurkishDate(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {isSending && (
                  <div className="flex justify-start">
                    <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '0ms' }} />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '150ms' }} />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-slate-400">Dusunuyor...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-5 flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mesajinizi yazin..."
              className="flex-1"
              disabled={isSending}
            />
            <Button onClick={handleSend} disabled={isSending || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <section className="rounded-[1.7rem] border border-white/8 bg-[linear-gradient(180deg,rgba(16,21,26,0.94),rgba(10,13,17,0.9))] p-5 shadow-panel sm:p-6">
          <h2 className="text-2xl font-semibold text-white">Modlar</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {modeButtons.map((mode) => {
              const Icon = mode.icon;
              return (
                <Button
                  key={mode.label}
                  variant={mode.active ? 'default' : 'outline'}
                  size="sm"
                  onClick={mode.onClick}
                  className={`text-xs ${mode.active ? mode.activeClassName : ''}`}
                >
                  <Icon className="mr-1 h-3.5 w-3.5" />
                  {mode.label}
                </Button>
              );
            })}
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] px-4 py-4">
              <p className="shell-muted-label">Varsayim</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Cevaplar yerel belgelerden alinti ile gelir. Belirsizlik varsa bunu acikca soyler.
              </p>
            </div>
            <div className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] px-4 py-4">
              <p className="shell-muted-label">Kullanim</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Resmi mod, cocuk guvenli aciklama ve adim adim anlatim ayni sohbet akisi uzerinde birlikte calisir.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
