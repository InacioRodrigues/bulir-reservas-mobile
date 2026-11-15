import type { ErrorBoundaryProps } from 'expo-router'
import { View } from 'react-native'
import { useTheme } from '@/shared/theme/theme'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/StateViews'

/**
 * Ecrã de recurso quando um componente rebenta durante o render (Expo Router chama o
 * `ErrorBoundary` exportado pelo layout). Evita o ecrã branco e permite tentar de novo.
 */
export function AppErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const { colors } = useTheme()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <EmptyState
        icon="bug-outline"
        title="Algo correu mal"
        description={__DEV__ ? error.message : 'Ocorreu um erro inesperado. Tente novamente.'}
        action={<Button title="Tentar novamente" icon="refresh" onPress={() => void retry()} />}
      />
    </View>
  )
}
