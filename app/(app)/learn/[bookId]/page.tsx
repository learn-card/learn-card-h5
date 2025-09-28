'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { WordCard } from '../../../components/word-card';
import { useAppHeader } from '../../../components/app-shell';
import { useAppState } from '../../../providers';
import type { WordDetail } from '../../../types';

export default function LearnPage() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
  const { setHeader, resetHeader } = useAppHeader();
  const {
    books,
    getWordsForBook,
    isLoggedIn,
    openAuthModal,
    userProgress,
    updateProgress,
  } = useAppState();

  const book = useMemo(
    () => books.find((item) => item.bookId === params.bookId),
    [books, params.bookId]
  );

  const [words, setWords] = useState<WordDetail[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(true);
  const totalWords = words.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    setInitialised(false);
    setIsLoadingWords(true);
    getWordsForBook(params.bookId).then((list) => {
      setWords(list);
      setIsLoadingWords(false);
    });
  }, [getWordsForBook, params.bookId]);

  useEffect(() => {
    const title = book ? book.title : '单词学习';
    setHeader({ title, canGoBack: true, visible: true, showBottomNav: false });
    return () => resetHeader();
  }, [book, resetHeader, setHeader]);

  useEffect(() => {
    setInitialised(false);
  }, [isLoggedIn]);

  useEffect(() => {
    if (initialised) return;
    if (totalWords === 0) return;
    const saved = isLoggedIn ? userProgress[params.bookId] : undefined;
    const savedIndex =
      typeof saved?.lastIndex === 'number'
        ? saved.lastIndex
        : saved
        ? Math.max((saved.learnedWords ?? 1) - 1, 0)
        : 0;
    const nextIndex = Math.min(savedIndex, Math.max(totalWords - 1, 0));
    setCurrentIndex(nextIndex);
    setInitialised(true);
  }, [initialised, isLoggedIn, params.bookId, totalWords, userProgress]);

  const persistProgress = useCallback(
    (index: number) => {
      if (!isLoggedIn || totalWords === 0) return;
      updateProgress(params.bookId, (prev) => ({
        bookId: params.bookId,
        lastIndex: index,
        learnedWords: Math.max(prev?.learnedWords ?? 0, index + 1),
        updatedAt: new Date().toISOString(),
        wordsCount: totalWords,
      }));
    },
    [isLoggedIn, params.bookId, totalWords, updateProgress]
  );

  useEffect(() => {
    if (!initialised) return;
    if (!isLoggedIn) return;
    persistProgress(currentIndex);
  }, [currentIndex, initialised, isLoggedIn, persistProgress]);

  if (!book) {
    if (isLoadingWords) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center text-sm text-slate-300">
          正在加载单词书数据…
        </div>
      );
    }
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-sm text-slate-300">
        暂未找到该单词书。
      </div>
    );
  }

  if (isLoadingWords) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-sm text-slate-300">
        正在加载单词…
      </div>
    );
  }

  if (totalWords === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-sm text-slate-300">
        该单词书暂时没有可学习的单词。
      </div>
    );
  }

  const detail = words[currentIndex];

  if (!isLoggedIn) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-200/70">
            学习需要登录
          </p>
          <h1 className="text-2xl font-semibold text-white">登录后可继续学习《{book.title}》</h1>
          <p className="max-w-sm text-sm text-slate-400">
            登录以同步学习进度，随时继续上次看到的单词。
          </p>
        </div>
        <button
          onClick={() => {
            openAuthModal({
              mode: 'login',
              targetBookId: params.bookId,
              redirectTo: `/learn/${params.bookId}`,
            });
            router.push(`/my?auth=1&book=${params.bookId}`);
          }}
          className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-10 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:brightness-105"
        >
          登录 / 注册
        </button>
      </div>
    );
  }

  const goPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => Math.min(totalWords - 1, prev + 1));
  };

  const viewDetail = () => {
    router.push(`/learn/${params.bookId}/word/${detail.wordRank}`);
  };

  return (
    <div className="relative flex flex-1 flex-col pb-32">
      <div className="flex flex-1 flex-col justify-center">
        <WordCard
          total={totalWords}
          currentIndex={currentIndex}
          detail={detail}
          onWordClick={viewDetail}
        />
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-slate-950/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-300/40 hover:text-emerald-200 disabled:cursor-not-allowed disabled:border-white/5 disabled:text-slate-500"
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
            onClick={goNext}
            disabled={currentIndex === totalWords - 1}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
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
    </div>
  );
}
