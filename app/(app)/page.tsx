'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { BookCard } from '../components/book-card';
import { useAppHeader } from '../components/app-shell';
import { useAppState } from '../providers';

export default function HomePage() {
  const router = useRouter();
  const { setHeader, resetHeader } = useAppHeader();
  const {
    books,
    isLoadingBooks,
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

  const handleBookSelect = (bookId: string) => {
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
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-[0.4em] text-emerald-200/80">
          学习卡片
        </p>
        <h1 className="text-2xl font-semibold text-white md:text-3xl">
          随时开启你的英语单词旅程
        </h1>
        <p className="max-w-xl text-sm text-slate-400">
          精选多本单词书，卡片式学习体验搭配轻量进度管理，让记忆更专注、更高效。
        </p>
      </header>

      {recentBooks.length > 0 ? (
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
            const progress = isLoggedIn
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
              actionLabel={isLoggedIn ? '开始学习' : '登录后学习'}
              secondaryLabel={isLoggedIn ? undefined : '点击后将提示登录'}
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
