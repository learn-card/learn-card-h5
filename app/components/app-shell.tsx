'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { AuthModal } from './auth-modal';
import { BottomNav } from './bottom-nav';

type HeaderState = {
  title: string;
  canGoBack: boolean;
  visible: boolean;
  showBottomNav: boolean;
};

type HeaderContextValue = {
  header: HeaderState;
  setHeader: (config: Partial<HeaderState>) => void;
  resetHeader: () => void;
};

const HeaderContext = createContext<HeaderContextValue | null>(null);

function resolveDefaultHeader(pathname: string | null): HeaderState {
  const path = pathname ?? '/';
  if (path === '/' || path === '/(app)' || path === '/(app)/') {
    return { title: '学习卡片', canGoBack: false, visible: true, showBottomNav: true };
  }
  if (path.startsWith('/learn/') && path.includes('/word/')) {
    return { title: '单词详情', canGoBack: true, visible: true, showBottomNav: true };
  }
  if (path.startsWith('/learn/')) {
    return { title: '单词学习', canGoBack: true, visible: true, showBottomNav: true };
  }
  if (path.startsWith('/my')) {
    return { title: '我的学习', canGoBack: true, visible: true, showBottomNav: true };
  }
  return { title: '学习卡片', canGoBack: true, visible: true, showBottomNav: true };
}

export function useAppHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useAppHeader must be used within AppShell');
  }
  return context;
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [header, setHeaderState] = useState<HeaderState>(() =>
    resolveDefaultHeader(pathname)
  );

  useEffect(() => {
    setHeaderState(resolveDefaultHeader(pathname));
  }, [pathname]);

  const setHeader = useCallback((config: Partial<HeaderState>) => {
    setHeaderState((prev) => ({ ...prev, ...config }));
  }, []);

  const resetHeader = useCallback(() => {
    setHeaderState(resolveDefaultHeader(pathname));
  }, [pathname]);

  const value = useMemo(
    () => ({
      header,
      setHeader,
      resetHeader,
    }),
    [header, resetHeader, setHeader]
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <HeaderContext.Provider value={value}>
      <div className="flex min-h-screen flex-col bg-slate-950 text-white">
        {header.visible ? (
          <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
              {header.canGoBack ? (
                <button
                  onClick={handleBack}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-900/60 text-slate-200 transition hover:border-emerald-300/40 hover:text-emerald-200"
                  aria-label="返回"
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
                </button>
              ) : (
                <span className="h-9 w-9" />
              )}
              <h1 className="text-base font-semibold text-white sm:text-lg">
                {header.title}
              </h1>
              <span className="h-9 w-9" />
            </div>
          </header>
        ) : null}
        <main
          className={`mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 ${
            header.visible ? 'pt-8' : 'pt-10'
          } ${header.showBottomNav ? 'pb-24' : 'pb-12'}`}
        >
          {children}
        </main>
        {header.showBottomNav ? <BottomNav /> : null}
        <AuthModal />
      </div>
    </HeaderContext.Provider>
  );
}
