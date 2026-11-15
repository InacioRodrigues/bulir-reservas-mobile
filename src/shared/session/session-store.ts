import { create } from 'zustand'
import type { AuthResponse, AuthTokens, User } from '@/shared/contract/types'
import { secureStorage } from './secure-storage'

/**
 * Estado de sessão (estado de CLIENTE): tokens + último perfil conhecido, em memória (Zustand)
 * e espelhados no armazenamento seguro para sobreviver ao fecho da app.
 *
 * - `status` começa em 'restoring': o layout raiz mantém o splash até `restoreSession()` acabar,
 *   para nunca mostrar o login a quem já tem sessão (nem o contrário).
 * - O perfil é só um snapshot para decidir rotas/papel sem esperar pela rede;
 *   o saldo "vivo" vem sempre do servidor via TanStack Query (`useMe`).
 * - Cada valor fica numa chave própria: o SecureStore recomenda valores pequenos (< 2 KB).
 */
export type SessionStatus = 'restoring' | 'authenticated' | 'anonymous'

interface SessionState {
  status: SessionStatus
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  setSession: (session: AuthResponse) => void
  setTokens: (tokens: AuthTokens) => void
  setUser: (user: User) => void
  clear: () => void
}

export const STORAGE_KEYS = {
  accessToken: 'bulir.accessToken',
  refreshToken: 'bulir.refreshToken',
  user: 'bulir.user',
} as const

/* Escritas serializadas: um setTokens seguido de clear nunca chega fora de ordem ao disco. */
let writeQueue: Promise<unknown> = Promise.resolve()
function persist(entries: Partial<Record<keyof typeof STORAGE_KEYS, string | null>>) {
  writeQueue = writeQueue
    .then(() =>
      Promise.all(
        Object.entries(entries).map(([name, value]) => {
          const key = STORAGE_KEYS[name as keyof typeof STORAGE_KEYS]
          return value === null || value === undefined
            ? secureStorage.removeItem(key)
            : secureStorage.setItem(key, value)
        }),
      ),
    )
    .catch((error: unknown) => console.warn('Falha ao guardar a sessão', error))
  return writeQueue
}

/** Espera que todas as escritas pendentes cheguem ao armazenamento (útil nos testes). */
export const flushSessionWrites = () => writeQueue

export const useSessionStore = create<SessionState>()((set) => ({
  status: 'restoring',
  accessToken: null,
  refreshToken: null,
  user: null,
  setSession: ({ user, accessToken, refreshToken }) => {
    set({ status: 'authenticated', user, accessToken, refreshToken })
    void persist({ accessToken, refreshToken, user: JSON.stringify(user) })
  },
  setTokens: ({ accessToken, refreshToken }) => {
    set({ accessToken, refreshToken })
    void persist({ accessToken, refreshToken })
  },
  setUser: (user) => {
    set({ user })
    void persist({ user: JSON.stringify(user) })
  },
  clear: () => {
    set({ status: 'anonymous', accessToken: null, refreshToken: null, user: null })
    void persist({ accessToken: null, refreshToken: null, user: null })
  },
}))

function parseUser(raw: string | null): User | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

/** Lê a sessão guardada no arranque. Só há sessão se existir refresh token E perfil. */
export async function restoreSession(): Promise<SessionStatus> {
  try {
    const [accessToken, refreshToken, rawUser] = await Promise.all([
      secureStorage.getItem(STORAGE_KEYS.accessToken),
      secureStorage.getItem(STORAGE_KEYS.refreshToken),
      secureStorage.getItem(STORAGE_KEYS.user),
    ])
    const user = parseUser(rawUser)
    if (refreshToken && user) {
      useSessionStore.setState({ status: 'authenticated', accessToken, refreshToken, user })
      return 'authenticated'
    }
  } catch (error) {
    console.warn('Não foi possível ler a sessão guardada', error)
  }
  useSessionStore.setState({
    status: 'anonymous',
    accessToken: null,
    refreshToken: null,
    user: null,
  })
  return 'anonymous'
}

/* Evento "sessão expirou" (refresh rejeitado pela API), para a UI avisar o utilizador. */
const expiredListeners = new Set<() => void>()

export function onSessionExpired(listener: () => void) {
  expiredListeners.add(listener)
  return () => {
    expiredListeners.delete(listener)
  }
}

/** Termina a sessão porque a API rejeitou o refresh token (expirado, revogado ou reutilizado). */
export function expireSession() {
  useSessionStore.getState().clear()
  expiredListeners.forEach((listener) => listener())
}

export const selectIsAuthenticated = (state: SessionState) => state.status === 'authenticated'
