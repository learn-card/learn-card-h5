'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { WordCard } from '../../../components/word-card';
import { useAppState } from '../../../providers';
import type { WordDetail } from '../../../types';

export default function LearnPage() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
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
    setInitialised(false);
  }, [isLoggedIn]);

  useEffect(() => {
    if (initialised) return;
    if (totalWords === 0) return;
    const saved = isLoggedIn ? userProgress[params.bookId] : undefined;
    const nextIndex = saved
      ? Math.min(saved.lastIndex + 1, Math.max(totalWords - 1, 0))
      : 0;
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
    <div className="flex flex-1 flex-col gap-10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.4em] text-emerald-200/70">
          单词学习
        </p>
        <h1 className="text-2xl font-semibold text-white">{book.title}</h1>
        <p className="text-sm text-slate-400">
          共 {totalWords} 个单词，当前进度 {currentIndex + 1} / {totalWords}
        </p>
      </header>
      <WordCard
        bookTitle={book.title}
        total={totalWords}
        currentIndex={currentIndex}
        detail={detail}
        onPrev={goPrev}
        onNext={goNext}
        onViewDetail={viewDetail}
        disablePrev={currentIndex === 0}
        disableNext={currentIndex === totalWords - 1}
      />
    </div>
  );
}
