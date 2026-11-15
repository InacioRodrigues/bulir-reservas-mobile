import { Pressable, StyleSheet } from 'react-native'
import { haptics } from '@/shared/lib/haptics'
import { radius, spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from './AppText'

interface ChipProps {
  label: string
  selected?: boolean
  onPress: () => void
  accessibilityLabel?: string
}

/** Botão compacto para filtros e valores rápidos. */
export function Chip({ label, selected = false, onPress, accessibilityLabel }: ChipProps) {
  const { colors } = useTheme()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={() => {
        haptics.tap()
        onPress()
      }}
      hitSlop={4}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected
            ? colors.primary
            : pressed
              ? colors.surfaceMuted
              : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      <AppText variant="label" style={{ color: selected ? colors.onPrimary : colors.text }}>
        {label}
      </AppText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
