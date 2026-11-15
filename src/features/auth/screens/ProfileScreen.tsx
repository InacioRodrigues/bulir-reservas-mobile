import { StyleSheet, View } from 'react-native'
import { useCurrentUser, useLogout } from '@/features/auth/hooks'
import { ROLE_LABEL } from '@/features/auth/roles'
import { confirmAction } from '@/shared/lib/confirm'
import { formatDate } from '@/shared/lib/date'
import { spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from '@/shared/ui/AppText'
import { Avatar } from '@/shared/ui/Avatar'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { MoneyText } from '@/shared/ui/MoneyText'
import { Screen } from '@/shared/ui/Screen'
import { toast } from '@/shared/ui/toast'

function Row({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme()
  return (
    <View
      style={[styles.row, { borderColor: colors.border }]}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <AppText tone="muted">{label}</AppText>
      <AppText weight="medium" selectable style={styles.value}>
        {value}
      </AppText>
    </View>
  )
}

export function ProfileScreen() {
  const user = useCurrentUser()
  const logout = useLogout()

  return (
    <Screen scroll>
      <Card style={styles.header}>
        <Avatar name={user.fullName} size={64} />
        <View style={styles.headerText}>
          <AppText variant="subheading">{user.fullName}</AppText>
          <Badge label={ROLE_LABEL[user.role]} tone="primary" />
        </View>
      </Card>

      <Card>
        <AppText tone="muted" variant="label">
          Saldo disponível
        </AppText>
        <MoneyText value={user.balance} variant="heading" />
      </Card>

      <Card style={styles.details}>
        <Row label="E-mail" value={user.email} />
        <Row label="NIF" value={user.nif} />
        <Row label="Conta criada em" value={formatDate(user.createdAt)} />
      </Card>

      <Button
        title="Terminar sessão"
        icon="log-out-outline"
        variant="outline"
        loading={logout.isPending}
        onPress={() =>
          confirmAction({
            title: 'Terminar sessão?',
            message: 'Vai precisar de iniciar sessão novamente para usar a app.',
            confirmLabel: 'Terminar sessão',
            destructive: true,
            onConfirm: () =>
              logout.mutate(undefined, { onSettled: () => toast.success('Sessão terminada.') }),
          })
        }
        testID="logout"
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  headerText: { flex: 1, gap: spacing.xs },
  details: { gap: 0, paddingVertical: spacing.xs },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  value: { flexShrink: 1, textAlign: 'right' },
})
