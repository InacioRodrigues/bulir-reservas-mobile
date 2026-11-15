import { StyleSheet, View } from 'react-native'
import { AppText } from './AppText'

/** Marca da app (mesma identidade da web): quadrado teal com "B" azul-marinho. */
export function Logo({ size = 56, showName = true }: { size?: number; showName?: boolean }) {
  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Bulir Reservas"
    >
      <View style={[styles.mark, { width: size, height: size, borderRadius: size * 0.26 }]}>
        <AppText style={[styles.letter, { fontSize: size * 0.58 }]}>B</AppText>
      </View>
      {showName && (
        <AppText variant="subheading" style={{ fontSize: 22 }}>
          Bulir{' '}
          <AppText variant="subheading" weight="regular" tone="muted">
            Reservas
          </AppText>
        </AppText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mark: { backgroundColor: '#2DD4BF', alignItems: 'center', justifyContent: 'center' },
  letter: { color: '#0F1D3A', fontWeight: '800' },
})
