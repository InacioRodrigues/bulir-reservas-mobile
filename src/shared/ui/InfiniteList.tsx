import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query'
import type { ReactElement, ReactNode } from 'react'
import { FlatList, RefreshControl, StyleSheet, type ListRenderItem } from 'react-native'
import { flattenPages } from '@/shared/api/infinite'
import type { Paginated } from '@/shared/contract/types'
import { CONTENT_MAX_WIDTH, spacing, useTheme } from '@/shared/theme/theme'
import { ErrorState, ListFooter, LoadingState } from './StateViews'

interface InfiniteListProps<T extends { id: string }> {
  query: UseInfiniteQueryResult<InfiniteData<Paginated<T>>>
  renderItem: ListRenderItem<T>
  empty: ReactElement
  header?: ReactNode
  testID?: string
}

/**
 * FlatList ligada a uma infinite query do TanStack Query:
 *  - scroll infinito (`onEndReached` → `fetchNextPage`), só se houver página seguinte;
 *  - "puxar para atualizar" (RefreshControl → `refetch`);
 *  - estados de carregamento, erro (com repetir) e vazio.
 * A FlatList virtualiza: só monta os itens visíveis, mesmo com centenas de reservas.
 */
export function InfiniteList<T extends { id: string }>({
  query,
  renderItem,
  empty,
  header,
  testID,
}: InfiniteListProps<T>) {
  const { colors } = useTheme()
  const items = flattenPages(query.data)

  // O header (ex.: pesquisa) fica sempre montado: o campo não perde o foco enquanto carrega.
  const emptyContent = query.isPending ? (
    <LoadingState />
  ) : query.isError ? (
    <ErrorState error={query.error} onRetry={() => void query.refetch()} />
  ) : (
    empty
  )

  return (
    <FlatList
      testID={testID}
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={header ? <>{header}</> : undefined}
      ListEmptyComponent={emptyContent}
      ListFooterComponent={<ListFooter loading={query.isFetchingNextPage} />}
      contentContainerStyle={styles.content}
      onEndReached={() => {
        if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage()
      }}
      onEndReachedThreshold={0.4}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching && !query.isFetchingNextPage}
          onRefresh={() => void query.refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    />
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.lg,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
})
