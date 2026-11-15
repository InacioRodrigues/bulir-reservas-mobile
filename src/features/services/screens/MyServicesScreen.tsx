import { router } from 'expo-router'
import { View } from 'react-native'
import { getErrorMessage } from '@/shared/api/errors'
import { totalOf } from '@/shared/api/infinite'
import { confirmAction } from '@/shared/lib/confirm'
import { useTheme } from '@/shared/theme/theme'
import { AppText } from '@/shared/ui/AppText'
import { Button } from '@/shared/ui/Button'
import { InfiniteList } from '@/shared/ui/InfiniteList'
import { EmptyState } from '@/shared/ui/StateViews'
import { toast } from '@/shared/ui/toast'
import type { Service } from '@/shared/contract/types'
import { ServiceCard } from '../components/ServiceCard'
import { useDeleteService, useMyServices } from '../hooks'

export function MyServicesScreen() {
  const { colors } = useTheme()
  const query = useMyServices()
  const remove = useDeleteService()
  const total = totalOf(query.data)

  const confirmDelete = (service: Service) =>
    confirmAction({
      title: 'Excluir serviço?',
      message: `"${service.name}" deixa de aparecer no catálogo. As reservas já feitas continuam no histórico.`,
      confirmLabel: 'Excluir',
      destructive: true,
      onConfirm: () =>
        remove.mutate(service.id, {
          onSuccess: () => toast.success('Serviço excluído.'),
          onError: (error) => toast.error(getErrorMessage(error)),
        }),
    })

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <InfiniteList
        query={query}
        testID="my-services-list"
        responsiveColumns
        header={
          total !== undefined && total > 0 ? (
            <AppText tone="muted">
              {total === 1 ? '1 serviço publicado' : `${total} serviços publicados`}
            </AppText>
          ) : null
        }
        renderItem={({ item }) => (
          <ServiceCard
            service={item}
            actions={
              <>
                <Button
                  title="Editar"
                  icon="create-outline"
                  size="sm"
                  variant="secondary"
                  accessibilityLabel={`Editar ${item.name}`}
                  onPress={() =>
                    router.push({ pathname: '/edit-service/[id]', params: { id: item.id } })
                  }
                />
                <Button
                  title="Excluir"
                  icon="trash-outline"
                  size="sm"
                  variant="outline"
                  accessibilityLabel={`Excluir ${item.name}`}
                  loading={remove.isPending && remove.variables === item.id}
                  onPress={() => confirmDelete(item)}
                />
              </>
            }
          />
        )}
        empty={
          <EmptyState
            icon="briefcase-outline"
            title="Ainda não publicou serviços"
            description="Crie o primeiro serviço para aparecer no catálogo dos clientes."
            action={
              <Button
                title="Criar serviço"
                icon="add"
                onPress={() => router.navigate('/new-service')}
              />
            }
          />
        }
      />
    </View>
  )
}
