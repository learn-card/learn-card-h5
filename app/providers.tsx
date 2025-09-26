'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';

import type {
  MockUser,
  UserProgress,
} from './data/mock';
import { mockUser } from './data/mock';

export type AuthMode = 'login' | 'register';

type AuthModalState = {
  open: boolean;
  mode: AuthMode;
  targetBookId?: string;
  redirectTo?: string;
  message?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type AppState = {
  user: MockUser | null;
  isLoggedIn: boolean;
  userProgress: Record<string, UserProgress>;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  openAuthModal: (state?: Partial<AuthModalState>) => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: AuthMode) => void;
  authModal: AuthModalState;
  updateProgress: (bookId: string, builder: (prev?: UserProgress) => UserProgress) => void;
};

const AppStateContext = createContext<AppState | null>(null);

function cloneUser(source: MockUser): MockUser {
  return {
    ...source,
    progress: source.progress.map((item) => ({ ...item })),
  };
}

function createProgressMap(source: MockUser | null): Record<string, UserProgress> {
  if (!source) return {};
  return source.progress.reduce<Record<string, UserProgress>>((acc, item) => {
    acc[item.bookId] = { ...item };
    return acc;
  }, {});
}

export function AppProviders({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
  const [authModal, setAuthModal] = useState<AuthModalState>({
    open: false,
    mode: 'login',
  });
  const authModalRef = useRef(authModal);
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});

  useEffect(() => {
    authModalRef.current = authModal;
  }, [authModal]);

  const closeAuthModal = useCallback(() => {
    setAuthModal({
      open: false,
      mode: 'login',
      targetBookId: undefined,
      redirectTo: undefined,
      message: undefined,
    });
  }, []);

  const handleAuthSuccess = useCallback(() => {
    const modalState = authModalRef.current;
    closeAuthModal();
    const hydratedUser = cloneUser(mockUser);
    setUser(hydratedUser);
    setProgressMap(createProgressMap(hydratedUser));
    const target =
      modalState.redirectTo ||
      (modalState.targetBookId ? `/learn/${modalState.targetBookId}` : null);
    if (target) {
      router.push(target);
    }
  }, [closeAuthModal, router]);

  const login = useCallback(
    async ({ email, password }: LoginPayload) => {
      if (!email || !password) {
        setAuthModal((prev) => ({
          ...prev,
          message: '请输入邮箱和密码。',
        }));
        return;
      }
      handleAuthSuccess();
    },
    [handleAuthSuccess]
  );

  const register = useCallback(
    async ({ email, password }: LoginPayload) => {
      if (!email || !password) {
        setAuthModal((prev) => ({
          ...prev,
          message: '请填写邮箱和密码完成注册。',
        }));
        return;
      }
      handleAuthSuccess();
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(() => {
    setUser(null);
    setProgressMap({});
  }, []);

  const openAuthModal = useCallback((state?: Partial<AuthModalState>) => {
    setAuthModal((prev) => ({
      open: true,
      mode: state?.mode ?? prev.mode ?? 'login',
      targetBookId: state?.targetBookId,
      redirectTo: state?.redirectTo,
      message: state?.message,
    }));
  }, []);

  const setAuthMode = useCallback((mode: AuthMode) => {
    setAuthModal((prev) => ({
      ...prev,
      mode,
    }));
  }, []);

  const updateProgress = useCallback(
    (bookId: string, builder: (prev?: UserProgress) => UserProgress) => {
      let nextEntry: UserProgress | undefined;
      setProgressMap((prev) => {
        nextEntry = builder(prev[bookId]);
        return { ...prev, [bookId]: nextEntry! };
      });
      setUser((prev) => {
        if (!prev || !nextEntry) return prev;
        const existing = prev.progress.find((item) => item.bookId === bookId);
        const nextProgress = existing
          ? prev.progress.map((item) => (item.bookId === bookId ? { ...nextEntry! } : item))
          : [...prev.progress, { ...nextEntry! }];
        return {
          ...prev,
          progress: nextProgress,
          learnedBooks: nextProgress.length,
          learnedWords: nextProgress.reduce(
            (sum, item) => sum + item.learnedWords,
            0
          ),
        };
      });
    },
    []
  );

  const value = useMemo<AppState>(() => {
    return {
      user,
      isLoggedIn: Boolean(user),
      userProgress: progressMap,
      login,
      register,
      logout,
      openAuthModal,
      closeAuthModal,
      setAuthMode,
      authModal,
      updateProgress,
    };
  }, [authModal, closeAuthModal, login, logout, openAuthModal, progressMap, register, setAuthMode, updateProgress, user]);

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProviders');
  }
  return context;
}
