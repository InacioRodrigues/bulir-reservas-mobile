import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import type { Service } from '@/shared/contract/types'
import { formatKz } from '@/shared/lib/money'
import { spacing } from '@/shared/theme/theme'
import { AppText } from '@/shared/ui/AppText'
import { Card } from '@/shared/ui/Card'
import { MoneyText } from '@/shared/ui/MoneyText'

interface ServiceCardProps {
  service: Service
  /** Mostra quem presta o serviço (catálogo do cliente). */
  showProvider?: boolean
  onPress?: () => void
  /** Botões no fundo do cartão (editar/excluir do prestador). */
  actions?: ReactNode
}

/** Cartão de serviço usado no catálogo (cliente) e em "Meus serviços" (prestador). */
export function ServiceCard({ service, showProvider = false, onPress, actions }: ServiceCardProps) {
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${service.name}, ${formatKz(service.price)}${showProvider ? `, por ${service.provider.fullName}` : ''}`}
      accessibilityHint={onPress ? 'Abre o detalhe do serviço' : undefined}
    >
      <View style={styles.header}>
        <AppText variant="subheading" style={styles.title} numberOfLines={2}>
          {service.name}
        </AppText>
        <MoneyText value={service.price} tone="primary" />
      </View>
      {showProvider && (
        <AppText variant="caption" tone="muted">
          por {service.provider.fullName}
        </AppText>
      )}
      <AppText tone="muted" numberOfLines={3}>
        {service.description}
      </AppText>
      {actions && <View style={styles.actions}>{actions}</View>}
    </Card>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  title: { flex: 1 },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
})
