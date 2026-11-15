import Ionicons from '@expo/vector-icons/Ionicons'
import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { radius, spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from './AppText'

type Tone = 'danger' | 'warning' | 'info' | 'success'

/** Mensagem destacada dentro de um ecrã (erro do formulário, aviso de saldo, etc.). */
export function InlineAlert({
  tone = 'info',
  title,
  children,
}: {
  tone?: Tone
  title?: string
  children: ReactNode
}) {
  const { colors } = useTheme()
  const map = {
    danger: { bg: colors.dangerSoft, fg: colors.danger, icon: 'alert-circle' as const },
    warning: { bg: colors.warningSoft, fg: colors.warning, icon: 'warning' as const },
    info: { bg: colors.primarySoft, fg: colors.primary, icon: 'information-circle' as const },
    success: { bg: colors.successSoft, fg: colors.success, icon: 'checkmark-circle' as const },
  }[tone]
  return (
    <View
      style={[styles.box, { backgroundColor: map.bg }]}
      accessibilityRole={tone === 'danger' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
    >
      <Ionicons name={map.icon} size={20} color={map.fg} />
      <View style={styles.text}>
        {title && (
          <AppText weight="bold" style={{ color: map.fg }}>
            {title}
          </AppText>
        )}
        {typeof children === 'string' ? (
          <AppText style={{ color: map.fg }}>{children}</AppText>
        ) : (
          children
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  text: { flex: 1, gap: 2 },
})
