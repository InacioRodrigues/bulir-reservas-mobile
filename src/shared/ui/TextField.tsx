import Ionicons from '@expo/vector-icons/Ionicons'
import { useState, type ComponentRef, type Ref } from 'react'
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native'
import { fontSize, MIN_TOUCH, radius, spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from './AppText'
import type { IconName } from './Button'

export interface TextFieldProps extends TextInputProps {
  label: string
  error?: string
  hint?: string
  icon?: IconName
  /** Campo de senha com botão "mostrar/ocultar". */
  password?: boolean
  /** Texto fixo à direita (ex.: "Kz"). */
  suffix?: string
  ref?: Ref<ComponentRef<typeof TextInput>>
}

/**
 * Campo de texto com rótulo, ajuda e erro. Acessibilidade: o rótulo é o accessibilityLabel
 * e o erro/ajuda entram no accessibilityHint, por isso o leitor de ecrã lê tudo junto.
 */
export function TextField({
  label,
  error,
  hint,
  icon,
  password = false,
  suffix,
  style,
  multiline,
  onFocus,
  onBlur,
  ref,
  ...props
}: TextFieldProps) {
  const { colors } = useTheme()
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(true)
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border

  return (
    <View style={styles.wrapper}>
      <AppText variant="label">{label}</AppText>
      <View
        style={[
          styles.box,
          multiline && styles.multilineBox,
          { borderColor, backgroundColor: colors.surface },
          focused && { borderWidth: 2 },
        ]}
      >
        {icon && <Ionicons name={icon} size={20} color={colors.textMuted} />}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          aria-invalid={Boolean(error)}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={password && hidden}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          maxFontSizeMultiplier={1.6}
          onFocus={(event) => {
            setFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setFocused(false)
            onBlur?.(event)
          }}
          style={[styles.input, multiline && styles.multilineInput, { color: colors.text }, style]}
          {...props}
        />
        {suffix && (
          <AppText tone="muted" weight="medium">
            {suffix}
          </AppText>
        )}
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
            onPress={() => setHidden((value) => !value)}
            hitSlop={12}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>
      {error ? (
        <View style={styles.message} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          <AppText variant="caption" tone="danger" style={styles.messageText}>
            {error}
          </AppText>
        </View>
      ) : hint ? (
        <AppText variant="caption" tone="muted">
          {hint}
        </AppText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs + 2 },
  box: {
    minHeight: MIN_TOUCH,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  multilineBox: { alignItems: 'flex-start', paddingVertical: spacing.sm },
  input: { flex: 1, fontSize: fontSize.md, paddingVertical: spacing.sm, minHeight: 44 },
  multilineInput: { minHeight: 110 },
  message: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  messageText: { flex: 1 },
})
