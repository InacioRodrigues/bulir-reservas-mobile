import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { nextPageParam } from '@/shared/api/infinite'
import { queryKeys } from '@/shared/api/query-keys'
import type { BookingStatus } from '@/shared/contract/types'
import { bookingsApi } from './api'

export const BOOKINGS_PER_PAGE = 15

export function useBookings(filters: { status?: BookingStatus }) {
  return useInfiniteQuery({
    queryKey: queryKeys.bookings.list(filters),
    queryFn: ({ pageParam }) =>
      bookingsApi.list({ ...filters, page: pageParam, perPage: BOOKINGS_PER_PAGE }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  })
}

/**
 * Reservar/cancelar mexe em dinheiro: NÃO fazemos atualização otimista. Esperamos pela
 * resposta da API (que faz tudo numa transação atómica) e depois invalidamos o que mudou:
 * saldo (me), reservas e movimentos da carteira. A app nunca calcula o saldo final.
 */
function useInvalidateMoneyViews() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.me }),
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all }),
    ])
}

export function useCreateBooking() {
  const invalidate = useInvalidateMoneyViews()
  return useMutation({
    mutationFn: (serviceId: string) => bookingsApi.create(serviceId),
    // Mesmo em erro (ex.: 409 saldo insuficiente) o saldo mostrado pode estar desatualizado.
    onSettled: invalidate,
  })
}

export function useCancelBooking() {
  const invalidate = useInvalidateMoneyViews()
  return useMutation({
    mutationFn: (bookingId: string) => bookingsApi.cancel(bookingId),
    onSettled: invalidate,
  })
}
