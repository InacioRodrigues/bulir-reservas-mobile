import { router } from 'expo-router'
import { getErrorMessage, toApiError } from '@/shared/api/errors'
import type { Money, Service } from '@/shared/contract/types'
import { confirmAction } from '@/shared/lib/confirm'
import { formatKz, hasSufficientBalance, subtractMoney } from '@/shared/lib/money'
import { Button } from '@/shared/ui/Button'
import { toast } from '@/shared/ui/toast'
import { useCreateBooking } from '../hooks'

/**
 * Contratar: verifica o saldo ANTES (botão desativado se não chega), pede confirmação com
 * saldo atual → após e só então chama a API. Se a API responder 409 (o saldo mudou entretanto,
 * ex.: noutra sessão), mostramos a mensagem e o saldo é recarregado pelo onSettled do hook.
 */
export function HireButton({
  service,
  balance,
  onInsufficient,
}: {
  service: Service
  balance: Money
  onInsufficient?: () => void
}) {
  const book = useCreateBooking()
  const enough = hasSufficientBalance(balance, service.price)

  const hire = () =>
    book.mutate(service.id, {
      onSuccess: (booking) => {
        toast.success(`"${booking.service.name}" contratado com sucesso.`)
        router.replace('/bookings')
      },
      onError: (error) => {
        const apiError = toApiError(error)
        toast.error(getErrorMessage(apiError))
        if (apiError.is('INSUFFICIENT_BALANCE')) onInsufficient?.()
        if (apiError.is('NOT_FOUND')) router.back()
      },
    })

  return (
    <Button
      title={enough ? `Contratar por ${formatKz(service.price)}` : 'Saldo insuficiente'}
      icon={enough ? 'checkmark-circle-outline' : 'lock-closed-outline'}
      loading={book.isPending}
      disabled={!enough}
      fullWidth
      accessibilityHint={
        enough ? 'Pede confirmação antes de debitar o saldo' : 'Carregue saldo para contratar'
      }
      testID="hire-button"
      onPress={() =>
        confirmAction({
          title: 'Confirmar contratação',
          message: [
            service.name,
            `Prestador: ${service.provider.fullName}`,
            '',
            `Saldo atual: ${formatKz(balance)}`,
            `Preço: -${formatKz(service.price)}`,
            `Saldo após: ${formatKz(subtractMoney(balance, service.price))}`,
          ].join('\n'),
          confirmLabel: 'Contratar',
          onConfirm: hire,
        })
      }
    />
  )
}
