import { router, Stack } from 'expo-router'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/StateViews'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Página não encontrada' }} />
      <EmptyState
        icon="compass-outline"
        title="Este ecrã não existe"
        description="O link pode estar errado ou o conteúdo foi removido."
        action={
          <Button
            title="Ir para o início"
            icon="home-outline"
            onPress={() => router.replace('/')}
          />
        }
      />
    </>
  )
}
