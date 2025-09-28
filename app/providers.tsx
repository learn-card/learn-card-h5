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
} from 'react'
import { useRouter } from 'next/navigation'
import { getSession, signOut as nextAuthSignOut } from 'next-auth/react'

import { signInWithCredentials } from '@/lib/auth-client'

import type {
  AuthMode,
  Book,
  UserProgress,
  UserSummary,
  WordDetail,
} from './types'

export type { AuthMode } from './types'

type AuthModalState = {
  open: boolean
  mode: AuthMode
  targetBookId?: string
  redirectTo?: string
  message?: string
  isSubmitting: boolean
}

type LoginPayload = {
  email: string
  password: string
}

type AppState = {
  books: Book[]
  isLoadingBooks: boolean
  reloadBooks: () => Promise<void>
  getWordsForBook: (bookId: string) => Promise<WordDetail[]>
  user: UserSummary | null
  isLoggedIn: boolean
  userProgress: Record<string, UserProgress>
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: LoginPayload) => Promise<void>
  logout: () => void
  openAuthModal: (state?: Partial<AuthModalState>) => void
  closeAuthModal: () => void
  setAuthMode: (mode: AuthMode) => void
  authModal: AuthModalState
  updateProgress: (
    bookId: string,
    builder: (prev?: UserProgress) => UserProgress
  ) => void
}

const AppStateContext = createContext<AppState | null>(null)

function createProgressMap(
  source: UserSummary | null
): Record<string, UserProgress> {
  if (!source) return {}
  return source.progress.reduce<Record<string, UserProgress>>((acc, item) => {
    acc[item.bookId] = { ...item }
    return acc
  }, {})
}

const PROGRESS_STORAGE_PREFIX = 'learn-card-progress:'

function getProgressStorageKey(userId: string) {
  return `${PROGRESS_STORAGE_PREFIX}${userId}`
}

function readPersistedProgress(
  userId: string
): Record<string, UserProgress> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(getProgressStorageKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, UserProgress>
    if (!parsed || typeof parsed !== 'object') return null
    return Object.entries(parsed).reduce<Record<string, UserProgress>>(
      (acc, [bookId, value]) => {
        if (value) {
          acc[bookId] = value
        }
        return acc
      },
      {}
    )
  } catch (error) {
    console.warn('Failed to read stored progress', error)
    return null
  }
}

function persistProgressMap(
  userId: string,
  map: Record<string, UserProgress>
) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      getProgressStorageKey(userId),
      JSON.stringify(map)
    )
  } catch (error) {
    console.warn('Failed to persist progress', error)
  }
}

function clearPersistedProgress(userId: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(getProgressStorageKey(userId))
  } catch (error) {
    console.warn('Failed to clear stored progress', error)
  }
}

function mergeProgressRecords(
  primary: Record<string, UserProgress>,
  fallback: Record<string, UserProgress>
) {
  const merged: Record<string, UserProgress> = { ...primary }
  Object.entries(fallback).forEach(([bookId, localEntry]) => {
    if (!localEntry) return
    const existing = merged[bookId]
    if (!existing) {
      merged[bookId] = { ...localEntry }
      return
    }

    const existingTime = Date.parse(existing.updatedAt ?? '')
    const localTime = Date.parse(localEntry.updatedAt ?? '')
    const safeExistingTime = Number.isFinite(existingTime) ? existingTime : 0
    const safeLocalTime = Number.isFinite(localTime) ? localTime : 0
    const existingWords =
      existing.learnedWords ?? Math.max((existing.lastIndex ?? -1) + 1, 0)
    const localWords =
      localEntry.learnedWords ?? Math.max((localEntry.lastIndex ?? -1) + 1, 0)

    const shouldReplace =
      safeLocalTime > safeExistingTime ||
      (safeLocalTime === safeExistingTime && localWords > existingWords)

    if (shouldReplace) {
      merged[bookId] = { ...existing, ...localEntry }
    }
  })
  return merged
}

function sortProgressEntries(map: Record<string, UserProgress>): UserProgress[] {
  return Object.values(map).sort((a, b) => {
    const timeA = Date.parse(a.updatedAt ?? '')
    const timeB = Date.parse(b.updatedAt ?? '')
    const safeTimeA = Number.isFinite(timeA) ? timeA : 0
    const safeTimeB = Number.isFinite(timeB) ? timeB : 0
    if (safeTimeA !== safeTimeB) {
      return safeTimeB - safeTimeA
    }
    return (b.learnedWords ?? 0) - (a.learnedWords ?? 0)
  })
}

export function AppProviders({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [isLoadingBooks, setIsLoadingBooks] = useState<boolean>(true)
  const [wordsCache, setWordsCache] = useState<Record<string, WordDetail[]>>({})
  const [user, setUser] = useState<UserSummary | null>(null)
  const [authModal, setAuthModal] = useState<AuthModalState>({
    open: false,
    mode: 'login',
    isSubmitting: false,
  })
  const authModalRef = useRef(authModal)
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>(
    {}
  )
  const currentUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    authModalRef.current = authModal
  }, [authModal])

  const loadBooks = useCallback(async () => {
    setIsLoadingBooks(true)
    try {
      const response = await fetch('/api/books')
      const payload = await response.json()
      setBooks(payload.data ?? [])
    } catch (error) {
      console.error('Failed to load books', error)
    } finally {
      setIsLoadingBooks(false)
    }
  }, [])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const closeAuthModal = useCallback(() => {
    setAuthModal({
      open: false,
      mode: 'login',
      targetBookId: undefined,
      redirectTo: undefined,
      message: undefined,
      isSubmitting: false,
    })
  }, [])

  const hydrateUser = useCallback((summary: UserSummary | null) => {
    if (!summary) {
      currentUserIdRef.current = null
      setUser(null)
      setProgressMap({})
      return
    }

    let nextMap = createProgressMap(summary)

    if (typeof window !== 'undefined') {
      const storedForId = readPersistedProgress(summary.id)
      const storedForEmail =
        summary.email && summary.email !== summary.id
          ? readPersistedProgress(summary.email)
          : null
      const storedMap = storedForId ?? storedForEmail ?? {}
      nextMap = mergeProgressRecords(nextMap, storedMap)
      persistProgressMap(summary.id, nextMap)
      if (!storedForId && storedForEmail && summary.email !== summary.id) {
        clearPersistedProgress(summary.email)
      }
    }

    const progressList = sortProgressEntries(nextMap)
    const learnedBooks = progressList.length
    const learnedWords = progressList.reduce(
      (sum, item) => sum + (item.learnedWords ?? 0),
      0
    )

    const nextSummary: UserSummary = {
      ...summary,
      progress: progressList,
      learnedBooks,
      learnedWords,
    }

    currentUserIdRef.current = nextSummary.id
    setUser(nextSummary)
    setProgressMap(nextMap)
  }, [])

  useEffect(() => {
    currentUserIdRef.current = user?.id ?? null
  }, [user])

  const persistProgressForUser = useCallback(
    (map: Record<string, UserProgress>) => {
      const userId = currentUserIdRef.current
      if (!userId) return
      persistProgressMap(userId, map)
    },
    []
  )

  const fetchUserSummary = useCallback(
    async (email: string): Promise<UserSummary> => {
      try {
        const response = await fetch(
          `/api/user/summary?email=${encodeURIComponent(email)}`
        )
        const payload = await response.json()
        if (!response.ok) {
          throw new Error(payload.error ?? 'Failed to fetch user')
        }
        const progress: UserProgress[] = payload.data?.progress ?? []
        const userMeta = payload.data?.user
        if (!userMeta) {
          throw new Error('Missing user information')
        }
        return {
          id: String(userMeta.id),
          email: userMeta.email,
          displayName: userMeta.email.split('@')[0],
          avatarUrl: null,
          learnedBooks: progress.length,
          learnedWords: progress.reduce(
            (sum, item) => sum + (item.learnedWords ?? 0),
            0
          ),
          progress,
        }
      } catch (error) {
        console.error('Failed to load user summary', error)
        return {
          id: email,
          email,
          displayName: email.split('@')[0],
          avatarUrl: null,
          learnedBooks: 0,
          learnedWords: 0,
          progress: [],
        }
      }
    },
    []
  )

  useEffect(() => {
    let isMounted = true
    getSession()
      .then((session) => {
        if (!isMounted) return
        const email = session?.user?.email
        if (!email) return
        fetchUserSummary(email).then((summary) => {
          if (!isMounted) return
          hydrateUser(summary)
        })
      })
      .catch((error) => {
        console.error('Failed to restore session', error)
      })
    return () => {
      isMounted = false
    }
  }, [fetchUserSummary, hydrateUser])

  const handleAuthSuccess = useCallback(
    async (email: string) => {
      const modalState = authModalRef.current
      closeAuthModal()
      const summary = await fetchUserSummary(email)
      hydrateUser(summary)
      const target =
        modalState.redirectTo ||
        (modalState.targetBookId ? `/learn/${modalState.targetBookId}` : null)
      if (target) {
        router.push(target)
      }
    },
    [closeAuthModal, fetchUserSummary, hydrateUser, router]
  )

  const authenticate = useCallback(
    async (email: string, password: string) => {
      setAuthModal((prev) => ({ ...prev, message: undefined, isSubmitting: true }))
      try {
        const result = await signInWithCredentials({
          email,
          password,
          callbackUrl:
            typeof window === 'undefined'
              ? '/'
              : window.location.href.split('#')[0],
          redirect: false,
        })

        if (result.error) {
          setAuthModal((prev) => ({
            ...prev,
            message:
              result.error === 'CredentialsSignin'
                ? '邮箱或密码错误。'
                : '登录失败，请稍后再试。',
            isSubmitting: false,
          }))
          return false
        }

        await handleAuthSuccess(email)
        return true
      } catch (error) {
        console.error('Failed to authenticate', error)
        setAuthModal((prev) => ({
          ...prev,
          message: '登录失败，请稍后再试。',
          isSubmitting: false,
        }))
        return false
      }
    },
    [handleAuthSuccess]
  )

  const login = useCallback(
    async ({ email, password }: LoginPayload) => {
      if (!email || !password) {
        setAuthModal((prev) => ({
          ...prev,
          message: '请输入邮箱和密码。',
          isSubmitting: false,
        }))
        return
      }
      await authenticate(email, password)
    },
    [authenticate]
  )

  const register = useCallback(
    async ({ email, password }: LoginPayload) => {
      if (!email || !password) {
        setAuthModal((prev) => ({
          ...prev,
          message: '请填写邮箱和密码完成注册。',
          isSubmitting: false,
        }))
        return
      }
      setAuthModal((prev) => ({ ...prev, isSubmitting: true, message: undefined }))
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })
        const payload = await response.json()
        if (!response.ok) {
          setAuthModal((prev) => ({
            ...prev,
            message: payload.error ?? '注册失败，请稍后再试。',
            isSubmitting: false,
          }))
          return
        }
      } catch (error) {
        console.error('Failed to register', error)
        setAuthModal((prev) => ({
          ...prev,
          message: '注册失败，请稍后再试。',
          isSubmitting: false,
        }))
        return
      }

      await authenticate(email, password)
    },
    [authenticate]
  )

  const logout = useCallback(() => {
    nextAuthSignOut({ redirect: false }).catch((error) => {
      console.error('Failed to sign out', error)
    })
    hydrateUser(null)
  }, [hydrateUser])

  const openAuthModal = useCallback((state?: Partial<AuthModalState>) => {
    setAuthModal((prev) => ({
      open: true,
      mode: state?.mode ?? prev.mode ?? 'login',
      targetBookId: state?.targetBookId,
      redirectTo: state?.redirectTo,
      message: state?.message ?? undefined,
      isSubmitting: false,
    }))
  }, [])

  const setAuthMode = useCallback((mode: AuthMode) => {
    setAuthModal((prev) => ({
      ...prev,
      mode,
      message: undefined,
      isSubmitting: false,
    }))
  }, [])

  const updateProgress = useCallback(
    (bookId: string, builder: (prev?: UserProgress) => UserProgress) => {
      let nextEntry: UserProgress | undefined
      setProgressMap((prev) => {
        nextEntry = builder(prev[bookId])
        const nextMap = { ...prev, [bookId]: nextEntry! }
        persistProgressForUser(nextMap)
        return nextMap
      })
      setUser((prev) => {
        if (!prev || !nextEntry) return prev
        const existing = prev.progress.find((item) => item.bookId === bookId)
        const nextProgress = existing
          ? prev.progress.map((item) =>
              item.bookId === bookId ? { ...nextEntry! } : item
            )
          : [...prev.progress, { ...nextEntry! }]
        return {
          ...prev,
          progress: nextProgress,
          learnedBooks: nextProgress.length,
          learnedWords: nextProgress.reduce(
            (sum, item) => sum + (item.learnedWords ?? 0),
            0
          ),
        }
      })
    },
    [persistProgressForUser]
  )

  const getWordsForBook = useCallback(
    async (bookId: string) => {
      if (wordsCache[bookId]) {
        return wordsCache[bookId]
      }
      try {
        const response = await fetch(`/api/books/${bookId}/words`)
        const payload = await response.json()
        const wordsList: WordDetail[] = payload.data ?? []
        setWordsCache((prev) => ({ ...prev, [bookId]: wordsList }))
        return wordsList
      } catch (error) {
        console.error('Failed to load words', error)
        return []
      }
    },
    [wordsCache]
  )

  const value = useMemo<AppState>(
    () => ({
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
    }),
    [
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
    ]
  )

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within AppProviders')
  }
  return context
}
