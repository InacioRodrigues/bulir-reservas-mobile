import Ionicons from '@expo/vector-icons/Ionicons'
import { useEffect, useState } from 'react'
import { AccessibilityInfo, Animated, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { create } from 'zustand'
import { haptics } from '@/shared/lib/haptics'
import { CONTENT_MAX_WIDTH, radius, spacing, useTheme } from '@/shared/theme/theme'
import { AppText } from './AppText'

/**
 * Toasts leves (sem dependência extra): uma store Zustand com a fila e um <ToastHost/> no
 * layout raiz. Pode ser chamado fora de componentes, ex.: no aviso de sessão expirada.
 */
type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

interface ToastState {
  items: ToastItem[]
  show: (type: ToastType, message: string) => void
  dismiss: (id: number) => void
}

let nextId = 1
const DURATION_MS = 3500

export const useToastStore = create<ToastState>()((set) => ({
  items: [],
  show: (type, message) => {
    const id = nextId++
    set((state) => ({ items: [...state.items.slice(-2), { id, type, message }] }))
    setTimeout(
      () => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      DURATION_MS,
    )
  },
  dismiss: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}))

export const toast = {
  success: (message: string) => {
    haptics.success()
    useToastStore.getState().show('success', message)
  },
  error: (message: string) => {
    haptics.error()
    useToastStore.getState().show('error', message)
  },
  info: (message: string) => useToastStore.getState().show('info', message),
}

function ToastView({ item }: { item: ToastItem }) {
  const { colors } = useTheme()
  const [opacity] = useState(() => new Animated.Value(0))
  const dismiss = useToastStore((state) => state.dismiss)

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start()
    // Leitores de ecrã anunciam o toast mesmo sem foco.
    AccessibilityInfo.announceForAccessibility(item.message)
  }, [opacity, item.message])

  const tone = {
    success: { icon: 'checkmark-circle' as const, color: colors.success },
    error: { icon: 'alert-circle' as const, color: colors.danger },
    info: { icon: 'information-circle' as const, color: colors.primary },
  }[item.type]

  return (
    <Animated.View
      style={{
        opacity,
        transform: [
          { translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) },
        ],
      }}
    >
      <Pressable
        accessibilityRole="alert"
        accessibilityHint="Toque para fechar"
        onPress={() => dismiss(item.id)}
        style={[
          styles.toast,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderLeftColor: tone.color,
          },
        ]}
      >
        <Ionicons name={tone.icon} size={22} color={tone.color} />
        <AppText style={styles.message}>{item.message}</AppText>
      </Pressable>
    </Animated.View>
  )
}

export function ToastHost() {
  const items = useToastStore((state) => state.items)
  const insets = useSafeAreaInsets()
  if (items.length === 0) return null
  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + spacing.sm }]}>
      {items.map((item) => (
        <ToastView key={item.id} item={item} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'stretch',
    gap: spacing.sm,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  message: { flex: 1 },
})
