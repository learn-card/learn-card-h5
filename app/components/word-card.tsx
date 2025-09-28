'use client';

import type { WordDetail } from '../types';

type WordCardProps = {
  total: number;
  currentIndex: number;
  detail: WordDetail;
  onPrev: () => void;
  onNext: () => void;
  onViewDetail: () => void;
  disablePrev?: boolean;
  disableNext?: boolean;
};

export function WordCard({
  total,
  currentIndex,
  detail,
  onPrev,
  onNext,
  onViewDetail,
  disablePrev,
  disableNext,
}: WordCardProps) {
  // 优先使用content字段的数据，如果没有则使用原有字段
  const contentTrans = detail.content?.trans;
  const contentSentences = detail.content?.sentence?.sentences;
  const contentSyno = detail.content?.syno?.synos;
  const contentPhrases = detail.content?.phrase?.phrases;
  
  // 音标信息：优先使用content字段
  const ukphone = detail.content?.ukphone || detail.ukphone;
  const usphone = detail.content?.usphone || detail.usphone;
  
  // 释义信息：优先使用content字段
  const translations = contentTrans || detail.trans || [];
  const primaryTrans = translations[0];
  const extraTranslations = translations.slice(1, 3);
  
  // 同义词信息：优先使用content字段
  const synonymChips = contentSyno 
    ? Array.from(
        new Set(
          contentSyno
            .flatMap((item) => item.hwds.map(h => h.w))
            .filter((item): item is string => Boolean(item && item.trim().length > 0))
        )
      ).slice(0, 4)
    : Array.from(
        new Set(
          (detail.syno ?? [])
            .flatMap((item) => item.hwds)
            .filter((item): item is string => Boolean(item && item.trim().length > 0))
        )
      ).slice(0, 4);
  
  // 短语信息：优先使用content字段
  const phraseHighlights = contentPhrases 
    ? contentPhrases.slice(0, 2).map(p => ({ phrase: p.pContent, meaning: p.pCn }))
    : (detail.phrase ?? []).slice(0, 2);
  
  // 例句信息：优先使用content字段
  const firstSentence = contentSentences?.[0] || detail.sentences?.[0];
  const progressPercent = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-900/10 p-8 shadow-xl shadow-emerald-500/10">
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
        <div className="mt-8 flex items-baseline gap-4">
          <button
            type="button"
            onClick={onViewDetail}
            className="text-left text-4xl font-bold text-white transition hover:text-emerald-200 focus:outline-none"
          >
            {detail.wordHead}
          </button>
          <div className="flex flex-wrap items-center gap-3 text-sm text-emerald-200/90">
            {ukphone ? (
              <span>UK /{ukphone}/</span>
            ) : null}
            {usphone ? (
              <span>US /{usphone}/</span>
            ) : null}
          </div>
        </div>
        {primaryTrans ? (
          <p className="mt-6 text-lg text-slate-200">
            {'pos' in primaryTrans && primaryTrans.pos ? <span className="mr-2 text-emerald-300">{primaryTrans.pos}</span> : null}
            {primaryTrans.tranCn}
            {primaryTrans.tranOther ? (
              <span className="ml-2 text-sm text-slate-400">{primaryTrans.tranOther}</span>
            ) : null}
          </p>
        ) : null}
        {extraTranslations.length > 0 ? (
          <ul className="mt-4 space-y-1 text-sm text-slate-300/90">
            {extraTranslations.map((item, index) => (
              <li key={index} className="leading-relaxed">
                {'pos' in item && item.pos ? <span className="mr-2 text-emerald-300/80">{item.pos}</span> : null}
                <span>{item.tranCn}</span>
                {item.tranOther ? (
                  <span className="ml-2 text-xs text-slate-500">{item.tranOther}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        {firstSentence ? (
          <p className="mt-4 text-sm text-slate-400">
            {firstSentence.sContent}
            {firstSentence.sCn ? (
              <span className="ml-2 text-slate-500">{firstSentence.sCn}</span>
            ) : null}
          </p>
        ) : null}
        {synonymChips.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-emerald-200/80">
            {synonymChips.map((word) => (
              <span
                key={word}
                className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1"
              >
                {word}
              </span>
            ))}
          </div>
        ) : null}
        {phraseHighlights.length > 0 ? (
          <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-200">
            {phraseHighlights.map((item, index) => (
              <div key={`${item.phrase}-${index}`}>
                <p className="font-medium text-white">{item.phrase}</p>
                {item.meaning ? (
                  <p className="mt-1 text-xs text-slate-400">{item.meaning}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={disablePrev}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-6 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-300/50 disabled:cursor-not-allowed disabled:border-white/5 disabled:text-slate-500"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          上一个
        </button>
        <button
          onClick={onNext}
          disabled={disableNext}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-6 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          下一个
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
