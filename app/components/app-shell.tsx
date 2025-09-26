'use client';

import { ReactNode } from 'react';

import { AuthModal } from './auth-modal';
import { BottomNav } from './bottom-nav';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 pb-24 pt-10">
        {children}
      </main>
      <BottomNav />
      <AuthModal />
    </div>
  );
}
