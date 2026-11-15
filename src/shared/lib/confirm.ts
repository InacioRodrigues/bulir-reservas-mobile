import { Alert, Platform } from 'react-native'

/**
 * Pede confirmação antes de uma ação irreversível (excluir, cancelar, terminar sessão).
 * Nativo: Alert do sistema (botão destrutivo a vermelho no iOS). Web (só validação):
 * o Alert do React Native Web não mostra botões, por isso usamos window.confirm.
 */
export function confirmAction(options: {
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
}) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${options.title}\n\n${options.message}`)) options.onConfirm()
    return
  }
  Alert.alert(options.title, options.message, [
    { text: options.cancelLabel ?? 'Voltar', style: 'cancel' },
    {
      text: options.confirmLabel,
      style: options.destructive ? 'destructive' : 'default',
      onPress: options.onConfirm,
    },
  ])
}
