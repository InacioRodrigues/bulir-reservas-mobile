import { Redirect } from 'expo-router'
import { homeHrefFor } from '@/features/auth/roles'
import { useSessionStore } from '@/shared/session/session-store'
import { LoadingState } from '@/shared/ui/StateViews'

/** Ponto de entrada: decide o ecrã inicial conforme a sessão e o papel. */
export default function Index() {
  const status = useSessionStore((state) => state.status)
  const role = useSessionStore((state) => state.user?.role)

  if (status === 'restoring') return <LoadingState label="A abrir…" />
  if (status === 'anonymous' || !role) return <Redirect href="/login" />
  return <Redirect href={homeHrefFor(role)} />
}
