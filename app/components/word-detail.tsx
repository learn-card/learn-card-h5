'use client';

import { useCallback } from 'react';

import type { WordDetail } from '../types';

type WordDetailProps = {
  detail: WordDetail;
};

export function WordDetailView({ detail }: WordDetailProps) {
  // 优先使用content字段的数据
  const contentTrans = detail.content?.trans;
  const contentSyno = detail.content?.syno;
  const contentPhrases = detail.content?.phrase;
  const contentRelWords = detail.content?.relWord;
  const contentSentences = detail.content?.sentence;
  
  // 音标信息：优先使用content字段
  const ukphone = detail.content?.ukphone || detail.ukphone;
  const usphone = detail.content?.usphone || detail.usphone;
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
  
  // 释义信息：优先使用content字段
  const translations = contentTrans || detail.trans || [];
  const normalizedTranslations = translations.map((item) => {
    const maybeContent = item as any;
    if (maybeContent && typeof maybeContent === 'object' && 'tranCn' in maybeContent && 'tranOther' in maybeContent && ('descCn' in maybeContent || 'descOther' in maybeContent)) {
      return {
        pos: undefined as string | undefined,
        cn: String(maybeContent.tranCn ?? ''),
        en: maybeContent.tranOther ? String(maybeContent.tranOther) : undefined,
        note: maybeContent.descCn ? String(maybeContent.descCn) : maybeContent.descOther ? String(maybeContent.descOther) : undefined,
      };
    }
    const fallbackItem = item as WordDetail['trans'][number];
    return {
      pos: fallbackItem.pos,
      cn: fallbackItem.tranCn,
      en: fallbackItem.tranOther,
      note: undefined as string | undefined,
    };
  });
  
  // 同义词信息：优先使用content字段
  const synonyms = contentSyno?.synos
    ? contentSyno.synos.map((item) => ({
        pos: item.pos,
        words: item.hwds.map((h) => h.w),
        notes: item.tran,
      }))
    : (detail.syno ?? []).map((item) => ({
        pos: item.pos,
        words: item.hwds,
        notes: item.tran,
      }));
  
  // 短语信息：优先使用content字段
  const phrases = contentPhrases?.phrases
    ? contentPhrases.phrases.map((item) => ({
        phrase: item.pContent,
        meaning: item.pCn,
      }))
    : (detail.phrase ?? []).map((item) => ({
        phrase: item.phrase,
        meaning: item.meaning,
      }));
  
  // 同根词信息：优先使用content字段
  const relWords = contentRelWords?.rels
    ? contentRelWords.rels.map((group) => ({
        pos: group.pos,
        words: group.words.map((word) => ({
          head: word.hwd,
          meaning: word.tran,
        })),
      }))
    : (detail.relWord ?? []).map((group) => ({
        pos: group.pos,
        words: group.words.map((word) => ({
          head: word.headWord,
          meaning: word.tranCn,
        })),
      }));
  
  // 例句信息：优先使用content字段
  const sentences = contentSentences?.sentences || detail.sentences || [];
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold text-white">{detail.wordHead}</h1>
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
      </header>

      <section className="rounded-3xl border border-white/5 bg-slate-900/70 p-6 shadow-lg shadow-emerald-500/10">
        <h2 className="text-sm uppercase tracking-[0.4em] text-emerald-300/80">释义</h2>
        <ul className="mt-4 space-y-4 text-sm text-slate-200">
          {normalizedTranslations.map((item, index) => (
            <li key={index} className="space-y-2">
              <p className="text-lg">
                {item.pos ? <span className="mr-2 text-emerald-300">{item.pos}</span> : null}
                {item.cn}
              </p>
              {item.en ? <p className="text-sm text-slate-400">{item.en}</p> : null}
              {item.note ? <p className="text-xs text-slate-500">{item.note}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      {synonyms.length > 0 ? (
        <section className="rounded-3xl border border-white/5 bg-slate-900/50 p-6">
          <h2 className="text-sm uppercase tracking-[0.4em] text-emerald-300/80">同近义</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            {synonyms.slice(0, 4).map((item, index) => (
              <li key={index} className="space-y-2">
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
        <section className="rounded-3xl border border-white/5 bg-slate-900/50 p-6">
          <h2 className="text-sm uppercase tracking-[0.4em] text-emerald-300/80">短语</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            {phrases.map((item, index) => (
              <li key={index}>
                <p className="font-medium text-white">{item.phrase}</p>
                {item.meaning ? (
                  <p className="mt-1 text-slate-400">{item.meaning}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {relWords.length > 0 ? (
        <section className="rounded-3xl border border-white/5 bg-slate-900/50 p-6">
          <h2 className="text-sm uppercase tracking-[0.4em] text-emerald-300/80">同根词</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            {relWords.map((item, index) => (
              <li key={index} className="space-y-2">
                {item.pos ? <p className="text-emerald-200/80">{item.pos}</p> : null}
                <ul className="mt-1 flex flex-wrap gap-2 text-slate-300">
                  {item.words.map((word) => (
                    <li
                      key={`${word.head}-${word.meaning ?? ''}`}
                      className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1"
                    >
                      <span className="mr-2 text-white">{word.head}</span>
                      {word.meaning ? (
                        <span className="text-xs text-slate-400">{word.meaning}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {sentences && sentences.length > 0 ? (
        <section className="rounded-3xl border border-white/5 bg-slate-900/40 p-6">
          <h2 className="text-sm uppercase tracking-[0.4em] text-emerald-300/80">例句</h2>
          <ul className="mt-4 space-y-4 text-sm text-slate-200">
            {sentences.map((item, index) => (
              <li key={index}>
                <p className="font-medium text-white">{item.sContent}</p>
                {item.sCn ? <p className="mt-1 text-slate-400">{item.sCn}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
