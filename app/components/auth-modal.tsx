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

  const isRegisterPrimary = authModal.mode === 'register';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isRegisterPrimary) {
      await register({ email, password });
    } else {
      await login({ email, password });
    }
  };

  const handleSecondary = async () => {
    if (isRegisterPrimary) {
      await login({ email, password });
    } else {
      await register({ email, password });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-emerald-500/20">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">登录 / 注册</h2>
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
          使用邮箱与密码快速开始，成功后可同步学习进度。
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-200">
            邮箱
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
              placeholder="you@example.com"
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
              required
            />
          </label>
          {authModal.message ? (
            <p className="text-xs text-rose-300">{authModal.message}</p>
          ) : null}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:brightness-105"
            >
              {isRegisterPrimary ? '注册并登录' : '立即登录'}
            </button>
            <button
              type="button"
              onClick={handleSecondary}
              className="w-full rounded-full border border-white/15 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/40"
            >
              {isRegisterPrimary ? '使用已有账号登录' : '注册新账号'}
            </button>
          </div>
        </form>
        <div className="mt-4 text-center text-xs text-slate-400">
          <button
            className="font-medium text-emerald-200"
            onClick={() => setAuthMode(isRegisterPrimary ? 'login' : 'register')}
          >
            {isRegisterPrimary ? '切换至登录模式' : '切换至注册模式'}
          </button>
        </div>
      </div>
    </div>
  );
}
