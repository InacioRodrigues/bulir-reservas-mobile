import Ionicons from '@expo/vector-icons/Ionicons'
import type { ComponentProps } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native'
import { haptics } from '@/shared/lib/haptics'
import { fontSize, MIN_TOUCH, radius, spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from './AppText'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type IconName = ComponentProps<typeof Ionicons>['name']

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string
  variant?: Variant
  icon?: IconName
  loading?: boolean
  size?: 'md' | 'sm'
  fullWidth?: boolean
}

export function Button({
  title,
  variant = 'primary',
  icon,
  loading = false,
  disabled,
  size = 'md',
  fullWidth = false,
  onPress,
  ...props
}: ButtonProps) {
  const { colors } = useTheme()
  const isDisabled = disabled || loading

  const palette = {
    primary: {
      bg: colors.primary,
      pressed: colors.primaryPressed,
      fg: colors.onPrimary,
      border: colors.primary,
    },
    secondary: {
      bg: colors.primarySoft,
      pressed: colors.border,
      fg: colors.primary,
      border: colors.primarySoft,
    },
    outline: {
      bg: 'transparent',
      pressed: colors.surfaceMuted,
      fg: colors.text,
      border: colors.border,
    },
    ghost: {
      bg: 'transparent',
      pressed: colors.surfaceMuted,
      fg: colors.primary,
      border: 'transparent',
    },
    danger: { bg: colors.danger, pressed: colors.danger, fg: '#FFFFFF', border: colors.danger },
  }[variant]

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={props.accessibilityLabel ?? title}
      disabled={isDisabled}
      onPress={(event) => {
        haptics.tap()
        onPress?.(event)
      }}
      hitSlop={size === 'sm' ? 6 : undefined}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: pressed ? palette.pressed : palette.bg,
          borderColor: palette.border,
          opacity: isDisabled ? 0.55 : 1,
        },
      ]}
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={palette.fg} />
        ) : (
          icon && <Ionicons name={icon} size={size === 'sm' ? 16 : 20} color={palette.fg} />
        )}
        <AppText
          style={{ color: palette.fg, fontSize: size === 'sm' ? fontSize.sm : fontSize.md }}
          weight="medium"
          numberOfLines={1}
        >
          {title}
        </AppText>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  md: { minHeight: MIN_TOUCH, paddingHorizontal: spacing.lg },
  sm: { minHeight: 36, paddingHorizontal: spacing.md },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
})
