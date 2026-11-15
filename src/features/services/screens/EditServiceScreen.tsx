import { router, useLocalSearchParams } from 'expo-router'
import { Screen } from '@/shared/ui/Screen'
import { ErrorState, LoadingState } from '@/shared/ui/StateViews'
import { toast } from '@/shared/ui/toast'
import { ServiceForm } from '../components/ServiceForm'
import { useService, useUpdateService } from '../hooks'

export function EditServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const query = useService(id)
  const update = useUpdateService()

  if (query.isPending) return <LoadingState />
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />

  return (
    <Screen scroll>
      <ServiceForm
        // A key garante valores iniciais frescos se o serviço mudar.
        key={query.data.updatedAt}
        service={query.data}
        submitLabel="Guardar alterações"
        onCancel={() => router.back()}
        onSubmit={async (payload) => {
          await update.mutateAsync({ id: query.data.id, payload })
          toast.success('Serviço atualizado.')
          router.back()
        }}
      />
    </Screen>
  )
}
