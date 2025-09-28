'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { BookCard } from '../components/book-card';
import { useAppHeader } from '../components/app-shell';
import { LoadingSpinner, Skeleton } from '../components/loading-placeholder';
import { useAppState } from '../providers';

export default function HomePageClient() {
  const router = useRouter();
  const { setHeader, resetHeader } = useAppHeader();
  const {
    books,
    isLoadingBooks,
    isLoadingUser,
    isLoggedIn,
    user,
    userProgress,
    openAuthModal,
  } = useAppState();

  useEffect(() => {
    setHeader({ title: '学习卡片', canGoBack: false, visible: true });
    return () => resetHeader();
  }, [resetHeader, setHeader]);

  const recentBooks = useMemo(() => {
    if (!isLoggedIn || !user) return [];
    return [...user.progress]
      .sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 3)
      .map((progress) => ({
        progress,
        book: books.find((book) => book.bookId === progress.bookId),
      }))
      .filter((item) => Boolean(item.book));
  }, [books, isLoggedIn, user]);

  const isAuthReady = !isLoadingUser;
  const canStudy = isAuthReady && isLoggedIn;

  const handleBookSelect = (bookId: string) => {
    if (!isAuthReady) {
      return;
    }
    if (isLoggedIn) {
      router.push(`/learn/${bookId}`);
      return;
    }
    openAuthModal({
      mode: 'login',
      targetBookId: bookId,
      redirectTo: `/learn/${bookId}`,
    });
    router.push(`/my?auth=1&book=${bookId}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-10">
      {isLoadingUser ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-28" />
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <LoadingSpinner size="sm" />
              <span>同步中…</span>
            </div>
          </div>
          <div className="grid gap-5 justify-items-center sm:grid-cols-2">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-48 w-full max-w-sm rounded-3xl" />
            ))}
          </div>
        </section>
      ) : recentBooks.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">最近学习</h2>
            <span className="text-xs text-slate-400">同步自上次登录</span>
          </div>
          <div className="grid gap-5 justify-items-center sm:grid-cols-2">
            {recentBooks.map((item) => (
              <BookCard
                key={item.progress.bookId}
                title={item.book!.title}
                description={item.book!.description ?? ''}
                coverUrl={item.book!.coverUrl ?? ''}
                wordsCount={item.book!.wordsCount}
                tags={item.book!.tags ?? []}
                progress={{
                  ...item.progress,
                  wordsCount: item.book!.wordsCount,
                }}
                actionLabel="继续"
                secondaryLabel="继续学习"
                onAction={() => handleBookSelect(item.book!.bookId)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">所有单词书</h2>
          <span className="text-xs text-slate-400">
            {isLoadingBooks ? '加载中…' : `${books.length} 本精选词书`}
          </span>
        </div>
        <div className="grid gap-5 justify-items-center sm:grid-cols-2">
          {books.map((book) => {
            const progress = canStudy
              ? userProgress[book.bookId]
              : undefined;
            return (
              <BookCard
                key={book.bookId}
                title={book.title}
                description={book.description ?? ''}
                coverUrl={book.coverUrl ?? ''}
                wordsCount={book.wordsCount}
                tags={book.tags ?? []}
                progress={progress ? { ...progress, wordsCount: book.wordsCount } : undefined}
                actionLabel={canStudy ? '开始学习' : isAuthReady ? '登录后学习' : '加载中…'}
                secondaryLabel={canStudy ? undefined : isAuthReady ? '点击后将提示登录' : '请稍候'}
                onAction={() => handleBookSelect(book.bookId)}
              />
            );
          })}
          {!isLoadingBooks && books.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-white/5 bg-slate-900/50 p-6 text-sm text-slate-300">
              暂无单词书数据，请稍后再试。
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
