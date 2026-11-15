import { router } from 'expo-router'
import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useMe } from '@/features/auth/hooks'
import { totalOf } from '@/shared/api/infinite'
import { LIMITS } from '@/shared/contract/schemas'
import type { ServiceSort } from '@/shared/contract/types'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { formatKz, hasSufficientBalance, subtractMoney } from '@/shared/lib/money'
import { spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from '@/shared/ui/AppText'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Chip } from '@/shared/ui/Chip'
import { InfiniteList } from '@/shared/ui/InfiniteList'
import { EmptyState } from '@/shared/ui/StateViews'
import { TextField } from '@/shared/ui/TextField'
import { SORT_OPTIONS } from '../catalog-filters'
import { ServiceCard } from '../components/ServiceCard'
import { useCatalog } from '../hooks'

/**
 * Catálogo (só clientes): pesquisa com debounce, ordenação e scroll infinito.
 * Cada cartão já avisa se o saldo não chega, antes de o cliente abrir o serviço.
 */
export function CatalogScreen() {
  const { colors } = useTheme()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<ServiceSort>('newest')
  const debouncedSearch = useDebouncedValue(search.trim())
  const query = useCatalog({ search: debouncedSearch || undefined, sort })
  const { data: me } = useMe()
  const total = totalOf(query.data)

  const header = (
    <View style={styles.header}>
      <TextField
        label="Pesquisar serviços"
        icon="search"
        placeholder="Ex.: canalização, cabelo…"
        value={search}
        onChangeText={setSearch}
        maxLength={LIMITS.searchMax}
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="while-editing"
        testID="catalog-search"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        accessibilityLabel="Ordenar por"
      >
        {SORT_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={sort === option.value}
            accessibilityLabel={`Ordenar por ${option.label}`}
            onPress={() => setSort(option.value)}
          />
        ))}
      </ScrollView>
      {total !== undefined && (
        <AppText tone="muted" variant="caption" accessibilityLiveRegion="polite">
          {total === 1 ? '1 serviço encontrado' : `${total} serviços encontrados`}
        </AppText>
      )}
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <InfiniteList
        query={query}
        testID="catalog-list"
        responsiveColumns
        header={header}
        renderItem={({ item }) => {
          const enough = !me || hasSufficientBalance(me.balance, item.price)
          return (
            <ServiceCard
              service={item}
              showProvider
              onPress={() => router.push({ pathname: '/service/[id]', params: { id: item.id } })}
              actions={
                enough ? null : (
                  <Badge
                    tone="warning"
                    label={`Saldo insuficiente · faltam ${formatKz(subtractMoney(item.price, me.balance))}`}
                  />
                )
              }
            />
          )
        }}
        empty={
          <EmptyState
            icon="search-outline"
            title={debouncedSearch ? 'Nenhum serviço encontrado' : 'Ainda não há serviços'}
            description={
              debouncedSearch
                ? `Não há resultados para "${debouncedSearch}". Tente outras palavras.`
                : 'Volte mais tarde: os prestadores ainda não publicaram serviços.'
            }
            action={
              debouncedSearch ? (
                <Button title="Limpar pesquisa" variant="outline" onPress={() => setSearch('')} />
              ) : undefined
            }
          />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  header: { gap: spacing.md, marginBottom: spacing.xs },
  chips: { gap: spacing.sm, paddingVertical: 2 },
})
