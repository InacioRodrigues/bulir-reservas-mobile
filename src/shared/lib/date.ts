import type { IsoDate } from '@/shared/contract/types'

/**
 * Datas da API vêm em UTC; mostramos na hora de Luanda (WAT = UTC+1, sem hora de verão).
 * Formatação manual pela mesma razão que o dinheiro: o suporte de `timeZone`/`pt-AO` no Intl
 * do Hermes varia entre plataformas; aqui o resultado é determinístico em todo o lado.
 */
const LUANDA_OFFSET_MS = 60 * 60 * 1000
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const pad = (value: number) => String(value).padStart(2, '0')

function luandaParts(iso: IsoDate) {
  const date = new Date(new Date(iso).getTime() + LUANDA_OFFSET_MS)
  return {
    day: date.getUTCDate(),
    month: date.getUTCMonth(),
    year: date.getUTCFullYear(),
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
  }
}

/** "15 nov 2026" */
export function formatDate(iso: IsoDate): string {
  const { day, month, year } = luandaParts(iso)
  return `${day} ${MONTHS[month]} ${year}`
}

/** "15/11/2026, 14:30" */
export function formatDateTime(iso: IsoDate): string {
  const { day, month, year, hours, minutes } = luandaParts(iso)
  return `${pad(day)}/${pad(month + 1)}/${year}, ${pad(hours)}:${pad(minutes)}`
}
