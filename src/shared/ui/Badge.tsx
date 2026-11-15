import { StyleSheet, View } from 'react-native'
import { radius, spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from './AppText'

type Tone = 'neutral' | 'primary' | 'success' | 'danger' | 'warning'

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const { colors } = useTheme()
  const map = {
    neutral: { bg: colors.surfaceMuted, fg: colors.textMuted },
    primary: { bg: colors.primarySoft, fg: colors.primary },
    success: { bg: colors.successSoft, fg: colors.success },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
    warning: { bg: colors.warningSoft, fg: colors.warning },
  }[tone]
  return (
    <View style={[styles.badge, { backgroundColor: map.bg }]}>
      <AppText variant="caption" weight="medium" style={{ color: map.fg }}>
        {label}
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
})
