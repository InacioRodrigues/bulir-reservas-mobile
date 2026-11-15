import { zodResolver } from '@hookform/resolvers/zod'
import { router, useLocalSearchParams } from 'expo-router'
import { useForm } from 'react-hook-form'
import { StyleSheet, View } from 'react-native'
import { useMe } from '@/features/auth/hooks'
import { applyFieldErrors, getErrorMessage } from '@/shared/api/errors'
import { topUpSchema, type TopUpInput, type TopUpValues } from '@/shared/contract/schemas'
import { formatKz, isMoney } from '@/shared/lib/money'
import { spacing } from '@/shared/theme/theme'
import { AppText } from '@/shared/ui/AppText'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Chip } from '@/shared/ui/Chip'
import { FormTextField } from '@/shared/ui/FormTextField'
import { InlineAlert } from '@/shared/ui/InlineAlert'
import { MoneyText } from '@/shared/ui/MoneyText'
import { Screen } from '@/shared/ui/Screen'
import { toast } from '@/shared/ui/toast'
import { useTopUp } from '../hooks'

const QUICK_AMOUNTS = ['5000', '10000', '25000', '50000']

/** Carregamento de saldo (só clientes — a API devolve 403 a prestadores). Abre como modal. */
export function TopUpScreen() {
  const { suggested } = useLocalSearchParams<{ suggested?: string }>()
  const { data: me } = useMe()
  const topUp = useTopUp()
  const form = useForm<TopUpInput, unknown, TopUpValues>({
    resolver: zodResolver(topUpSchema),
    defaultValues: { amount: suggested && isMoney(suggested) ? suggested.replace('.', ',') : '' },
  })

  const submit = form.handleSubmit(async ({ amount }) => {
    try {
      const { balance } = await topUp.mutateAsync(amount)
      toast.success(`Saldo carregado. Novo saldo: ${formatKz(balance)}`)
      router.back()
    } catch (error) {
      if (!applyFieldErrors(error, form.setError, ['amount'] as const)) {
        form.setError('root', { message: getErrorMessage(error) })
      }
    }
  })

  const rootError = form.formState.errors.root?.message

  return (
    <Screen scroll edges={['bottom']}>
      {me && (
        <Card>
          <AppText variant="label" tone="muted">
            Saldo atual
          </AppText>
          <MoneyText value={me.balance} variant="heading" />
        </Card>
      )}
      {suggested && (
        <InlineAlert tone="info">
          Sugerimos o valor em falta para contratar o serviço que estava a ver.
        </InlineAlert>
      )}
      {rootError && <InlineAlert tone="danger">{rootError}</InlineAlert>}

      <FormTextField
        control={form.control}
        name="amount"
        label="Valor a carregar"
        suffix="Kz"
        placeholder="0,00"
        keyboardType="decimal-pad"
        hint="Máximo de 1 000 000 Kz por carregamento."
        autoFocus={!suggested}
        testID="top-up-amount"
      />
      <View style={styles.chips} accessibilityLabel="Valores rápidos">
        {QUICK_AMOUNTS.map((amount) => (
          <Chip
            key={amount}
            label={formatKz(amount).replace(',00', '')}
            accessibilityLabel={`Carregar ${formatKz(amount)}`}
            onPress={() =>
              form.setValue('amount', amount, { shouldValidate: true, shouldDirty: true })
            }
          />
        ))}
      </View>
      <Button
        title="Carregar saldo"
        icon="wallet-outline"
        loading={form.formState.isSubmitting}
        onPress={() => void submit()}
        testID="top-up-submit"
      />
      <AppText variant="caption" tone="muted" align="center">
        Ambiente de demonstração: o valor é creditado de imediato, sem pagamento real.
      </AppText>
    </Screen>
  )
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
})
