import { Pressable, StyleSheet, Text, View } from 'react-native'
import { P, Page } from '../components/Prose.tsx'
import { PER_DAY_CHOICES, usePrefs } from '../lib/prefs.tsx'
import { MAX_DAYS } from '../lib/rotation.ts'
import { serif, TEXT_SIZES, useColors } from '../lib/theme.ts'

function Segments<T extends string | number>({ items, value, onChange, label }: {
  items: { value: T; label: string; size?: number }[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  const c = useColors()
  return (
    <View style={[st.segments, { borderColor: c.line }]} accessibilityLabel={label}>
      {items.map((s) => {
        const selected = value === s.value
        return (
          <Pressable
            key={String(s.value)}
            onPress={() => onChange(s.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[st.segment, { backgroundColor: selected ? c.accent : 'transparent' }]}>
            <Text style={{ color: selected ? c.bg : c.ink, fontSize: s.size ?? 15, fontWeight: '600' }}>{s.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export default function Settings() {
  const c = useColors()
  const [prefs, update] = usePrefs()
  const scale = TEXT_SIZES[prefs.textSize]?.scale ?? 1
  return (
    <Page>
      <P muted>These settings stay on this device. Light and dark follow the setting of your device.</P>

      <Text style={[st.heading, { color: c.ink }]} accessibilityRole="header">
        Text size
      </Text>
      <Segments
        label="Text size"
        items={TEXT_SIZES.map((s, i) => ({ value: i, label: s.label, size: 14 * s.scale }))}
        value={prefs.textSize}
        onChange={(i) => update({ textSize: i })}
      />
      <Text style={[st.sample, { color: c.ink, fontSize: 18 * scale, lineHeight: 18 * scale * 1.5 }]}>
        Unto thee, O Lord, do we lift up our souls.{' '}
        <Text style={{ color: c.accent, fontSize: 14 * scale, fontWeight: '600', fontFamily: undefined }}>Ps 25:1</Text>
      </Text>

      <Text style={[st.heading, { color: c.ink }]} accessibilityRole="header">
        Heads each day
      </Text>
      <Segments
        label="Heads of each part each day"
        items={PER_DAY_CHOICES.map((n) => ({ value: n, label: String(n) }))}
        value={prefs.perDay}
        onChange={(n) => update({ perDay: n })}
      />
      <P muted>
        The guided prayer shows this number of heads from each part each day. The next day shows the next heads. A long part
        shows more heads, so that you pray each part through in {MAX_DAYS} days or fewer.
      </P>
    </Page>
  )
}

const st = StyleSheet.create({
  heading: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 10 },
  segments: { flexDirection: 'row', borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  sample: { fontFamily: serif.regular, marginTop: 14, marginBottom: 4 },
})
