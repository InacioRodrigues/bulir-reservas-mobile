/**
 * Configuração lida das variáveis EXPO_PUBLIC_* (o Metro substitui-as no bundle em build time,
 * por isso têm de ser lidas com o nome literal `process.env.EXPO_PUBLIC_...`).
 *
 * Atenção: num telemóvel físico `localhost` é o próprio telemóvel. Use o IP da máquina na rede
 * local (ex.: http://192.168.1.20:3000), 10.0.2.2 no emulador Android, ou a API em produção.
 */
const DEFAULT_API_URL = 'http://localhost:3000'

function readApiUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL
  if (!raw) {
    console.warn(
      `EXPO_PUBLIC_API_URL não está definida (copie .env.example para .env). A usar ${DEFAULT_API_URL}.`,
    )
    return DEFAULT_API_URL
  }
  return raw.replace(/\/+$/, '')
}

const apiUrl = readApiUrl()

export const env = {
  apiUrl,
  apiBaseUrl: `${apiUrl}/api/v1`,
  /** Mostra atalhos para as contas de demonstração (seed) no ecrã de login. */
  showDemoAccounts: process.env.EXPO_PUBLIC_DEMO_ACCOUNTS !== 'false',
} as const
