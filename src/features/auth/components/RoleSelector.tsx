import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable, StyleSheet, View } from 'react-native'
import type { Role } from '@/shared/contract/types'
import { haptics } from '@/shared/lib/haptics'
import { radius, spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from '@/shared/ui/AppText'

const OPTIONS = [
  {
    value: 'CLIENT',
    title: 'Cliente',
    description: 'Quero contratar serviços',
    icon: 'bag-handle-outline',
  },
  {
    value: 'PROVIDER',
    title: 'Prestador',
    description: 'Quero oferecer serviços',
    icon: 'briefcase-outline',
  },
] as const

/** Escolha do papel como dois cartões "radio" (mais claro do que um dropdown no telemóvel). */
export function RoleSelector({
  value,
  onChange,
  error,
}: {
  value: Role | undefined
  onChange: (role: Role) => void
  error?: string
}) {
  const { colors } = useTheme()
  return (
    <View style={styles.wrapper}>
      <AppText variant="label">Tipo de conta</AppText>
      <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Tipo de conta">
        {OPTIONS.map((option) => {
          const selected = value === option.value
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${option.title}: ${option.description}`}
              onPress={() => {
                haptics.tap()
                onChange(option.value)
              }}
              testID={`role-${option.value}`}
              style={[
                styles.option,
                {
                  borderColor: selected ? colors.primary : error ? colors.danger : colors.border,
                  backgroundColor: selected ? colors.primarySoft : colors.surface,
                },
                selected && { borderWidth: 2 },
              ]}
            >
              <View style={styles.optionHeader}>
                <Ionicons name={option.icon} size={22} color={colors.primary} />
                <Ionicons
                  name={selected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={selected ? colors.primary : colors.textMuted}
                />
              </View>
              <AppText weight="bold">{option.title}</AppText>
              <AppText variant="caption" tone="muted">
                {option.description}
              </AppText>
            </Pressable>
          )
        })}
      </View>
      {error && (
        <AppText variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs + 2 },
  row: { flexDirection: 'row', gap: spacing.md },
  option: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  optionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
})
