import { router, Stack, useLocalSearchParams } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { useMe } from '@/features/auth/hooks'
import { HireButton } from '@/features/bookings/components/HireButton'
import { HireSummary } from '@/features/bookings/components/HireSummary'
import { formatDate } from '@/shared/lib/date'
import { hasSufficientBalance, subtractMoney } from '@/shared/lib/money'
import { spacing } from '@/shared/theme/theme'
import { AppText } from '@/shared/ui/AppText'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { InlineAlert } from '@/shared/ui/InlineAlert'
import { MoneyText } from '@/shared/ui/MoneyText'
import { Screen } from '@/shared/ui/Screen'
import { ErrorState, LoadingState } from '@/shared/ui/StateViews'
import { useService } from '../hooks'

export function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const query = useService(id)
  const me = useMe()

  if (query.isPending || !me.data) return <LoadingState />
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />

  const service = query.data
  const balance = me.data.balance
  const enough = hasSufficientBalance(balance, service.price)
  const goTopUp = () =>
    router.push({
      pathname: '/top-up',
      params: { suggested: enough ? undefined : subtractMoney(service.price, balance) },
    })

  return (
    <Screen
      scroll
      footer={
        <View style={styles.footer}>
          <HireButton
            service={service}
            balance={balance}
            onInsufficient={() => void me.refetch()}
          />
        </View>
      }
    >
      <Stack.Screen options={{ title: service.name }} />
      <View style={styles.titleBlock}>
        <AppText variant="heading">{service.name}</AppText>
        <MoneyText value={service.price} variant="heading" tone="primary" />
      </View>

      <Card style={styles.provider}>
        <Avatar name={service.provider.fullName} />
        <View style={styles.flex}>
          <AppText variant="caption" tone="muted">
            Prestador
          </AppText>
          <AppText weight="medium">{service.provider.fullName}</AppText>
        </View>
        <AppText variant="caption" tone="muted">
          publicado a {formatDate(service.createdAt)}
        </AppText>
      </Card>

      <View style={styles.section}>
        <AppText variant="label">Descrição</AppText>
        <AppText>{service.description}</AppText>
      </View>

      <HireSummary balance={balance} price={service.price} />

      {!enough && (
        <InlineAlert tone="warning" title="Saldo insuficiente">
          <View style={styles.alertBody}>
            <AppText>Carregue a carteira para poder contratar este serviço.</AppText>
            <Button title="Carregar saldo" icon="add-circle-outline" size="sm" onPress={goTopUp} />
          </View>
        </InlineAlert>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  titleBlock: { gap: spacing.xs },
  provider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
  section: { gap: spacing.xs },
  footer: { width: '100%', maxWidth: 720 },
  alertBody: { gap: spacing.sm, alignItems: 'flex-start' },
})
