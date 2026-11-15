import { router } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useCurrentUser } from '@/features/auth/hooks'
import { getErrorMessage } from '@/shared/api/errors'
import { totalOf } from '@/shared/api/infinite'
import type { Booking, BookingStatus } from '@/shared/contract/types'
import { confirmAction } from '@/shared/lib/confirm'
import { formatKz } from '@/shared/lib/money'
import { spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from '@/shared/ui/AppText'
import { Button } from '@/shared/ui/Button'
import { InfiniteList } from '@/shared/ui/InfiniteList'
import { SegmentedControl } from '@/shared/ui/SegmentedControl'
import { EmptyState } from '@/shared/ui/StateViews'
import { toast } from '@/shared/ui/toast'
import { BookingCard } from '../components/BookingCard'
import { useBookings, useCancelBooking } from '../hooks'

type Filter = 'ALL' | BookingStatus

const FILTERS = [
  { value: 'ALL', label: 'Todas' },
  { value: 'CONFIRMED', label: 'Confirmadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
] as const

/** Histórico de reservas (cliente e prestador), com filtro por estado e cancelamento. */
export function BookingsScreen() {
  const { colors } = useTheme()
  const user = useCurrentUser()
  const [filter, setFilter] = useState<Filter>('ALL')
  const query = useBookings({ status: filter === 'ALL' ? undefined : filter })
  const cancel = useCancelBooking()
  const total = totalOf(query.data)
  const isClient = user.role === 'CLIENT'

  const confirmCancel = (booking: Booking) =>
    confirmAction({
      title: `Cancelar "${booking.service.name}"?`,
      message: isClient
        ? `Recebe de volta ${formatKz(booking.price)} na sua carteira. O valor é debitado a ${booking.provider.fullName}. Esta ação não pode ser anulada.`
        : `${formatKz(booking.price)} será debitado do seu saldo e devolvido a ${booking.client.fullName}. Esta ação não pode ser anulada.`,
      confirmLabel: 'Cancelar reserva',
      cancelLabel: 'Manter',
      destructive: true,
      onConfirm: () =>
        cancel.mutate(booking.id, {
          onSuccess: () => toast.success('Reserva cancelada e valor reembolsado ao cliente.'),
          onError: (error) => toast.error(getErrorMessage(error)),
        }),
    })

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <InfiniteList
        query={query}
        testID="bookings-list"
        header={
          <View style={styles.header}>
            <SegmentedControl
              options={FILTERS}
              value={filter}
              onChange={setFilter}
              accessibilityLabel="Filtrar por estado"
            />
            {total !== undefined && (
              <AppText variant="caption" tone="muted">
                {total === 1 ? '1 reserva' : `${total} reservas`}
              </AppText>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            viewerRole={user.role}
            onCancel={confirmCancel}
            cancelling={cancel.isPending && cancel.variables === item.id}
          />
        )}
        empty={
          <EmptyState
            icon="receipt-outline"
            title={filter === 'ALL' ? 'Ainda não há reservas' : 'Nenhuma reserva neste estado'}
            description={
              isClient
                ? 'Os serviços que contratar aparecem aqui.'
                : 'Quando um cliente contratar um dos seus serviços, a reserva aparece aqui.'
            }
            action={
              isClient && filter === 'ALL' ? (
                <Button
                  title="Explorar catálogo"
                  icon="search"
                  onPress={() => router.navigate('/catalog')}
                />
              ) : undefined
            }
          />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, marginBottom: spacing.xs },
})
