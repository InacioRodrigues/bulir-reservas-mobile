import { apiError, clientUser, ok, page } from '@/test/fixtures'
import { installFakeApi, uninstallFakeApi } from '@/test/fake-api'
import {
  flushSessionWrites,
  onSessionExpired,
  restoreSession,
  useSessionStore,
} from '@/shared/session/session-store'
import { http, unwrapPage } from './http'

const startSession = () =>
  useSessionStore.getState().setSession({
    user: clientUser,
    accessToken: 'access-1',
    refreshToken: 'refresh-1',
  })

afterEach(() => {
  uninstallFakeApi()
  useSessionStore.getState().clear()
})

describe('http client', () => {
  it('envia o access token no header Authorization', async () => {
    startSession()
    const api = installFakeApi({ 'GET /bookings': () => ({ body: page([]) }) })
    await http.get('/bookings')
    expect(api.calls[0]?.headers.get('Authorization')).toBe('Bearer access-1')
  })

  it('faz UM só refresh para vários 401 em simultâneo e repete os pedidos', async () => {
    startSession()
    const api = installFakeApi({
      'GET /bookings': ({ headers }) =>
        headers.get('Authorization') === 'Bearer access-2'
          ? { body: page([]) }
          : { status: 401, body: apiError(401, 'UNAUTHORIZED', 'Token expirado') },
      'POST /auth/refresh': ({ body }) => {
        expect(body).toEqual({ refreshToken: 'refresh-1' })
        return { body: ok({ accessToken: 'access-2', refreshToken: 'refresh-2' }) }
      },
    })

    const results = await Promise.all([
      unwrapPage(http.get('/bookings')),
      unwrapPage(http.get('/bookings')),
      unwrapPage(http.get('/bookings')),
    ])

    expect(api.callsTo('POST', '/auth/refresh')).toHaveLength(1)
    expect(results).toHaveLength(3)
    expect(useSessionStore.getState()).toMatchObject({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
    })
  })

  it('guarda os tokens renovados no armazenamento seguro', async () => {
    startSession()
    installFakeApi({
      'GET /auth/me': ({ headers }) =>
        headers.get('Authorization') === 'Bearer access-2'
          ? { body: ok(clientUser) }
          : { status: 401, body: apiError(401, 'UNAUTHORIZED', 'x') },
      'POST /auth/refresh': () => ({
        body: ok({ accessToken: 'access-2', refreshToken: 'refresh-2' }),
      }),
    })
    await http.get('/auth/me')
    await flushSessionWrites()

    useSessionStore.setState({ status: 'restoring', accessToken: null, refreshToken: null })
    await expect(restoreSession()).resolves.toBe('authenticated')
    expect(useSessionStore.getState().refreshToken).toBe('refresh-2')
  })

  it('termina a sessão e avisa quando o refresh é rejeitado', async () => {
    startSession()
    const expired = jest.fn()
    const unsubscribe = onSessionExpired(expired)
    installFakeApi({
      'GET /bookings': () => ({ status: 401, body: apiError(401, 'UNAUTHORIZED', 'x') }),
      'POST /auth/refresh': () => ({
        status: 401,
        body: apiError(401, 'UNAUTHORIZED', 'Refresh inválido'),
      }),
    })

    await expect(http.get('/bookings')).rejects.toMatchObject({ code: 'SESSION_EXPIRED' })
    expect(useSessionStore.getState()).toMatchObject({ status: 'anonymous', accessToken: null })
    expect(expired).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('não tenta refresh num 401 do login (credenciais erradas)', async () => {
    const api = installFakeApi({
      'POST /auth/login': () => ({
        status: 401,
        body: apiError(401, 'INVALID_CREDENTIALS', 'Credenciais inválidas'),
      }),
    })
    await expect(http.post('/auth/login', {})).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    })
    expect(api.callsTo('POST', '/auth/refresh')).toHaveLength(0)
  })

  it('normaliza 429 com Retry-After', async () => {
    installFakeApi({
      'POST /bookings': () => ({
        status: 429,
        body: apiError(429, 'TOO_MANY_REQUESTS', 'Muitos pedidos'),
        headers: { 'retry-after': '30' },
      }),
    })
    await expect(http.post('/bookings', {})).rejects.toMatchObject({
      status: 429,
      retryAfter: 30,
    })
  })
})

describe('restoreSession', () => {
  it('fica anónimo quando não há sessão guardada', async () => {
    useSessionStore.getState().clear()
    await flushSessionWrites()
    await expect(restoreSession()).resolves.toBe('anonymous')
  })
})
