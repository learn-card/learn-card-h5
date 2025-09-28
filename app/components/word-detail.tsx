'use client';

import type { WordDetail } from '../types';

type WordDetailProps = {
  detail: WordDetail;
  onBack: () => void;
};

export function WordDetailView({ detail, onBack }: WordDetailProps) {
  // 优先使用content字段的数据
  const contentTrans = detail.content?.trans;
  const contentSyno = detail.content?.syno;
  const contentPhrases = detail.content?.phrase;
  const contentRelWords = detail.content?.relWord;
  const contentSentences = detail.content?.sentence;
  
  // 音标信息：优先使用content字段
  const ukphone = detail.content?.ukphone || detail.ukphone;
  const usphone = detail.content?.usphone || detail.usphone;
  
  // 释义信息：优先使用content字段
  const translations = contentTrans || detail.trans || [];
  
  // 同义词信息：优先使用content字段
  const synonyms = contentSyno?.synos || detail.syno || [];
  
  // 短语信息：优先使用content字段
  const phrases = contentPhrases?.phrases || detail.phrase || [];
  
  // 同根词信息：优先使用content字段
  const relWords = contentRelWords?.rels || detail.relWord || [];
  
  // 例句信息：优先使用content字段
  const sentences = contentSentences?.sentences || detail.sentences || [];
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{detail.wordHead}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-emerald-200/90">
            {ukphone ? <span>UK /{ukphone}/</span> : null}
            {usphone ? <span>US /{usphone}/</span> : null}
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
          {translations.map((item, index) => (
            <li key={index} className="leading-relaxed">
              {'pos' in item && item.pos ? <span className="mr-2 text-emerald-300">{item.pos}</span> : null}
              <span>{item.tranCn}</span>
              {item.tranOther ? (
                <span className="ml-2 text-slate-400">{item.tranOther}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {synonyms && synonyms.length > 0 ? (
        <section className="rounded-3xl border border-white/5 bg-slate-900/50 p-6">
          <h2 className="text-sm uppercase tracking-[0.4em] text-emerald-300/80">同近义</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            {synonyms.map((item, index) => (
              <li key={index}>
                {item.pos ? (
                  <p className="text-emerald-200/90">{item.pos}</p>
                ) : null}
                {('hwds' in item ? item.hwds : []).length > 0 ? (
                  <p className="mt-1 text-slate-200">
                    {('hwds' in item ? item.hwds.map(h => typeof h === 'string' ? h : h.w) : []).join(' / ')}
                  </p>
                ) : null}
                {item.tran ? (
                  <p className="mt-1 text-xs text-slate-400">{item.tran}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {phrases && phrases.length > 0 ? (
        <section className="rounded-3xl border border-white/5 bg-slate-900/50 p-6">
          <h2 className="text-sm uppercase tracking-[0.4em] text-emerald-300/80">短语</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            {phrases.map((item, index) => (
              <li key={index}>
                <p className="font-medium text-white">
                  {'pContent' in item ? item.pContent : item.phrase}
                </p>
                <p className="mt-1 text-slate-400">
                  {'pCn' in item ? item.pCn : item.meaning}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {relWords && relWords.length > 0 ? (
        <section className="rounded-3xl border border-white/5 bg-slate-900/50 p-6">
          <h2 className="text-sm uppercase tracking-[0.4em] text-emerald-300/80">同根词</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            {relWords.map((item, index) => (
              <li key={index}>
                {item.pos ? (
                  <p className="text-emerald-200/80">{item.pos}</p>
                ) : null}
                <ul className="mt-1 flex flex-wrap gap-2 text-slate-300">
                  {('words' in item ? item.words : []).map((word) => (
                    <li
                      key={`${'hwd' in word ? word.hwd : word.headWord}-${'tran' in word ? word.tran : word.tranCn}`}
                      className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1"
                    >
                      <span className="mr-2 text-white">
                        {'hwd' in word ? word.hwd : word.headWord}
                      </span>
                      {('tran' in word ? word.tran : word.tranCn) ? (
                        <span className="text-xs text-slate-400">
                          {'tran' in word ? word.tran : word.tranCn}
                        </span>
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
