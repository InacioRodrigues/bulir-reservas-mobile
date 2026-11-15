import type { InfiniteData } from '@tanstack/react-query'
import type { Paginated } from '@/shared/contract/types'

/** Próxima página a pedir, ou undefined quando já chegámos ao fim (pára o onEndReached). */
export function nextPageParam<T>(lastPage: Paginated<T>): number | undefined {
  const { page, totalPages } = lastPage.meta
  return page < totalPages ? page + 1 : undefined
}

/** Junta as páginas carregadas numa só lista para a FlatList. */
export function flattenPages<T>(data: InfiniteData<Paginated<T>> | undefined): T[] {
  return data?.pages.flatMap((page) => page.items) ?? []
}

/** Total no servidor (meta da primeira página). */
export function totalOf<T>(data: InfiniteData<Paginated<T>> | undefined): number | undefined {
  return data?.pages[0]?.meta.total
}
