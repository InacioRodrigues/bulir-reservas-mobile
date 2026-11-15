import Ionicons from '@expo/vector-icons/Ionicons'
import { StyleSheet, View } from 'react-native'
import type { Money } from '@/shared/contract/types'
import { formatKz, hasSufficientBalance, subtractMoney } from '@/shared/lib/money'
import { spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from '@/shared/ui/AppText'
import { Card } from '@/shared/ui/Card'
import { MoneyText } from '@/shared/ui/MoneyText'

/**
 * Resumo antes de contratar: saldo atual → preço → saldo após.
 * É só uma pré-visualização (UX); o débito real é feito e validado pela API, de forma atómica.
 */
export function HireSummary({ balance, price }: { balance: Money; price: Money }) {
  const { colors } = useTheme()
  const enough = hasSufficientBalance(balance, price)
  const after = subtractMoney(balance, price)

  return (
    <Card
      style={styles.card}
      accessibilityLabel={`Saldo atual ${formatKz(balance)}, preço ${formatKz(price)}, ${
        enough ? `saldo após contratar ${formatKz(after)}` : 'saldo insuficiente'
      }`}
    >
      <View style={styles.row}>
        <AppText tone="muted">Saldo atual</AppText>
        <MoneyText value={balance} testID="summary-balance" />
      </View>
      <View style={styles.row}>
        <AppText tone="muted">Preço do serviço</AppText>
        <AppText weight="bold" tone="danger">
          -{formatKz(price)}
        </AppText>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.row}>
        <View style={styles.label}>
          <Ionicons
            name={enough ? 'checkmark-circle' : 'alert-circle'}
            size={18}
            color={enough ? colors.success : colors.danger}
          />
          <AppText weight="medium">{enough ? 'Saldo após contratar' : 'Em falta'}</AppText>
        </View>
        <AppText
          weight="bold"
          variant="subheading"
          tone={enough ? 'success' : 'danger'}
          testID="summary-after"
        >
          {formatKz(enough ? after : subtractMoney(price, balance))}
        </AppText>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  label: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  divider: { height: StyleSheet.hairlineWidth },
})
