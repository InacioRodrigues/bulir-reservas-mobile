import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, type ComponentRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { StyleSheet, View, type TextInput } from 'react-native'
import { getErrorMessage, toApiError } from '@/shared/api/errors'
import { loginSchema, type LoginInput, type LoginValues } from '@/shared/contract/schemas'
import { useCountdown } from '@/shared/hooks/useCountdown'
import { radius, spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from '@/shared/ui/AppText'
import { Button } from '@/shared/ui/Button'
import { FormTextField } from '@/shared/ui/FormTextField'
import { InlineAlert } from '@/shared/ui/InlineAlert'
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
    </View>
  )
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
})
