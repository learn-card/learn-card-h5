'use client';

import { useCallback } from 'react';

import type { WordDetail } from '../types';

type WordCardProps = {
  total: number;
  currentIndex: number;
  detail: WordDetail;
  onWordClick: () => void;
};

export function WordCard({ total, currentIndex, detail, onWordClick }: WordCardProps) {
  const content = detail.content;
  const rawTranslations = content?.trans ?? detail.trans ?? [];
  const translations = rawTranslations.map((item) => {
    const maybeContent = item as any;
    if (maybeContent && typeof maybeContent === 'object' && 'tranCn' in maybeContent && 'tranOther' in maybeContent && ('descCn' in maybeContent || 'descOther' in maybeContent)) {
      return {
        pos: undefined as string | undefined,
        cn: String(maybeContent.tranCn ?? ''),
        en: maybeContent.tranOther ? String(maybeContent.tranOther) : undefined,
        labelCn: maybeContent.descCn ? String(maybeContent.descCn) : undefined,
        labelEn: maybeContent.descOther ? String(maybeContent.descOther) : undefined,
      };
    }
    const fallbackItem = item as WordDetail['trans'][number];
    return {
      pos: fallbackItem.pos,
      cn: fallbackItem.tranCn,
      en: fallbackItem.tranOther,
      labelCn: undefined as string | undefined,
      labelEn: undefined as string | undefined,
    };
  });

  const sentences = content?.sentence?.sentences ?? detail.sentences ?? [];
  const firstSentence = sentences[0];

  const synonyms = content?.syno?.synos
    ? content.syno.synos.map((item) => ({
        pos: item.pos,
        words: item.hwds.map((h) => h.w),
        notes: item.tran,
      }))
    : (detail.syno ?? []).map((item) => ({
        pos: item.pos,
        words: item.hwds,
        notes: item.tran,
      }));

  const phrases = content?.phrase?.phrases
    ? content.phrase.phrases.map((item) => ({
        phrase: item.pContent,
        meaning: item.pCn,
      }))
    : (detail.phrase ?? []).map((item) => ({
        phrase: item.phrase,
        meaning: item.meaning,
      }));

  const ukphone = content?.ukphone ?? detail.ukphone;
  const usphone = content?.usphone ?? detail.usphone;
  const playPronunciation = useCallback(
    (variant: 'uk' | 'us') => {
      const word = detail.wordHead;
      if (!word) return;
      const type = variant === 'uk' ? 1 : 2;
      const audio = new Audio(
        `https://dict.youdao.com/dictvoice?type=${type}&audio=${encodeURIComponent(word)}`
      );
      audio.play().catch(() => {
        // Ignore playback errors silently
      });
    },
    [detail.wordHead]
  );
  const progressPercent = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0;

  return (
    <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-900/10 p-8 shadow-xl shadow-emerald-500/10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>学习进度</span>
            <span>
              {currentIndex + 1} / {total}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-teal-400"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onWordClick}
            className="text-left text-4xl font-bold text-white transition hover:text-emerald-200 focus:outline-none"
          >
            {detail.wordHead}
          </button>
          <div className="flex flex-wrap gap-3 text-sm text-emerald-200/90">
            {ukphone ? (
              <button
                type="button"
                onClick={() => playPronunciation('uk')}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-emerald-200 transition hover:border-emerald-300/70 hover:text-emerald-100 focus:outline-none"
                aria-label={`播放英式发音 ${detail.wordHead}`}
              >
                <span>UK /{ukphone}/</span>
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
            ) : null}
            {usphone ? (
              <button
                type="button"
                onClick={() => playPronunciation('us')}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-emerald-200 transition hover:border-emerald-300/70 hover:text-emerald-100 focus:outline-none"
                aria-label={`播放美式发音 ${detail.wordHead}`}
              >
                <span>US /{usphone}/</span>
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>

        {translations.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-[0.4em] text-emerald-200/70">释义</h2>
            <ul className="space-y-4 text-sm text-slate-200">
              {translations.map((item, index) => (
                <li key={index} className="space-y-2">
                  <p className="text-lg">
                    {item.pos ? <span className="mr-2 text-emerald-300">{item.pos}</span> : null}
                    {item.cn}
                  </p>
                  {item.en ? <p className="text-sm text-slate-400">{item.en}</p> : null}
                  {item.labelCn || item.labelEn ? (
                    <p className="text-xs text-slate-500">
                      {item.labelCn ?? item.labelEn}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {firstSentence ? (
          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.4em] text-emerald-200/70">例句</h2>
            <p className="text-sm text-slate-200">
              <span className="font-medium text-white">{firstSentence.sContent}</span>
            </p>
            {firstSentence.sCn ? (
              <p className="text-sm text-slate-400">{firstSentence.sCn}</p>
            ) : null}
          </section>
        ) : null}

        {synonyms.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-[0.4em] text-emerald-200/70">同近义词</h2>
            <ul className="space-y-3 text-sm text-slate-200">
              {synonyms.slice(0, 3).map((item, index) => (
                <li key={index} className="space-y-1">
                  {item.pos ? <p className="text-emerald-200/90">{item.pos}</p> : null}
                  {item.words.length > 0 ? (
                    <div className="flex flex-wrap gap-2 text-xs text-emerald-200/80">
                      {item.words.map((word) => (
                        <span
                          key={word}
                          className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {item.notes ? (
                    <p className="text-xs text-slate-400">{item.notes}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {phrases.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-[0.4em] text-emerald-200/70">常用短语</h2>
            <ul className="space-y-2 text-sm text-slate-200">
              {phrases.slice(0, 3).map((item, index) => (
                <li key={index}>
                  <p className="font-medium text-white">{item.phrase}</p>
                  {item.meaning ? (
                    <p className="text-xs text-slate-400">{item.meaning}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
