import type { ReactNode } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { useSafeAreaInsets, type Edge } from 'react-native-safe-area-context'
import { CONTENT_MAX_WIDTH, spacing, useTheme } from '@/shared/theme/theme'

interface ScreenProps {
  children: ReactNode
  /** Conteúdo em ScrollView (formulários, detalhes). Listas usam FlatList próprias. */
  scroll?: boolean
  /** Margens de segurança a respeitar (o header/tab bar já tratam das restantes). */
  edges?: Edge[]
  contentStyle?: StyleProp<ViewStyle>
  footer?: ReactNode
}

/**
 * Contentor base dos ecrãs:
 *  - safe areas (notch, barra de gestos) via react-native-safe-area-context;
 *  - KeyboardAvoidingView para o teclado não tapar os campos (iOS precisa de "padding";
 *    no Android o `softwareKeyboardLayoutMode: resize` do app.json já redimensiona a janela);
 *  - largura máxima centrada em tablets/landscape.
 */
export function Screen({
  children,
  scroll = false,
  edges = [],
  contentStyle,
  footer,
}: ScreenProps) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const padding = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
  }
  const inner = <View style={[styles.content, contentStyle]}>{children}</View>

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }, padding]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
      {footer && (
        <View
          style={[styles.footer, { borderColor: colors.border, backgroundColor: colors.surface }]}
        >
          {footer}
        </View>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    alignItems: 'center',
  },
})
