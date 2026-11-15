import Ionicons from '@expo/vector-icons/Ionicons'
import { Tabs } from 'expo-router/js-tabs'
import type { ComponentProps } from 'react'
import type { ColorValue } from 'react-native'
import { BalanceChip } from '@/features/wallet/components/BalanceChip'
import { useSessionStore } from '@/shared/session/session-store'
import { useTheme } from '@/shared/theme/theme'

type IconName = ComponentProps<typeof Ionicons>['name']

function tabIcon(name: IconName, focusedName: IconName) {
  return function TabIcon({
    color,
    size,
    focused,
  }: {
    color: ColorValue
    size: number
    focused: boolean
  }) {
    return (
      <Ionicons
        name={focused ? focusedName : name}
        size={size}
        color={typeof color === 'string' ? color : undefined}
      />
    )
  }
}

/**
 * Navegação por separadores, diferente para cada papel. Os separadores de um papel são
 * removidos (Tabs.Protected) para o outro: o cliente não vê "Meus serviços" e o prestador
 * não vê o catálogo — exigência do enunciado ("só clientes veem os serviços para contratar").
 */
export default function AppTabsLayout() {
  const { colors } = useTheme()
  const role = useSessionStore((state) => state.user?.role)

  return (
    <Tabs
      screenOptions={{
        headerRight: () => <BalanceChip />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Protected guard={role === 'CLIENT'}>
        <Tabs.Screen
          name="catalog"
          options={{ title: 'Catálogo', tabBarIcon: tabIcon('search-outline', 'search') }}
        />
      </Tabs.Protected>

      <Tabs.Protected guard={role === 'PROVIDER'}>
        <Tabs.Screen
          name="services"
          options={{
            title: 'Meus serviços',
            tabBarIcon: tabIcon('briefcase-outline', 'briefcase'),
          }}
        />
        <Tabs.Screen
          name="new-service"
          options={{
            title: 'Novo serviço',
            tabBarIcon: tabIcon('add-circle-outline', 'add-circle'),
          }}
        />
      </Tabs.Protected>

      <Tabs.Screen
        name="bookings"
        options={{ title: 'Histórico', tabBarIcon: tabIcon('receipt-outline', 'receipt') }}
      />
      <Tabs.Screen
        name="wallet"
        options={{ title: 'Carteira', tabBarIcon: tabIcon('wallet-outline', 'wallet') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: tabIcon('person-circle-outline', 'person-circle') }}
      />
    </Tabs>
  )
}
