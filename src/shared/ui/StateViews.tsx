import Ionicons from '@expo/vector-icons/Ionicons'
import type { ReactNode } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { getErrorMessage } from '@/shared/api/errors'
import { spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from './AppText'
import { Button, type IconName } from './Button'

export function LoadingState({ label = 'A carregar…' }: { label?: string }) {
  const { colors } = useTheme()
  return (
    <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText tone="muted">{label}</AppText>
    </View>
  )
}

interface EmptyStateProps {
  icon?: IconName
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({
  icon = 'file-tray-outline',
  title,
  description,
  action,
}: EmptyStateProps) {
  const { colors } = useTheme()
  return (
    <View style={styles.center}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name={icon} size={30} color={colors.primary} />
      </View>
      <AppText variant="subheading" align="center">
        {title}
      </AppText>
      {description && (
        <AppText tone="muted" align="center">
          {description}
        </AppText>
      )}
      {action}
    </View>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { colors } = useTheme()
  return (
    <View style={styles.center} accessibilityRole="alert">
      <View style={[styles.iconCircle, { backgroundColor: colors.dangerSoft }]}>
        <Ionicons name="cloud-offline-outline" size={30} color={colors.danger} />
      </View>
      <AppText variant="subheading" align="center">
        Não foi possível carregar
      </AppText>
      <AppText tone="muted" align="center">
        {getErrorMessage(error)}
      </AppText>
      {onRetry && (
        <Button title="Tentar novamente" icon="refresh" variant="outline" onPress={onRetry} />
      )}
    </View>
  )
}

/** Rodapé das listas infinitas: indicador enquanto vem a página seguinte. */
export function ListFooter({ loading }: { loading: boolean }) {
  const { colors } = useTheme()
  if (!loading) return <View style={{ height: spacing.xl }} />
  return (
    <View style={styles.footer}>
      <ActivityIndicator color={colors.primary} accessibilityLabel="A carregar mais" />
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { paddingVertical: spacing.xl },
})
