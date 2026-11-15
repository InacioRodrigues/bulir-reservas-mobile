import { formatDate, formatDateTime } from './date'

describe('date', () => {
  it('mostra a hora de Luanda (UTC+1)', () => {
    expect(formatDateTime('2026-11-15T13:30:00.000Z')).toBe('15/11/2026, 14:30')
  })

  it('muda de dia quando UTC+1 passa da meia-noite', () => {
    expect(formatDate('2026-12-31T23:30:00.000Z')).toBe('1 jan 2027')
  })
})
