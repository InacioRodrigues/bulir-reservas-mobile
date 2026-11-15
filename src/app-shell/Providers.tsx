import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { queryClient as defaultQueryClient } from '@/shared/api/query-client'
import { palettes, useTheme } from '@/shared/theme/theme'

/** Tema da navegação (headers, tab bar) alinhado com os tokens da app. */
function NavigationTheme({ children }: { children: ReactNode }) {
  const { isDark } = useTheme()
  const base = isDark ? DarkTheme : DefaultTheme
  const colors = isDark ? palettes.dark : palettes.light
  return (
    <ThemeProvider
      value={{
        ...base,
        colors: {
          ...base.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.danger,
        },
      }}
    >
      {children}
    </ThemeProvider>
  )
}

export function Providers({
  children,
  queryClient = defaultQueryClient,
}: {
  children: ReactNode
  queryClient?: QueryClient
}) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationTheme>{children}</NavigationTheme>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
