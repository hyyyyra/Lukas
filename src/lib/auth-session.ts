const AUTH_TOKEN_KEY = "auth_token"
const REFRESH_TOKEN_KEY = "auth_refresh_token"

export function saveAuthSession(token: string, refreshToken?: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function isAuthErrorMessage(message: string): boolean {
  return /token inválido|no autorizado/i.test(message)
}
