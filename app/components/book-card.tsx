'use client';

import Image from 'next/image';
import { useMemo } from 'react';

export type BookProgressInfo = {
  learnedWords?: number;
  lastIndex?: number;
  wordsCount?: number;
  updatedAt?: string;
};

type BookCardProps = {
  title: string;
  coverUrl: string;
  description: string;
  wordsCount: number;
  tags?: string[];
  progress?: BookProgressInfo;
  actionLabel?: string;
  secondaryLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function BookCard({
  title,
  coverUrl,
  description,
  wordsCount,
  tags,
  progress,
  actionLabel = '开始学习',
  secondaryLabel,
  onAction,
  className,
}: BookCardProps) {
  const learnedCount = useMemo(() => {
    if (!progress) return 0;
    if (typeof progress.learnedWords === 'number') return progress.learnedWords;
    if (typeof progress.lastIndex === 'number') return progress.lastIndex + 1;
    return 0;
  }, [progress]);

  const ratio = useMemo(() => {
    if (!progress) return 0;
    const base = progress.wordsCount ?? wordsCount;
    if (base <= 0) return 0;
    const index = typeof progress.lastIndex === 'number' ? progress.lastIndex + 1 : learnedCount;
    return Math.min(100, Math.round((index / base) * 100));
  }, [learnedCount, progress, wordsCount]);

  return (
    <div
      className={`group flex w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-900/10 shadow-lg shadow-emerald-500/5 ring-1 ring-white/5 transition hover:border-emerald-400/30 hover:shadow-emerald-500/20 ${
        className ?? ''
      }`}
    >
      <div className="relative h-40 w-full overflow-hidden bg-slate-800">
        <Image
          src={coverUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20" />
        {progress?.updatedAt ? (
          <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-black/50 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-emerald-200">
            最近{' '}
            {new Intl.DateTimeFormat('zh-CN', {
              month: 'numeric',
              day: 'numeric',
            }).format(new Date(progress.updatedAt))}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="line-clamp-1 text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-emerald-300/70">
            {wordsCount} 个单词
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-slate-300/80">{description}</p>
        </div>
        {tags && tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-xs text-emerald-200/70">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        {progress ? (
          <div className="flex items-center justify-between rounded-2xl bg-slate-900/60 p-3">
            <div>
              <p className="text-xs text-slate-400">学习进度</p>
              <p className="text-sm font-semibold text-white">
                {learnedCount} / {progress.wordsCount ?? wordsCount}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-emerald-200">{ratio}%</span>
              <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-teal-400"
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>
          </div>
        ) : null}
        <div className="mt-auto flex items-center justify-between">
          <button
            onClick={onAction}
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:brightness-105"
          >
            {actionLabel}
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
          {secondaryLabel ? (
            <span className="text-xs text-slate-400">{secondaryLabel}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
