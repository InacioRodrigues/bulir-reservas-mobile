import Ionicons from '@expo/vector-icons/Ionicons'
import { StyleSheet, View } from 'react-native'
import type { Transaction, TransactionType } from '@/shared/contract/types'
import { formatDateTime } from '@/shared/lib/date'
import { formatKz } from '@/shared/lib/money'
import { radius, spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from '@/shared/ui/AppText'
import { MoneyText } from '@/shared/ui/MoneyText'

export const TRANSACTION_LABEL: Record<TransactionType, string> = {
  TOP_UP: 'Carregamento de saldo',
  BOOKING_DEBIT: 'Pagamento de reserva',
  BOOKING_CREDIT: 'Recebimento de reserva',
  REFUND_CREDIT: 'Reembolso recebido',
  REFUND_DEBIT: 'Reembolso devolvido',
}

const ICON: Record<TransactionType, 'add-circle-outline' | 'arrow-up' | 'arrow-down' | 'refresh'> =
  {
    TOP_UP: 'add-circle-outline',
    BOOKING_DEBIT: 'arrow-up',
    BOOKING_CREDIT: 'arrow-down',
    REFUND_CREDIT: 'refresh',
    REFUND_DEBIT: 'refresh',
  }

/** Movimento da carteira (ledger). O valor já vem com sinal da API. */
export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const { colors } = useTheme()
  const credit = !transaction.amount.startsWith('-')
  const label = TRANSACTION_LABEL[transaction.type]
  return (
    <View
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
      accessible
      accessibilityLabel={`${label}, ${formatKz(transaction.amount, { signed: true })}, saldo após ${formatKz(transaction.balanceAfter)}, ${formatDateTime(transaction.createdAt)}`}
    >
      <View
        style={[styles.icon, { backgroundColor: credit ? colors.successSoft : colors.dangerSoft }]}
      >
        <Ionicons
          name={ICON[transaction.type]}
          size={18}
          color={credit ? colors.success : colors.danger}
        />
      </View>
      <View style={styles.text}>
        <AppText weight="medium" numberOfLines={2}>
          {label}
        </AppText>
        <AppText variant="caption" tone="muted">
          {formatDateTime(transaction.createdAt)}
          {transaction.bookingId ? ` · Reserva #${transaction.bookingId.slice(0, 8)}` : ''}
        </AppText>
      </View>
      <View style={styles.amounts}>
        <MoneyText value={transaction.amount} signed />
        <AppText variant="caption" tone="muted">
          Saldo {formatKz(transaction.balanceAfter)}
        </AppText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  amounts: { alignItems: 'flex-end', gap: 2 },
})
