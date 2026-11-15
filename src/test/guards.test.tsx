import { screen, waitFor } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import * as SecureStore from 'expo-secure-store'
import type { User } from '@/shared/contract/types'
import { STORAGE_KEYS, useSessionStore } from '@/shared/session/session-store'
import { installFakeApi, uninstallFakeApi } from '@/test/fake-api'
import { clientUser, makeService, page, providerUser, ok } from '@/test/fixtures'

/**
 * Guards por papel com o router e os layouts REAIS da app (src/app):
 * a sessão é restaurada do SecureStore (mock) e o index decide o ecrã inicial.
 */
jest.setTimeout(20_000)

async function storeSession(user: User | null) {
  if (!user) {
    await Promise.all(Object.values(STORAGE_KEYS).map((key) => SecureStore.deleteItemAsync(key)))
    return
  }
  await SecureStore.setItemAsync(STORAGE_KEYS.accessToken, 'access-1')
  await SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, 'refresh-1')
  await SecureStore.setItemAsync(STORAGE_KEYS.user, JSON.stringify(user))
}

function fakeApiFor(user: User) {
  installFakeApi({
    'GET /auth/me': () => ({ body: ok(user) }),
    'GET /services': () => ({ body: page([makeService()]) }),
    'GET /services/mine': () => ({ body: page([makeService()]) }),
  })
}

beforeEach(() => {
  useSessionStore.setState({
    status: 'restoring',
    accessToken: null,
    refreshToken: null,
    user: null,
  })
})

afterEach(() => {
  uninstallFakeApi()
})

describe('guards de rota por papel', () => {
  it('sem sessão abre o login', async () => {
    await storeSession(null)
    installFakeApi({})
    await renderRouter('./src/app', { initialUrl: '/' })
    await waitFor(() => expect(screen).toHavePathname('/login'))
    expect(await screen.findByText('Iniciar sessão')).toBeOnTheScreen()
  })

  it('cliente vai para o catálogo e não vê os separadores do prestador', async () => {
    await storeSession(clientUser)
    fakeApiFor(clientUser)
    await renderRouter('./src/app', { initialUrl: '/' })
    await waitFor(() => expect(screen).toHavePathname('/catalog'))
    expect(await screen.findByText('Corte de cabelo')).toBeOnTheScreen()
    expect(screen.queryByText('Novo')).toBeNull()
    expect(screen.queryByText('Serviços')).toBeNull()
  })

  it('prestador vai para "Meus serviços" e não vê o catálogo', async () => {
    await storeSession(providerUser)
    fakeApiFor(providerUser)
    await renderRouter('./src/app', { initialUrl: '/' })
    await waitFor(() => expect(screen).toHavePathname('/services'))
    expect(await screen.findByText('1 serviço publicado')).toBeOnTheScreen()
    expect(screen.queryByText('Catálogo')).toBeNull()
  })

  it('prestador não consegue abrir o detalhe de contratação de um cliente', async () => {
    await storeSession(providerUser)
    fakeApiFor(providerUser)
    await renderRouter('./src/app', { initialUrl: `/service/${makeService().id}` })
    await waitFor(() => expect(screen).not.toHavePathname(`/service/${makeService().id}`))
    expect(screen.queryByTestId('hire-button')).toBeNull()
  })
})
