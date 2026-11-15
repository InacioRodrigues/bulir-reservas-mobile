import type { ServiceSort } from '@/shared/contract/types'

export const SORT_OPTIONS: { value: ServiceSort; label: string }[] = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Mais baratos' },
  { value: 'price_desc', label: 'Mais caros' },
  { value: 'name_asc', label: 'Nome (A–Z)' },
]
