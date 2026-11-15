import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import { useSessionStore } from '@/shared/session/session-store'
import { installFakeApi, uninstallFakeApi } from '@/test/fake-api'
import { apiError, clientUser, ok } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'
import { LoginForm } from './LoginForm'

afterEach(() => {
  uninstallFakeApi()
  useSessionStore.getState().clear()
})

describe('LoginForm', () => {
  it('valida os campos antes de chamar a API', async () => {
    const api = installFakeApi({})
    await renderWithProviders(<LoginForm />)
    await fireEvent.press(screen.getByTestId('login-submit'))
    expect(await screen.findByText('Indique o e-mail ou o NIF')).toBeOnTheScreen()
    expect(screen.getByText('Indique a senha')).toBeOnTheScreen()
    expect(api.calls).toHaveLength(0)
  })

  it('entra com NIF e guarda a sessão', async () => {
    const api = installFakeApi({
      'POST /auth/login': () => ({
        body: ok({ user: clientUser, accessToken: 'access-1', refreshToken: 'refresh-1' }),
      }),
    })
    await renderWithProviders(<LoginForm />)
    await fireEvent.changeText(screen.getByTestId('login-identifier'), ' 004512345LA041 ')
    expect(screen.getByText('A entrar com NIF.')).toBeOnTheScreen()
    await fireEvent.changeText(screen.getByTestId('login-password'), 'Senha@123')
    await fireEvent.press(screen.getByTestId('login-submit'))

    await waitFor(() => expect(useSessionStore.getState().status).toBe('authenticated'))
    expect(api.callsTo('POST', '/auth/login')[0]?.body).toEqual({
      identifier: '004512345LA041',
      password: 'Senha@123',
    })
    expect(useSessionStore.getState().user?.role).toBe('CLIENT')
  })

  it('mostra erro genérico com credenciais erradas e limpa a senha', async () => {
    installFakeApi({
      'POST /auth/login': () => ({
        status: 401,
        body: apiError(401, 'INVALID_CREDENTIALS', 'Credenciais inválidas'),
      }),
    })
    await renderWithProviders(<LoginForm />)
    await fireEvent.changeText(screen.getByTestId('login-identifier'), 'ana@bulir.demo')
    await fireEvent.changeText(screen.getByTestId('login-password'), 'errada123')
    await fireEvent.press(screen.getByTestId('login-submit'))

    expect(await screen.findByText('E-mail/NIF ou senha incorretos.')).toBeOnTheScreen()
    expect(screen.getByTestId('login-password').props.value).toBe('')
    expect(useSessionStore.getState().status).not.toBe('authenticated')
  })

  it('bloqueia o botão durante o Retry-After de um 429', async () => {
    installFakeApi({
      'POST /auth/login': () => ({
        status: 429,
        body: apiError(429, 'TOO_MANY_REQUESTS', 'Muitos pedidos'),
        headers: { 'retry-after': '42' },
      }),
    })
    await renderWithProviders(<LoginForm />)
    await fireEvent.changeText(screen.getByTestId('login-identifier'), 'ana@bulir.demo')
    await fireEvent.changeText(screen.getByTestId('login-password'), 'Senha@123')
    await fireEvent.press(screen.getByTestId('login-submit'))

    expect(await screen.findByText(/Aguarde 4\d s/)).toBeOnTheScreen()
    expect(screen.getByTestId('login-submit')).toBeDisabled()
  })
})
