import { StyleSheet, View } from 'react-native'
import { initials } from '@/shared/lib/strings'
import { useTheme } from '@/shared/theme/theme'
import { AppText } from './AppText'

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const { colors } = useTheme()
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primarySoft },
      ]}
    >
      <AppText weight="bold" tone="primary" style={{ fontSize: size * 0.38 }}>
        {initials(name)}
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
})
