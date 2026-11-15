import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, View } from 'react-native'
import { applyFieldErrors, getErrorMessage, toApiError } from '@/shared/api/errors'
import { registerSchema, type RegisterInput, type RegisterValues } from '@/shared/contract/schemas'
import { spacing } from '@/shared/theme/theme'
import { Button } from '@/shared/ui/Button'
import { FormTextField } from '@/shared/ui/FormTextField'
import { InlineAlert } from '@/shared/ui/InlineAlert'
import { useRegister } from '../hooks'
import { RoleSelector } from './RoleSelector'

const FIELDS = ['fullName', 'nif', 'email', 'password', 'role'] as const

export function RegisterForm() {
  const registerUser = useRegister()
  const form = useForm<RegisterInput, unknown, RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      nif: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: undefined,
    },
  })

  const onSubmit = form.handleSubmit(async ({ confirmPassword: _confirm, ...payload }) => {
    try {
      await registerUser.mutateAsync(payload)
    } catch (error) {
      const apiError = toApiError(error)
      // Conflitos de unicidade apontam para o campo certo.
      if (apiError.is('EMAIL_ALREADY_EXISTS')) {
        form.setError('email', { message: getErrorMessage(apiError) })
      } else if (apiError.is('NIF_ALREADY_EXISTS')) {
        form.setError('nif', { message: getErrorMessage(apiError) })
      } else {
        applyFieldErrors(apiError, form.setError, FIELDS)
      }
    }
  })

  const apiError = registerUser.error ? toApiError(registerUser.error) : null
  const showBanner =
    apiError && !apiError.is('EMAIL_ALREADY_EXISTS') && !apiError.is('NIF_ALREADY_EXISTS')

  return (
    <View style={styles.form}>
      {showBanner && <InlineAlert tone="danger">{getErrorMessage(apiError)}</InlineAlert>}

      <Controller
        control={form.control}
        name="role"
        render={({ field, fieldState }) => (
          <RoleSelector
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <FormTextField
        control={form.control}
        name="fullName"
        label="Nome completo"
        icon="person-outline"
        autoComplete="name"
        textContentType="name"
        autoCapitalize="words"
      />
      <FormTextField
        control={form.control}
        name="nif"
        label="NIF"
        icon="card-outline"
        hint="9 a 14 letras ou dígitos."
        autoCapitalize="characters"
        autoCorrect={false}
      />
      <FormTextField
        control={form.control}
        name="email"
        label="E-mail"
        icon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
      />
      <FormTextField
        control={form.control}
        name="password"
        label="Senha"
        icon="lock-closed-outline"
        password
        hint="Mínimo 8 caracteres, com letras e números."
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <FormTextField
        control={form.control}
        name="confirmPassword"
        label="Confirmar senha"
        icon="lock-closed-outline"
        password
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Button
        title="Criar conta"
        icon="person-add-outline"
        loading={form.formState.isSubmitting || registerUser.isPending}
        onPress={() => void onSubmit()}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
})
