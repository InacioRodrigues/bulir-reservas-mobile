import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

/** Feedback tátil discreto (sem efeito na web). Nunca falha a ação por causa da vibração. */
const enabled = Platform.OS === 'ios' || Platform.OS === 'android'

function safely(run: () => Promise<void> | void) {
  if (!enabled) return
  try {
    void Promise.resolve(run()).catch(() => undefined)
  } catch {
    // Dispositivo sem motor de vibração: ignorar.
  }
}

export const haptics = {
  tap: () => safely(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  success: () => safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  error: () => safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
}
