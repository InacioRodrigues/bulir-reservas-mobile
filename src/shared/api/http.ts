import { create, isAxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/shared/config/env'
import type { AuthTokens, Paginated, SuccessEnvelope } from '@/shared/contract/types'
import { expireSession, useSessionStore } from '@/shared/session/session-store'
import { ApiError, toApiError } from './errors'

/**
 * Cliente HTTP único da app.
 *  - request: injeta `Authorization: Bearer <accessToken>`;
 *  - response: em 401 tenta UM refresh (rotativo) e repete o pedido; se o refresh falhar,
 *    termina a sessão; todos os erros saem normalizados como ApiError.
 */
const baseConfig = {
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
}

export const http = create(baseConfig)

/** Instância sem interceptors só para o refresh (não pode entrar no ciclo 401 → refresh). */
export const authHttp = create(baseConfig)

interface RetriableConfig extends InternalAxiosRequestConfig {
  retriedAfterRefresh?: boolean
}

/** Rotas onde um 401 é resposta legítima e não deve disparar refresh. */
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']
const isAuthRoute = (url = '') => AUTH_ROUTES.some((route) => url.endsWith(route))

http.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* ------------------------------------------------------------------------------------------ */
/* Refresh token rotativo                                                                       */
/* ------------------------------------------------------------------------------------------ */

let refreshInFlight: Promise<string> | null = null

/**
 * A API roda o refresh token a cada uso e, se um token já usado for reapresentado,
 * revoga TODAS as sessões do utilizador (deteção de roubo). Por isso, pedidos 401 simultâneos
 * (ex.: saldo + reservas + carteira ao voltar à app) partilham a MESMA promessa de refresh
 * (single-flight). Na web havia ainda um Web Lock entre abas; numa app mobile há um só
 * processo JS, por isso a promessa partilhada em memória chega.
 */
export function refreshAccessToken(failedAccessToken: string | null): Promise<string> {
  refreshInFlight ??= doRefresh(failedAccessToken).finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

async function doRefresh(failedAccessToken: string | null): Promise<string> {
  const session = useSessionStore.getState()

  // Um refresh anterior já trouxe um token novo (o pedido falhado levava o antigo).
  if (session.accessToken && failedAccessToken && session.accessToken !== failedAccessToken) {
    return session.accessToken
  }
  if (!session.refreshToken) {
    expireSession()
    throw sessionExpired()
  }

  try {
    const response = await authHttp.post<SuccessEnvelope<AuthTokens>>('/auth/refresh', {
      refreshToken: session.refreshToken,
    })
    useSessionStore.getState().setTokens(response.data.data)
    return response.data.data.accessToken
  } catch (error) {
    const apiError = toApiError(error)
    // Só terminamos a sessão se a API rejeitou o refresh token; falhas de rede não deslogam.
    if (apiError.status === 401 || apiError.status === 400) {
      expireSession()
      throw sessionExpired()
    }
    throw apiError
  }
}

const sessionExpired = () =>
  new ApiError({ status: 401, code: 'SESSION_EXPIRED', message: 'Sessão expirada.' })

http.interceptors.response.use(undefined, async (error: unknown) => {
  if (isAxiosError(error) && error.response?.status === 401 && error.config) {
    const config = error.config as RetriableConfig
    if (!config.retriedAfterRefresh && !isAuthRoute(config.url)) {
      config.retriedAfterRefresh = true
      const failedToken = String(config.headers.Authorization ?? '').replace(/^Bearer /, '') || null
      const accessToken = await refreshAccessToken(failedToken)
      config.headers.Authorization = `Bearer ${accessToken}`
      return http(config)
    }
  }
  throw toApiError(error)
})

/* ------------------------------------------------------------------------------------------ */
/* Desembrulhar o envelope { success, data, meta }                                              */
/* ------------------------------------------------------------------------------------------ */

export async function unwrap<T>(request: Promise<AxiosResponse<SuccessEnvelope<T>>>): Promise<T> {
  const response = await request
  return response.data.data
}

export async function unwrapPage<T>(
  request: Promise<AxiosResponse<SuccessEnvelope<T[]>>>,
): Promise<Paginated<T>> {
  const response = await request
  const { data, meta } = response.data
  return {
    items: data,
    meta: meta ?? { page: 1, perPage: data.length, total: data.length, totalPages: 1 },
  }
}

/** Remove parâmetros vazios para não enviar `?search=` à API (que validaria string vazia). */
export function cleanParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  ) as Partial<T>
}
