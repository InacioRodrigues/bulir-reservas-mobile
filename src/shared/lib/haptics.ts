import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

/** Feedback tátil discreto (sem efeito na web). Nunca falha a ação por causa da vibração. */
const enabled = Platform.OS === 'ios' || Platform.OS === 'android'

export const haptics = {
  tap: () => enabled && void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  success: () =>
    enabled &&
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  error: () =>
    enabled &&
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}),
}
