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

import type { AuthMode } from './types';
import type { Book, UserProgress, UserSummary, WordDetail } from './types';

export type { AuthMode } from './types';

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
  books: Book[];
  isLoadingBooks: boolean;
  reloadBooks: () => Promise<void>;
  getWordsForBook: (bookId: string) => Promise<WordDetail[]>;
  user: UserSummary | null;
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

const DEFAULT_USER_ID = 1;

const AppStateContext = createContext<AppState | null>(null);

function createProgressMap(source: UserSummary | null): Record<string, UserProgress> {
  if (!source) return {};
  return source.progress.reduce<Record<string, UserProgress>>((acc, item) => {
    acc[item.bookId] = { ...item };
    return acc;
  }, {});
}

export function AppProviders({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState<boolean>(true);
  const [wordsCache, setWordsCache] = useState<Record<string, WordDetail[]>>({});
  const [user, setUser] = useState<UserSummary | null>(null);
  const [authModal, setAuthModal] = useState<AuthModalState>({
    open: false,
    mode: 'login',
  });
  const authModalRef = useRef(authModal);
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});

  const loadBooks = useCallback(async () => {
    setIsLoadingBooks(true);
    try {
      const response = await fetch('/api/books');
      const payload = await response.json();
      setBooks(payload.data ?? []);
    } catch (error) {
      console.error('Failed to load books', error);
    } finally {
      setIsLoadingBooks(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

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

  const hydrateUser = useCallback(
    (summary: UserSummary | null) => {
      setUser(summary);
      setProgressMap(createProgressMap(summary));
    },
    []
  );

  const fetchUserSummary = useCallback(async (): Promise<UserSummary | null> => {
    try {
      const response = await fetch(`/api/user/progress?userId=${DEFAULT_USER_ID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      const payload = await response.json();
      const progress: UserProgress[] = payload.data ?? [];
      if (progress.length === 0) {
        return {
          id: String(DEFAULT_USER_ID),
          email: 'learner@example.com',
          displayName: '学习者',
          avatarUrl: null,
          learnedBooks: 0,
          learnedWords: 0,
          progress: [],
        };
      }
      return {
        id: String(DEFAULT_USER_ID),
        email: 'learner@example.com',
        displayName: '学习者',
        avatarUrl: null,
        learnedBooks: progress.length,
        learnedWords: progress.reduce((sum, item) => sum + item.learnedWords, 0),
        progress,
      };
    } catch (error) {
      console.error('Failed to load user summary', error);
      return null;
    }
  }, []);

  const handleAuthSuccess = useCallback(
    async (email: string) => {
      const modalState = authModalRef.current;
      closeAuthModal();
      const summary = await fetchUserSummary();
      if (summary) {
        hydrateUser({
          ...summary,
          email,
          displayName: summary.displayName ?? email.split('@')[0],
        });
        const target =
          modalState.redirectTo ||
          (modalState.targetBookId ? `/learn/${modalState.targetBookId}` : null);
        if (target) {
          router.push(target);
        }
      } else {
        setAuthModal((prev) => ({
          ...prev,
          message: '登录成功，但无法读取用户数据。',
        }));
      }
    },
    [closeAuthModal, fetchUserSummary, hydrateUser, router]
  );

  const login = useCallback(
    async ({ email, password }: LoginPayload) => {
      if (!email || !password) {
        setAuthModal((prev) => ({
          ...prev,
          message: '请输入邮箱和密码。',
        }));
        return;
      }
      await handleAuthSuccess(email);
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
      await handleAuthSuccess(email);
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(() => {
    hydrateUser(null);
  }, [hydrateUser]);

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

  const getWordsForBook = useCallback(
    async (bookId: string) => {
      if (wordsCache[bookId]) {
        return wordsCache[bookId];
      }
      try {
        const response = await fetch(`/api/books/${bookId}/words`);
        const payload = await response.json();
        const wordsList: WordDetail[] = payload.data ?? [];
        setWordsCache((prev) => ({ ...prev, [bookId]: wordsList }));
        return wordsList;
      } catch (error) {
        console.error('Failed to load words', error);
        return [];
      }
    },
    [wordsCache]
  );

  const value = useMemo<AppState>(() => {
    return {
      books,
      isLoadingBooks,
      reloadBooks: loadBooks,
      getWordsForBook,
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
  }, [
    authModal,
    books,
    closeAuthModal,
    getWordsForBook,
    isLoadingBooks,
    loadBooks,
    login,
    logout,
    openAuthModal,
    progressMap,
    register,
    setAuthMode,
    updateProgress,
    user,
  ]);

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
