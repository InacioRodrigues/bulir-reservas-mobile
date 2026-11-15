import type { Money } from '@/shared/contract/types'
import { formatKz } from '@/shared/lib/money'
import { AppText, type AppTextProps } from './AppText'

interface MoneyTextProps extends Omit<AppTextProps, 'children'> {
  value: Money
  /** Mostra "+" nos créditos e pinta créditos/débitos (movimentos da carteira). */
  signed?: boolean
}

/** Valor em Kwanzas formatado a partir da string exata da API (nunca de um number). */
export function MoneyText({ value, signed = false, tone, ...props }: MoneyTextProps) {
  const autoTone = signed ? (value.startsWith('-') ? 'danger' : 'success') : undefined
  return (
    <AppText weight="bold" tone={tone ?? autoTone} {...props}>
      {formatKz(value, { signed })}
    </AppText>
  )
}
