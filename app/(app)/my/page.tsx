'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { BookCard } from '../../components/book-card';
import { mockBooks } from '../../data/mock';
import { useAppState } from '../../providers';

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, user, logout, openAuthModal } = useAppState();

  const authIntent = searchParams.get('auth');
  const targetBook = searchParams.get('book');

  useEffect(() => {
    if (!isLoggedIn && authIntent === '1') {
      openAuthModal({
        mode: 'login',
        targetBookId: targetBook ?? undefined,
        redirectTo: targetBook ? `/learn/${targetBook}` : undefined,
      });
    }
  }, [authIntent, isLoggedIn, openAuthModal, targetBook]);

  const detailedProgress = useMemo(() => {
    if (!isLoggedIn || !user) return [];
    return [...user.progress]
      .sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .map((progress) => ({
        progress,
        book: mockBooks.find((book) => book.bookId === progress.bookId),
      }))
      .filter((item) => Boolean(item.book));
  }, [isLoggedIn, user]);

  const handleContinue = (bookId: string) => {
    router.push(`/learn/${bookId}`);
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-200/70">
            欢迎来到我的
          </p>
          <h1 className="text-2xl font-semibold text-white">登录同步你的学习足迹</h1>
          <p className="max-w-sm text-sm text-slate-400">
            登录或注册后即可查看你的学习数据，继续最近的单词书，所有进度都会自动同步。
          </p>
        </div>
        <button
          onClick={() => openAuthModal({ mode: 'login' })}
          className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-10 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:brightness-105"
        >
          登录 / 注册
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-10">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.4em] text-emerald-200/80">
          我的学习
        </p>
        <h1 className="text-2xl font-semibold text-white">{user.displayName}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300/80">
          <span>邮箱：{user.email}</span>
          <span>已学习 {user.learnedBooks} 本书</span>
          <span>累计 {user.learnedWords} 个单词</span>
        </div>
        <button
          onClick={logout}
          className="mt-2 inline-flex w-max items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-5 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-300/40"
        >
          退出登录
        </button>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">学习进度</h2>
          <span className="text-xs text-slate-400">最近更新排在前面</span>
        </div>
        {detailedProgress.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 text-sm text-slate-300">
            还没有开始任何单词书，回到首页选择一本试试吧。
          </div>
        ) : (
          <div className="grid gap-5 justify-items-center sm:grid-cols-2">
            {detailedProgress.map((item) => (
              <BookCard
                key={item.progress.bookId}
                title={item.book!.title}
                description={item.book!.description}
                coverUrl={item.book!.coverUrl}
                wordsCount={item.book!.wordsCount}
                tags={item.book!.tags}
                progress={{
                  ...item.progress,
                  wordsCount: item.book!.wordsCount,
                }}
                actionLabel="继续"
                secondaryLabel={`已学 ${item.progress.learnedWords} 个单词`}
                onAction={() => handleContinue(item.book!.bookId)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
