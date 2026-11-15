import { focusManager, QueryClient } from '@tanstack/react-query'
import { AppState, Platform, type AppStateStatus } from 'react-native'
import { toApiError } from './errors'

/**
 * Estado do SERVIDOR (serviços, reservas, saldo) vive aqui, não em stores globais.
 * - Não repetimos erros 4xx (são determinísticos: repetir só gasta rate limit).
 * - Repetimos até 2x erros de rede/5xx.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          const { status } = toApiError(error)
          if (status >= 400 && status < 500) return false
          return failureCount < 2
        },
      },
      mutations: { retry: false },
    },
  })
}

export const queryClient = createQueryClient()

/**
 * Em React Native não há "window focus": dizemos ao TanStack Query que a app ganhou foco
 * quando volta ao primeiro plano (AppState 'active'), para refazer as queries desatualizadas
 * (ex.: o saldo do prestador depois de um cliente o contratar).
 */
export function startAppFocusSync() {
  if (Platform.OS === 'web') return () => {}
  const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
    focusManager.setFocused(status === 'active')
  })
  return () => subscription.remove()
}
