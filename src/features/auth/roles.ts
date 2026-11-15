import type { Href } from 'expo-router'
import type { Role } from '@/shared/contract/types'

export const ROLE_LABEL: Record<Role, string> = {
  CLIENT: 'Cliente',
  PROVIDER: 'Prestador',
}

/** Ecrã inicial de cada papel após o login. */
export function homeHrefFor(role: Role): Href {
  return role === 'PROVIDER' ? '/services' : '/catalog'
}
