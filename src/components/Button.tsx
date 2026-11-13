import { Pressable, StyleSheet, Text } from 'react-native'
import { useColors } from '../lib/theme.ts'

/** A large button. The primary button is filled with the accent colour. */
export function Button({ label, onPress, primary, flex }: { label: string; onPress: () => void; primary?: boolean; flex?: boolean }) {
  const c = useColors()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        st.button,
        flex && st.flex,
        { borderColor: c.accent, backgroundColor: primary ? c.accent : 'transparent', opacity: pressed ? 0.75 : 1 },
      ]}>
      <Text style={[st.text, { color: primary ? c.bg : c.accent }]}>{label}</Text>
    </Pressable>
  )
}

const st = StyleSheet.create({
  button: { borderWidth: 1, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center' },
  flex: { flex: 1 },
  text: { fontSize: 17, fontWeight: '600' },
})
