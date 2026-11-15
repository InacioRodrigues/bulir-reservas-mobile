import { router } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { useCurrentUser } from '@/features/auth/hooks'
import { spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from '@/shared/ui/AppText'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { InfiniteList } from '@/shared/ui/InfiniteList'
import { MoneyText } from '@/shared/ui/MoneyText'
import { EmptyState } from '@/shared/ui/StateViews'
import { TransactionRow } from '../components/TransactionRow'
import { useTransactions } from '../hooks'

/** Carteira: saldo atual (do servidor) e extrato de movimentos com scroll infinito. */
export function WalletScreen() {
  const { colors } = useTheme()
  const user = useCurrentUser()
  const query = useTransactions()
  const isClient = user.role === 'CLIENT'

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <InfiniteList
        query={query}
        testID="transactions-list"
        header={
          <View style={styles.header}>
            <Card
              style={[
                styles.balance,
                { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
              ]}
            >
              <AppText variant="label" tone="primary">
                Saldo disponível
              </AppText>
              <MoneyText value={user.balance} variant="title" testID="wallet-balance" />
              {isClient ? (
                <Button
                  title="Carregar saldo"
                  icon="add-circle-outline"
                  onPress={() => router.push('/top-up')}
                  testID="open-top-up"
                />
              ) : (
                <AppText variant="caption" tone="muted">
                  Recebe na carteira o valor de cada serviço contratado.
                </AppText>
              )}
            </Card>
            <AppText variant="subheading">Movimentos</AppText>
          </View>
        }
        renderItem={({ item }) => <TransactionRow transaction={item} />}
        empty={
          <EmptyState
            icon="swap-vertical-outline"
            title="Sem movimentos"
            description={
              isClient
                ? 'Carregue saldo para começar a contratar serviços.'
                : 'Os pagamentos dos seus serviços vão aparecer aqui.'
            }
          />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  header: { gap: spacing.lg, marginBottom: spacing.xs },
  balance: { gap: spacing.sm },
})
