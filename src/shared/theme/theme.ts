import { useColorScheme } from 'react-native'

/**
 * Tokens de design (cores, espaçamentos, raios, tipografia). Mesma identidade da app web:
 * verde-azulado (teal) como cor primária, azul-marinho no texto, modo claro e escuro
 * segundo a preferência do sistema.
 */
const light = {
  background: '#F6F8F8',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F2',
  border: '#DCE3E3',
  text: '#0F1D3A',
  textMuted: '#5B6573',
  primary: '#0F766E',
  primaryPressed: '#0B5F58',
  primarySoft: '#DDF3F0',
  onPrimary: '#FFFFFF',
  danger: '#C2312A',
  dangerSoft: '#FCE8E6',
  success: '#15803D',
  successSoft: '#DCF5E3',
  warning: '#A15C07',
  warningSoft: '#FDF1D9',
  overlay: 'rgba(15, 29, 58, 0.45)',
}

const dark: typeof light = {
  background: '#0B1220',
  surface: '#131C2E',
  surfaceMuted: '#1B2539',
  border: '#27324A',
  text: '#E8EDF5',
  textMuted: '#9AA6B8',
  primary: '#5EEAD4',
  primaryPressed: '#2DD4BF',
  primarySoft: '#123A39',
  onPrimary: '#0F1D3A',
  danger: '#F87171',
  dangerSoft: '#3A1719',
  success: '#4ADE80',
  successSoft: '#11331F',
  warning: '#FBBF24',
  warningSoft: '#3A2B0B',
  overlay: 'rgba(0, 0, 0, 0.6)',
}

export type ThemeColors = typeof light
export const palettes = { light, dark } as const

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const
export const fontSize = { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28 } as const

/** Largura máxima do conteúdo: em tablets/landscape o conteúdo não estica de ponta a ponta. */
export const CONTENT_MAX_WIDTH = 720

/** Alvo de toque mínimo recomendado (Apple HIG 44pt, Material 48dp). */
export const MIN_TOUCH = 48

export function useTheme() {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  return { colors: isDark ? dark : light, isDark }
}
