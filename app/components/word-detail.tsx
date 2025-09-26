'use client';

import type { WordDetail } from '../data/mock';

type WordDetailProps = {
  detail: WordDetail;
  onBack: () => void;
};

export function WordDetailView({ detail, onBack }: WordDetailProps) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{detail.wordHead}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-emerald-200/90">
            {detail.ukphone ? <span>UK /{detail.ukphone}/</span> : null}
            {detail.usphone ? <span>US /{detail.usphone}/</span> : null}
          </div>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-300/40"
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
          返回卡片
        </button>
      </header>

      <section className="rounded-3xl border border-white/5 bg-slate-900/70 p-6 shadow-lg shadow-emerald-500/10">
        <h2 className="text-sm uppercase tracking-[0.4em] text-emerald-300/80">释义</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-200">
          {detail.trans?.map((item, index) => (
            <li key={index} className="leading-relaxed">
              {item.pos ? <span className="mr-2 text-emerald-300">{item.pos}</span> : null}
              <span>{item.tranCn}</span>
              {item.tranOther ? (
                <span className="ml-2 text-slate-400">{item.tranOther}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {detail.syno && detail.syno.length > 0 ? (
        <section className="rounded-3xl border border-white/5 bg-slate-900/50 p-6">
          <h2 className="text-sm uppercase tracking-[0.4em] text-emerald-300/80">同近义</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            {detail.syno.map((item, index) => (
              <li key={index}>
                <p className="text-emerald-200/90">{item.pos}</p>
                <p className="mt-1 text-slate-200">{item.hwds.join(' / ')}</p>
                <p className="mt-1 text-xs text-slate-400">{item.tran}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {detail.phrase && detail.phrase.length > 0 ? (
        <section className="rounded-3xl border border-white/5 bg-slate-900/50 p-6">
          <h2 className="text-sm uppercase tracking-[0.4em] text-emerald-300/80">短语</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            {detail.phrase.map((item, index) => (
              <li key={index}>
                <p className="font-medium text-white">{item.phrase}</p>
                <p className="mt-1 text-slate-400">{item.meaning}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {detail.relWord && detail.relWord.length > 0 ? (
        <section className="rounded-3xl border border-white/5 bg-slate-900/50 p-6">
          <h2 className="text-sm uppercase tracking-[0.4em] text-emerald-300/80">同根词</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            {detail.relWord.map((item, index) => (
              <li key={index}>
                <p className="text-emerald-200/80">{item.pos}</p>
                <ul className="mt-1 flex flex-wrap gap-2 text-slate-300">
                  {item.words.map((word) => (
                    <li
                      key={`${word.headWord}-${word.tranCn}`}
                      className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1"
                    >
                      <span className="mr-2 text-white">{word.headWord}</span>
                      <span className="text-xs text-slate-400">{word.tranCn}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {detail.sentences && detail.sentences.length > 0 ? (
        <section className="rounded-3xl border border-white/5 bg-slate-900/40 p-6">
          <h2 className="text-sm uppercase tracking-[0.4em] text-emerald-300/80">例句</h2>
          <ul className="mt-4 space-y-4 text-sm text-slate-200">
            {detail.sentences.map((item, index) => (
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
