import { StyleSheet, Text, type TextProps } from 'react-native'
import { fontSize, useTheme, type ThemeColors } from '@/shared/theme/theme'

type Variant = 'title' | 'heading' | 'subheading' | 'body' | 'label' | 'caption'
type Tone = 'default' | 'muted' | 'primary' | 'danger' | 'success' | 'warning' | 'onPrimary'

const toneColor = (colors: ThemeColors, tone: Tone) =>
  ({
    default: colors.text,
    muted: colors.textMuted,
    primary: colors.primary,
    danger: colors.danger,
    success: colors.success,
    warning: colors.warning,
    onPrimary: colors.onPrimary,
  })[tone]

export interface AppTextProps extends TextProps {
  variant?: Variant
  tone?: Tone
  weight?: 'regular' | 'medium' | 'bold'
  align?: 'left' | 'center' | 'right'
}

/** Texto com a tipografia do tema. Respeita o tamanho de letra do sistema (allowFontScaling). */
export function AppText({
  variant = 'body',
  tone = 'default',
  weight,
  align,
  style,
  ...props
}: AppTextProps) {
  const { colors } = useTheme()
  return (
    <Text
      maxFontSizeMultiplier={1.6}
      {...props}
      accessibilityRole={
        props.accessibilityRole ??
        (variant === 'title' || variant === 'heading' ? 'header' : undefined)
      }
      style={[
        styles[variant],
        { color: toneColor(colors, tone) },
        weight && styles[weight],
        align && { textAlign: align },
        style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xxl, fontWeight: '700', letterSpacing: -0.4 },
  heading: { fontSize: fontSize.xl, fontWeight: '700', letterSpacing: -0.2 },
  subheading: { fontSize: fontSize.lg, fontWeight: '600' },
  body: { fontSize: fontSize.md, lineHeight: 22 },
  label: { fontSize: fontSize.sm, fontWeight: '600' },
  caption: { fontSize: fontSize.xs, lineHeight: 16 },
  regular: { fontWeight: '400' },
  medium: { fontWeight: '600' },
  bold: { fontWeight: '700' },
})
