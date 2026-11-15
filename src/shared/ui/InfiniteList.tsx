import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query'
import type { ReactElement, ReactNode } from 'react'
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
  type ListRenderItem,
} from 'react-native'
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
  /** Em ecrãs largos (tablet/landscape) mostra os itens em 2 colunas. */
  responsiveColumns?: boolean
}

/**
 * FlatList ligada a uma infinite query do TanStack Query:
 *  - scroll infinito (`onEndReached` → `fetchNextPage`), só se houver página seguinte;
 *  - "puxar para atualizar" (RefreshControl → `refetch`);
 *  - estados de carregamento, erro (com repetir) e vazio.
 * A FlatList virtualiza: só monta os itens visíveis, mesmo com centenas de reservas.
 */
const WIDE_BREAKPOINT = 768
const WIDE_MAX_WIDTH = 1100

export function InfiniteList<T extends { id: string }>({
  query,
  renderItem,
  empty,
  header,
  testID,
  responsiveColumns = false,
}: InfiniteListProps<T>) {
  const { colors } = useTheme()
  const { width } = useWindowDimensions()
  const columns = responsiveColumns && width >= WIDE_BREAKPOINT ? 2 : 1
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
      // Mudar o nº de colunas exige uma FlatList nova (limitação do RN): a key força-o.
      key={columns}
      numColumns={columns}
      columnWrapperStyle={columns > 1 ? styles.row : undefined}
      renderItem={
        columns > 1 ? (info) => <View style={styles.cell}>{renderItem(info)}</View> : renderItem
      }
      ListHeaderComponent={header ? <>{header}</> : undefined}
      ListEmptyComponent={emptyContent}
      ListFooterComponent={<ListFooter loading={query.isFetchingNextPage} />}
      contentContainerStyle={[styles.content, columns > 1 && { maxWidth: WIDE_MAX_WIDTH }]}
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
  row: { gap: spacing.md },
  // Um item sozinho na última linha não estica a largura toda.
  cell: { flex: 1, maxWidth: '49.5%' },
})
