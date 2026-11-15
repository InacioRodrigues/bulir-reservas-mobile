import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import { makeService } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'
import { ServiceForm } from './ServiceForm'

describe('ServiceForm', () => {
  it('mostra as mensagens de validação do contrato', async () => {
    const onSubmit = jest.fn()
    await renderWithProviders(<ServiceForm submitLabel="Publicar" onSubmit={onSubmit} />)
    await fireEvent.changeText(screen.getByTestId('service-name'), 'ab')
    await fireEvent.changeText(screen.getByTestId('service-price'), '12,345')
    await fireEvent.press(screen.getByTestId('service-submit'))

    expect(await screen.findByText('O título deve ter pelo menos 3 caracteres')).toBeOnTheScreen()
    expect(screen.getByText('A descrição deve ter pelo menos 10 caracteres')).toBeOnTheScreen()
    expect(
      screen.getByText('O preço deve ser um número com até 2 casas decimais'),
    ).toBeOnTheScreen()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('cria com o preço normalizado como string', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined)
    await renderWithProviders(<ServiceForm submitLabel="Publicar" onSubmit={onSubmit} />)
    await fireEvent.changeText(screen.getByTestId('service-name'), '  Canalização  ')
    await fireEvent.changeText(
      screen.getByTestId('service-description'),
      'Reparação de fugas e torneiras ao domicílio.',
    )
    await fireEvent.changeText(screen.getByTestId('service-price'), '15 000,5')
    await fireEvent.press(screen.getByTestId('service-submit'))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Canalização',
        description: 'Reparação de fugas e torneiras ao domicílio.',
        price: '15000.5',
      }),
    )
  })

  it('ao editar envia só os campos alterados (PATCH parcial)', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined)
    await renderWithProviders(
      <ServiceForm service={makeService()} submitLabel="Guardar" onSubmit={onSubmit} />,
    )
    // Sem alterações o botão está desativado.
    expect(screen.getByTestId('service-submit')).toBeDisabled()
    expect(screen.getByTestId('service-price').props.value).toBe('5000,00')

    await fireEvent.changeText(screen.getByTestId('service-price'), '6000')
    await fireEvent.press(screen.getByTestId('service-submit'))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ price: '6000' }))
  })

  it('mostra no campo o erro de validação devolvido pela API', async () => {
    const { AxiosError, AxiosHeaders } = jest.requireActual<typeof import('axios')>('axios')
    const error = new AxiosError('Bad', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 400,
      statusText: '',
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
      data: {
        success: false,
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        errors: [{ field: 'name', message: 'Já tem um serviço com este nome' }],
      },
    })
    const onSubmit = jest.fn().mockRejectedValue(error)
    await renderWithProviders(<ServiceForm submitLabel="Publicar" onSubmit={onSubmit} />)
    await fireEvent.changeText(screen.getByTestId('service-name'), 'Canalização')
    await fireEvent.changeText(screen.getByTestId('service-description'), 'Descrição suficiente.')
    await fireEvent.changeText(screen.getByTestId('service-price'), '1000')
    await fireEvent.press(screen.getByTestId('service-submit'))
    expect(await screen.findByText('Já tem um serviço com este nome')).toBeOnTheScreen()
  })
})
