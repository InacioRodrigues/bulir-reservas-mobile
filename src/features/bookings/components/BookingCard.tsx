import Ionicons from '@expo/vector-icons/Ionicons'
import { StyleSheet, View } from 'react-native'
import { ROLE_LABEL } from '@/features/auth/roles'
import type { Booking, Role } from '@/shared/contract/types'
import { formatDateTime } from '@/shared/lib/date'
import { formatKz } from '@/shared/lib/money'
import { spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from '@/shared/ui/AppText'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { MoneyText } from '@/shared/ui/MoneyText'

function Person({
  icon,
  label,
  name,
}: {
  icon: 'person-outline' | 'briefcase-outline'
  label: string
  name: string
}) {
  const { colors } = useTheme()
  return (
    <View style={styles.person}>
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText variant="caption" weight="medium" style={styles.flex} numberOfLines={1}>
        {name}
      </AppText>
    </View>
  )
}

interface BookingCardProps {
  booking: Booking
  viewerRole: Role
  onCancel?: (booking: Booking) => void
  cancelling?: boolean
}

/** Uma reserva do histórico: serviço, prestador, cliente, valor, data e estado. */
export function BookingCard({
  booking,
  viewerRole,
  onCancel,
  cancelling = false,
}: BookingCardProps) {
  const confirmed = booking.status === 'CONFIRMED'
  // Do ponto de vista de quem vê: o cliente pagou, o prestador recebeu.
  const amountLabel = viewerRole === 'CLIENT' ? 'Pago' : 'Recebido'

  return (
    <Card
      accessibilityLabel={`${booking.service.name}, ${confirmed ? 'confirmada' : 'cancelada'}, ${formatKz(booking.price)}, cliente ${booking.client.fullName}, prestador ${booking.provider.fullName}`}
    >
      <View style={styles.header}>
        <AppText variant="subheading" style={styles.flex} numberOfLines={2}>
          {booking.service.name}
        </AppText>
        <Badge
          label={confirmed ? 'Confirmada' : 'Cancelada'}
          tone={confirmed ? 'success' : 'neutral'}
        />
      </View>

      <View style={styles.people}>
        <Person icon="briefcase-outline" label="Prestador" name={booking.provider.fullName} />
        <Person icon="person-outline" label="Cliente" name={booking.client.fullName} />
      </View>

      <View style={styles.footer}>
        <View>
          <AppText variant="caption" tone="muted">
            {confirmed ? amountLabel : 'Reembolsado'}
          </AppText>
          <MoneyText
            value={booking.price}
            tone={confirmed ? 'default' : 'muted'}
            style={!confirmed && styles.strike}
          />
        </View>
        <AppText variant="caption" tone="muted" style={styles.date}>
          {formatDateTime(booking.createdAt)}
        </AppText>
      </View>

      {!confirmed && booking.cancelledAt && (
        <AppText variant="caption" tone="muted">
          Cancelada em {formatDateTime(booking.cancelledAt)}
          {booking.cancelledBy ? ` pelo ${ROLE_LABEL[booking.cancelledBy].toLowerCase()}` : ''}
        </AppText>
      )}

      {confirmed && onCancel && (
        <View style={styles.actions}>
          <Button
            title="Cancelar reserva"
            icon="arrow-undo-outline"
            size="sm"
            variant="outline"
            loading={cancelling}
            accessibilityLabel={`Cancelar reserva de ${booking.service.name}`}
            onPress={() => onCancel(booking)}
          />
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  flex: { flex: 1 },
  people: { gap: spacing.xs },
  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  date: { textAlign: 'right' },
  strike: { textDecorationLine: 'line-through' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
})
