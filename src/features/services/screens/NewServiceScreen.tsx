import { router } from 'expo-router'
import { AppText } from '@/shared/ui/AppText'
import { Screen } from '@/shared/ui/Screen'
import { toast } from '@/shared/ui/toast'
import { ServiceForm } from '../components/ServiceForm'
import { useCreateService } from '../hooks'
import type { ServicePayload } from '../api'

export function NewServiceScreen() {
  const create = useCreateService()
  return (
    <Screen scroll>
      <AppText tone="muted">Os clientes vão ver o nome, a descrição e o preço no catálogo.</AppText>
      <ServiceForm
        submitLabel="Publicar serviço"
        onSubmit={async (payload) => {
          const service = await create.mutateAsync(payload as ServicePayload)
          toast.success(`"${service.name}" publicado.`)
          router.navigate('/services')
        }}
      />
    </Screen>
  )
}
