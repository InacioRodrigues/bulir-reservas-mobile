import { AxiosError, AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { authHttp, http } from '@/shared/api/http'

/**
 * API falsa ao nível do adapter do axios: os testes passam pelos interceptors reais
 * (token, refresh, normalização de erros) sem rede nem servidor. Equivalente ao MSW da web,
 * mas sem polyfills de fetch/streams no ambiente React Native do Jest.
 */
export interface FakeRequest {
  method: string
  url: string
  params: Record<string, unknown>
  body: unknown
  headers: AxiosHeaders
}

export interface FakeResponse {
  status?: number
  body?: unknown
  headers?: Record<string, string>
}

export type FakeHandler = (request: FakeRequest) => FakeResponse | Promise<FakeResponse>

type Routes = Record<string, FakeHandler>

const originalAdapters = { http: http.defaults.adapter, auth: authHttp.defaults.adapter }

/** Encontra a rota "GET /services/:id" que corresponde ao pedido. */
function match(routes: Routes, method: string, url: string): FakeHandler | undefined {
  for (const [key, handler] of Object.entries(routes)) {
    const [routeMethod, routePath = ''] = key.split(' ')
    if (routeMethod !== method) continue
    const pattern = new RegExp(`^${routePath.replace(/:[^/]+/g, '[^/]+')}$`)
    if (pattern.test(url)) return handler
  }
  return undefined
}

export function installFakeApi(routes: Routes) {
  const calls: FakeRequest[] = []
  const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
    const method = (config.method ?? 'get').toUpperCase()
    const url = (config.url ?? '').replace(config.baseURL ?? '', '')
    const request: FakeRequest = {
      method,
      url,
      params: (config.params as Record<string, unknown>) ?? {},
      body: typeof config.data === 'string' ? JSON.parse(config.data) : config.data,
      headers: AxiosHeaders.from(config.headers),
    }
    calls.push(request)
    const handler = match(routes, method, url)
    const result: FakeResponse = handler
      ? await handler(request)
      : {
          status: 404,
          body: {
            success: false,
            code: 'NOT_FOUND',
            message: `Sem rota: ${method} ${url}`,
            errors: [],
          },
        }
    const response = {
      data: result.body,
      status: result.status ?? 200,
      statusText: '',
      headers: new AxiosHeaders(result.headers ?? {}),
      config,
    }
    if (response.status >= 400) {
      throw new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, undefined, response)
    }
    return response
  }
  http.defaults.adapter = adapter
  authHttp.defaults.adapter = adapter
  return {
    calls,
    callsTo: (method: string, url: string) =>
      calls.filter((call) => call.method === method && call.url === url),
  }
}

export function uninstallFakeApi() {
  http.defaults.adapter = originalAdapters.http
  authHttp.defaults.adapter = originalAdapters.auth
}

export const networkError = (): never => {
  throw new AxiosError('Network Error', 'ERR_NETWORK')
}
