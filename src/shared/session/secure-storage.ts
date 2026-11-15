import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

/**
 * Armazenamento dos tokens.
 *
 * Nativo: expo-secure-store → Keychain (iOS) e Keystore/EncryptedSharedPreferences (Android).
 * Os dados ficam cifrados pelo sistema e isolados da app; o AsyncStorage, pelo contrário,
 * é um ficheiro/SQLite em texto simples, legível num dispositivo com root/jailbreak ou num backup.
 *
 * Web (só para validação rápida com `expo start --web`): o SecureStore não existe no browser,
 * por isso recorremos ao localStorage. Não é a plataforma-alvo da app.
 */
const isWeb = Platform.OS === 'web'

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) return globalThis.localStorage?.getItem(key) ?? null
    return SecureStore.getItemAsync(key)
  },
  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) return globalThis.localStorage?.setItem(key, value)
    // Só acessível com o dispositivo desbloqueado e nunca migrado para outro aparelho via backup.
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    })
  },
  async removeItem(key: string): Promise<void> {
    if (isWeb) return globalThis.localStorage?.removeItem(key)
    await SecureStore.deleteItemAsync(key)
  },
}
