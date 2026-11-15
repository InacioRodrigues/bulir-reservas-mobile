import { Link, type Href } from 'expo-router'
import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { spacing } from '@/shared/theme/theme'
import { AppText } from '@/shared/ui/AppText'
import { Logo } from '@/shared/ui/Logo'
import { Screen } from '@/shared/ui/Screen'

interface AuthScreenProps {
  title: string
  subtitle: string
  children: ReactNode
  footerText: string
  footerLink: { href: Href; label: string }
}

export function AuthScreen({ title, subtitle, children, footerText, footerLink }: AuthScreenProps) {
  return (
    <Screen scroll edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={styles.header}>
        <Logo size={48} />
        <View style={styles.titles}>
          <AppText variant="title">{title}</AppText>
          <AppText tone="muted">{subtitle}</AppText>
        </View>
      </View>
      {children}
      <View style={styles.footer}>
        <AppText tone="muted">{footerText} </AppText>
        <Link href={footerLink.href} replace accessibilityRole="link">
          <AppText tone="primary" weight="bold">
            {footerLink.label}
          </AppText>
        </Link>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', maxWidth: 480, paddingVertical: spacing.xxl },
  header: { gap: spacing.xl },
  titles: { gap: spacing.xs },
  footer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
})
