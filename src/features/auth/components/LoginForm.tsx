import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, type ComponentRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Pressable, StyleSheet, View, type TextInput } from 'react-native'
import { getErrorMessage, toApiError } from '@/shared/api/errors'
import { env } from '@/shared/config/env'
import { loginSchema, type LoginInput, type LoginValues } from '@/shared/contract/schemas'
import { useCountdown } from '@/shared/hooks/useCountdown'
import { radius, spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from '@/shared/ui/AppText'
import { Button } from '@/shared/ui/Button'
import { FormTextField } from '@/shared/ui/FormTextField'
import { InlineAlert } from '@/shared/ui/InlineAlert'
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../demo-accounts'
import { useLogin } from '../hooks'

/**
 * Login com e-mail OU NIF no mesmo campo (a API decide pelo "@"). O texto de ajuda diz
 * ao utilizador qual dos dois está a usar. Em 429 o botão fica bloqueado durante o
 * Retry-After indicado pela API.
 */
export function LoginForm() {
  const { colors } = useTheme()
  const login = useLogin()
  const cooldown = useCountdown()
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null)
  const form = useForm<LoginInput, unknown, LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  })
  const identifier = useWatch({ control: form.control, name: 'identifier' })
  const mode = identifier.includes('@') ? 'e-mail' : identifier.trim() ? 'NIF' : null

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values)
      // A navegação é feita pelos guards do layout raiz quando a sessão muda.
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.retryAfter) cooldown.start(apiError.retryAfter)
      form.setValue('password', '')
    }
  })

  const busy = form.formState.isSubmitting || login.isPending
  const errorMessage = login.error ? getErrorMessage(login.error) : null

  return (
    <View style={styles.form}>
      {errorMessage && (
        <InlineAlert tone="danger">
          {cooldown.active
            ? `Demasiadas tentativas. Tente novamente dentro de ${cooldown.secondsLeft} s.`
            : errorMessage}
        </InlineAlert>
      )}

      <FormTextField
        control={form.control}
        name="identifier"
        label="E-mail ou NIF"
        icon="person-outline"
        placeholder="nome@exemplo.ao ou 004512345LA041"
        hint={mode ? `A entrar com ${mode}.` : 'Use o e-mail ou o NIF da sua conta.'}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
        testID="login-identifier"
      />

      <FormTextField
        control={form.control}
        name="password"
        label="Senha"
        icon="lock-closed-outline"
        password
        ref={passwordRef}
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={() => void onSubmit()}
        testID="login-password"
      />

      <Button
        title={cooldown.active ? `Aguarde ${cooldown.secondsLeft} s` : 'Entrar'}
        icon="log-in-outline"
        loading={busy}
        disabled={cooldown.active}
        onPress={() => void onSubmit()}
        testID="login-submit"
      />

      {env.showDemoAccounts && (
        <View style={[styles.demo, { borderColor: colors.border }]}>
          <AppText variant="caption" tone="muted" weight="medium">
            Contas de demonstração (senha {DEMO_PASSWORD})
          </AppText>
          <View style={styles.demoRow}>
            {DEMO_ACCOUNTS.map((account) => (
              <Pressable
                key={account.identifier}
                accessibilityRole="button"
                accessibilityLabel={`Preencher com ${account.label}: ${account.hint}`}
                onPress={() =>
                  form.reset({ identifier: account.identifier, password: DEMO_PASSWORD })
                }
                style={({ pressed }) => [
                  styles.demoButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
                  },
                ]}
              >
                <AppText variant="label">{account.label}</AppText>
                <AppText variant="caption" tone="muted">
                  {account.hint}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  demo: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  demoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  demoButton: {
    flexGrow: 1,
    flexBasis: 140,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
    minHeight: 48,
  },
})
