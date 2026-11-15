import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import { Pressable, StyleSheet } from 'react-native'
import { useMe } from '@/features/auth/hooks'
import { formatKz } from '@/shared/lib/money'
import { radius, spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from '@/shared/ui/AppText'

/** Saldo sempre visível no header; toca para abrir a carteira. */
export function BalanceChip() {
  const { colors } = useTheme()
  const { data: user, isFetching } = useMe()
  if (!user) return null
  const label = formatKz(user.balance)
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Saldo: ${label}`}
      accessibilityHint="Abre a carteira"
      onPress={() => router.navigate('/wallet')}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: pressed ? colors.border : colors.primarySoft,
          opacity: isFetching ? 0.75 : 1,
        },
      ]}
      testID="balance-chip"
    >
      <Ionicons name="wallet-outline" size={16} color={colors.primary} />
      <AppText variant="label" tone="primary">
        {label}
      </AppText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    minHeight: 36,
    borderRadius: radius.pill,
    marginHorizontal: spacing.lg,
  },
})
