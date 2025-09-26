'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { WordDetailView } from '../../../../../components/word-detail';
import { mockBooks, mockWords } from '../../../../../data/mock';

export default function WordDetailPage() {
  const params = useParams<{ bookId: string; wordRank: string }>();
  const router = useRouter();

  const book = useMemo(
    () => mockBooks.find((item) => item.bookId === params.bookId),
    [params.bookId]
  );

  const wordRank = Number(params.wordRank);
  const words = mockWords[params.bookId] ?? [];
  const detail = words.find((word) => word.wordRank === wordRank);

  if (!book) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-sm text-slate-300">
        暂未找到该单词书。
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
    <div className="flex flex-1 flex-col gap-8">
      <header>
        <p className="text-sm uppercase tracking-[0.4em] text-emerald-200/70">
          {book.title}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">单词详情</h1>
      </header>
      <WordDetailView detail={detail} onBack={() => router.back()} />
    </div>
  );
}
