import type { BookingListParams, ServiceListParams } from '@/shared/contract/types'

/**
 * Fábrica de query keys do TanStack Query. Chaves hierárquicas permitem invalidar
 * em bloco: `invalidateQueries({ queryKey: queryKeys.services.all })` apanha listas e detalhes.
 * As listas são "infinite queries" (scroll infinito), por isso a chave não inclui a página.
 */
type Filters<T> = Omit<T, 'page' | 'perPage'>

export const queryKeys = {
  me: ['auth', 'me'] as const,
  services: {
    all: ['services'] as const,
    catalog: (filters: Filters<ServiceListParams>) => ['services', 'catalog', filters] as const,
    mine: ['services', 'mine'] as const,
    detail: (id: string) => ['services', 'detail', id] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    list: (filters: Filters<BookingListParams>) => ['bookings', 'list', filters] as const,
  },
  wallet: {
    all: ['wallet'] as const,
    transactions: ['wallet', 'transactions'] as const,
  },
} as const
