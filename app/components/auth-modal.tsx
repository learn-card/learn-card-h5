'use client';

import { FormEvent, useEffect, useState } from 'react';

import { useAppState } from '../providers';

export function AuthModal() {
  const { authModal, closeAuthModal, login, register, setAuthMode } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (authModal.open) {
      setEmail('');
      setPassword('');
    }
  }, [authModal.open]);

  if (!authModal.open) return null;

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await login({ email, password });
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await register({ email, password });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-emerald-500/20">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {authModal.mode === 'register' ? '注册账号' : '登录账号'}
          </h2>
          <button
            onClick={closeAuthModal}
            className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:border-emerald-300/40 hover:text-emerald-200"
            aria-label="关闭"
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
              <path d="m6 6 12 12" />
              <path d="m18 6-12 12" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-400">
          {authModal.mode === 'register'
            ? '填写邮箱与密码，立即注册并开始学习。'
            : '使用邮箱与密码登录，继续你的学习进度。'}
        </p>

        {authModal.mode === 'register' ? (
          <form className="mt-6 space-y-4" onSubmit={handleRegister}>
            <label className="block text-sm font-medium text-slate-200">
              邮箱
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
                placeholder="you@example.com"
                disabled={authModal.isSubmitting}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-200">
              密码
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
                placeholder="至少 6 位密码"
                disabled={authModal.isSubmitting}
                required
              />
            </label>
            {authModal.message ? (
              <p className="text-xs text-rose-300">{authModal.message}</p>
            ) : null}
            <button
              type="submit"
              disabled={authModal.isSubmitting}
              className="w-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {authModal.isSubmitting ? '处理中…' : '注册并登录'}
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <label className="block text-sm font-medium text-slate-200">
              邮箱
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
                placeholder="you@example.com"
                disabled={authModal.isSubmitting}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-200">
              密码
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
                placeholder="请输入密码"
                disabled={authModal.isSubmitting}
                required
              />
            </label>
            {authModal.message ? (
              <p className="text-xs text-rose-300">{authModal.message}</p>
            ) : null}
            <button
              type="submit"
              disabled={authModal.isSubmitting}
              className="w-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {authModal.isSubmitting ? '处理中…' : '立即登录'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-xs text-slate-400">
          <button
            className="font-medium text-emerald-200"
            onClick={() => setAuthMode(authModal.mode === 'register' ? 'login' : 'register')}
          >
            {authModal.mode === 'register'
              ? '已有账号？点此登录'
              : '还没有账号？点此注册'}
          </button>
        </div>
      </div>
    </div>
  );
}
