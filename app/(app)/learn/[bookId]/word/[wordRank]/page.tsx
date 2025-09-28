'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

import { WordDetailView } from '../../../../../components/word-detail';
import { useAppHeader } from '../../../../../components/app-shell';
import { useAppState } from '../../../../../providers';
import type { WordDetail } from '../../../../../types';

export default function WordDetailPage() {
  const params = useParams<{ bookId: string; wordRank: string }>();
  const { setHeader, resetHeader } = useAppHeader();

  const { books, getWordsForBook } = useAppState();

  const book = useMemo(
    () => books.find((item) => item.bookId === params.bookId),
    [books, params.bookId]
  );

  const wordRank = Number(params.wordRank);
  const [detail, setDetail] = useState<WordDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getWordsForBook(params.bookId).then((words) => {
      const match = words.find((word) => word.wordRank === wordRank) ?? null;
      setDetail(match);
      setIsLoading(false);
    });
  }, [getWordsForBook, params.bookId, wordRank]);

  useEffect(() => {
    const fallbackTitle = book ? `${book.title} · 单词详情` : '单词详情';
    const title = detail?.wordHead ? `${detail.wordHead} · 单词详情` : fallbackTitle;
    setHeader({ title, canGoBack: true, visible: true, showBottomNav: false });
    return () => resetHeader();
  }, [book, detail, resetHeader, setHeader]);

  if (!book) {
    if (isLoading) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center text-sm text-slate-300">
          正在加载数据…
        </div>
      );
    }
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-sm text-slate-300">
        暂未找到该单词书。
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-sm text-slate-300">
        正在加载单词详情…
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-sm text-slate-300">
        找不到对应的单词详情。
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      <WordDetailView detail={detail} />
    </div>
  );
}
