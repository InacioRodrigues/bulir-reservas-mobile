import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { Providers } from '@/app-shell/Providers'
import { startAppFocusSync } from '@/shared/api/query-client'
import { messageForCode } from '@/shared/api/errors'
import { onSessionExpired, restoreSession, useSessionStore } from '@/shared/session/session-store'
import { ToastHost, toast } from '@/shared/ui/toast'

// Ecrã de recurso se um ecrã rebentar durante o render.
export { AppErrorBoundary as ErrorBoundary } from '@/app-shell/AppErrorBoundary'

// O splash nativo fica visível até sabermos se há sessão guardada (sem "flash" do login).
void SplashScreen.preventAutoHideAsync()

/**
 * Layout raiz: providers + guards de rota por estado de sessão e papel.
 *
 * `Stack.Protected` (Expo Router) remove do navegador os ecrãs cujo guard é falso: se a
 * sessão terminar, o utilizador é levado para um ecrã permitido (o index, que decide para
 * onde ir), e um cliente nunca consegue abrir as rotas do prestador nem o contrário.
 * É proteção de UX: a autorização verdadeira está na API (403 FORBIDDEN).
 */
export default function RootLayout() {
  const status = useSessionStore((state) => state.status)
  const role = useSessionStore((state) => state.user?.role)
  const isAuthenticated = status === 'authenticated'

  useEffect(() => {
    void restoreSession()
    const stopFocusSync = startAppFocusSync()
    const stopExpiredListener = onSessionExpired(() =>
      toast.error(messageForCode('SESSION_EXPIRED')),
    )
    return () => {
      stopFocusSync()
      stopExpiredListener()
    }
  }, [])

  useEffect(() => {
    if (status !== 'restoring') void SplashScreen.hideAsync()
  }, [status])

  return (
    <Providers>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />

        <Stack.Protected guard={status === 'anonymous'}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />

          <Stack.Protected guard={role === 'CLIENT'}>
            <Stack.Screen name="service/[id]" options={{ title: 'Detalhe do serviço' }} />
            <Stack.Screen
              name="top-up"
              options={{ title: 'Carregar saldo', presentation: 'modal' }}
            />
          </Stack.Protected>

          <Stack.Protected guard={role === 'PROVIDER'}>
            <Stack.Screen name="edit-service/[id]" options={{ title: 'Editar serviço' }} />
          </Stack.Protected>
        </Stack.Protected>
      </Stack>
      <ToastHost />
    </Providers>
  )
}
