import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { nextPageParam } from '@/shared/api/infinite'
import { queryKeys } from '@/shared/api/query-keys'
import type { User } from '@/shared/contract/types'
import { walletApi } from './api'

export const TRANSACTIONS_PER_PAGE = 20

export function useTransactions() {
  return useInfiniteQuery({
    queryKey: queryKeys.wallet.transactions,
    queryFn: ({ pageParam }) =>
      walletApi.transactions({ page: pageParam, perPage: TRANSACTIONS_PER_PAGE }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  })
}

export function useTopUp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (amount: string) => walletApi.topUp(amount),
    onSuccess: ({ balance }) => {
      // A API devolve o saldo final: escrevemo-lo já na cache (valor do servidor, não calculado).
      queryClient.setQueryData<User>(queryKeys.me, (user) => (user ? { ...user, balance } : user))
      return queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all })
    },
  })
}
