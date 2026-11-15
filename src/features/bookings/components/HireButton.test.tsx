import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import { Alert, type AlertButton } from 'react-native'
import { installFakeApi, uninstallFakeApi } from '@/test/fake-api'
import { apiError, makeBooking, makeService, ok } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'
import { useToastStore } from '@/shared/ui/toast'
import { HireButton } from './HireButton'

const mockReplace = jest.fn()
jest.mock('expo-router', () => ({
  router: { replace: (...args: unknown[]) => mockReplace(...args), back: jest.fn() },
}))

/** Simula o utilizador a carregar no botão "Contratar" do Alert de confirmação. */
function confirmAlert() {
  const alert = jest.spyOn(Alert, 'alert')
  return {
    alert,
    accept: () => {
      const buttons = alert.mock.calls.at(-1)?.[2] as AlertButton[]
      buttons.find((button) => button.text === 'Contratar')?.onPress?.()
    },
  }
}

afterEach(() => {
  uninstallFakeApi()
  jest.restoreAllMocks()
  mockReplace.mockReset()
  useToastStore.setState({ items: [] })
})

describe('HireButton', () => {
  const service = makeService({ price: '5000.00' })

  it('fica desativado quando o saldo não chega (verificação antes de contratar)', async () => {
    const api = installFakeApi({})
    await renderWithProviders(<HireButton service={service} balance="4999.99" />)
    expect(screen.getByTestId('hire-button')).toBeDisabled()
    expect(screen.getByText('Saldo insuficiente')).toBeOnTheScreen()
    expect(api.calls).toHaveLength(0)
  })

  it('pede confirmação com saldo atual e após, e só depois reserva', async () => {
    const api = installFakeApi({
      'POST /bookings': () => ({ status: 201, body: ok(makeBooking()) }),
    })
    const dialog = confirmAlert()
    await renderWithProviders(<HireButton service={service} balance="5000.00" />)

    await fireEvent.press(screen.getByTestId('hire-button'))
    const message = dialog.alert.mock.calls[0]?.[1]
    expect(message).toContain('Saldo atual: 5 000,00 Kz')
    expect(message).toContain('Saldo após: 0,00 Kz')
    expect(api.calls).toHaveLength(0)

    dialog.accept()
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/bookings'))
    expect(api.callsTo('POST', '/bookings')[0]?.body).toEqual({ serviceId: service.id })
  })

  it('mostra a mensagem quando a API recusa por saldo insuficiente (409)', async () => {
    installFakeApi({
      'POST /bookings': () => ({
        status: 409,
        body: apiError(409, 'INSUFFICIENT_BALANCE', 'Saldo insuficiente'),
      }),
    })
    const onInsufficient = jest.fn()
    const dialog = confirmAlert()
    await renderWithProviders(
      <HireButton service={service} balance="9000.00" onInsufficient={onInsufficient} />,
    )
    await fireEvent.press(screen.getByTestId('hire-button'))
    dialog.accept()

    await waitFor(() => expect(onInsufficient).toHaveBeenCalled())
    expect(useToastStore.getState().items.at(-1)?.message).toBe(
      'Saldo insuficiente para contratar este serviço.',
    )
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
