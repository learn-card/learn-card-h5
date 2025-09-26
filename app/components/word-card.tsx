'use client';

import type { WordDetail } from '../data/mock';

type WordCardProps = {
  bookTitle: string;
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
  bookTitle,
  total,
  currentIndex,
  detail,
  onPrev,
  onNext,
  onViewDetail,
  disablePrev,
  disableNext,
}: WordCardProps) {
  const primaryTrans = detail.trans?.[0];
  const firstSentence = detail.sentences?.[0];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-200">{bookTitle}</h1>
          <p className="mt-1 text-sm text-slate-400">
            进度 {currentIndex + 1} / {total}
          </p>
        </div>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.4em] text-emerald-200">
          LEARN
        </span>
      </div>
      <div
        className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-900/10 p-8 shadow-xl shadow-emerald-500/10 transition hover:shadow-emerald-500/20"
        onClick={onViewDetail}
      >
        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-bold text-white">{detail.wordHead}</span>
          <div className="flex flex-wrap items-center gap-3 text-sm text-emerald-200/90">
            {detail.ukphone ? (
              <span>UK /{detail.ukphone}/</span>
            ) : null}
            {detail.usphone ? (
              <span>US /{detail.usphone}/</span>
            ) : null}
          </div>
        </div>
        {primaryTrans ? (
          <p className="mt-6 text-lg text-slate-200">
            {primaryTrans.pos ? <span className="mr-2 text-emerald-300">{primaryTrans.pos}</span> : null}
            {primaryTrans.tranCn}
          </p>
        ) : null}
        {firstSentence ? (
          <p className="mt-4 text-sm text-slate-400">
            {firstSentence.sContent}
            {firstSentence.sCn ? (
              <span className="ml-2 text-slate-500">{firstSentence.sCn}</span>
            ) : null}
          </p>
        ) : null}
        <p className="mt-6 text-xs uppercase tracking-[0.4em] text-slate-500">
          点击查看详情
        </p>
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
          onClick={onViewDetail}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-6 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
        >
          查看详情
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
