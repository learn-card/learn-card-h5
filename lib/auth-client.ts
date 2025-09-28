'use client';

type SignInResult = {
  ok: boolean
  status: number
  url: string | null
  error?: string
}

type CredentialsPayload = {
  email: string
  password: string
  callbackUrl: string
  redirect?: boolean
}

export async function signInWithCredentials({
  email,
  password,
  callbackUrl,
  redirect = false,
}: CredentialsPayload): Promise<SignInResult> {
  if (typeof window === 'undefined') {
    throw new Error('signInWithCredentials can only be used in the browser')
  }

  let csrfToken = ''
  try {
    const response = await fetch('/api/auth/csrf')
    if (response.ok) {
      const payload = await response.json()
      if (typeof payload?.csrfToken === 'string') {
        csrfToken = payload.csrfToken
      }
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token', error)
  }
  const body = new URLSearchParams({
    csrfToken: csrfToken ?? '',
    callbackUrl,
    email,
    password,
    redirect: String(redirect),
  })

  const response = await fetch('/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Auth-Return-Redirect': '1',
    },
    credentials: 'same-origin',
    body,
  })

  let data: any = null
  try {
    data = await response.json()
  } catch (error) {
    console.error('Failed to parse credentials response', error)
  }

  const urlFromResponse = typeof data?.url === 'string' ? data.url : null

  let errorCode: string | undefined
  if (urlFromResponse) {
    try {
      const absoluteUrl = new URL(urlFromResponse, window.location.origin)
      errorCode = absoluteUrl.searchParams.get('error') ?? undefined
    } catch (error) {
      console.error('Failed to parse credentials redirect URL', error)
      errorCode = data?.error
    }
  } else if (typeof data?.error === 'string') {
    errorCode = data.error
  }

  return {
    ok: response.ok && !errorCode,
    status: response.status,
    url: urlFromResponse,
    error: errorCode,
  }
}
