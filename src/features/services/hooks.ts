import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { nextPageParam } from '@/shared/api/infinite'
import { queryKeys } from '@/shared/api/query-keys'
import type { ServiceListParams } from '@/shared/contract/types'
import { servicesApi, type ServicePayload } from './api'

export const SERVICES_PER_PAGE = 10

export type CatalogFilters = Omit<ServiceListParams, 'page' | 'perPage'>

/** Catálogo com scroll infinito: cada `fetchNextPage` pede a página seguinte à API. */
export function useCatalog(filters: CatalogFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.services.catalog(filters),
    queryFn: ({ pageParam }) =>
      servicesApi.catalog({ ...filters, page: pageParam, perPage: SERVICES_PER_PAGE }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  })
}

export function useMyServices() {
  return useInfiniteQuery({
    queryKey: queryKeys.services.mine,
    queryFn: ({ pageParam }) => servicesApi.mine({ page: pageParam, perPage: SERVICES_PER_PAGE }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  })
}

export function useService(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.services.detail(id ?? ''),
    queryFn: () => servicesApi.get(id as string),
    enabled: Boolean(id),
  })
}

/**
 * Depois de qualquer escrita invalidamos TODA a árvore ['services'] (minhas listas,
 * catálogo e detalhes): a cache fica coerente sem atualizações manuais propensas a erros.
 */
function useInvalidateServices() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.services.all })
}

export function useCreateService() {
  const invalidate = useInvalidateServices()
  return useMutation({
    mutationFn: (payload: ServicePayload) => servicesApi.create(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateService() {
  const invalidate = useInvalidateServices()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ServicePayload> }) =>
      servicesApi.update(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteService() {
  const invalidate = useInvalidateServices()
  return useMutation({
    mutationFn: (id: string) => servicesApi.remove(id),
    onSuccess: invalidate,
  })
}
