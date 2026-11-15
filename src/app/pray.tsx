import { Link, router, Stack, useLocalSearchParams } from 'expo-router'
import { useMemo, useRef, type ComponentRef } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button } from '../components/Button.tsx'
import { HeadView } from '../components/HeadView.tsx'
import { P } from '../components/Prose.tsx'
import { PRAY_PARTS, prayerHeads } from '../lib/data.ts'
import { useStore } from '../lib/prefs.tsx'
import { cycleDays, dayNumber, headsForDay } from '../lib/rotation.ts'
import { serif, useColors } from '../lib/theme.ts'

/** The paragraphs of each head that the guided prayer shows before "More". */
const FIRST_PARAS = 3

export default function Pray() {
  const c = useColors()
  const { prefs, list } = useStore()
  const params = useLocalSearchParams<{ step?: string }>()
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null)
  const step = Math.min(Math.max(Number(params.step) || 1, 1), PRAY_PARTS.length + 1)
  const day = dayNumber(new Date())
  const part = PRAY_PARTS[step - 1]
  const heads = useMemo(() => {
    if (!part) return []
    const all = prayerHeads(part)
    return headsForDay(all.length, prefs.perDay, day).map((i) => all[i])
  }, [part, prefs.perDay, day])
  const go = (n: number) => {
    router.setParams({ step: String(n) })
    scroll.current?.scrollTo({ y: 0, animated: false })
  }

  if (!part) {
    return (
      <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={st.page}>
        <Stack.Screen options={{ title: 'Amen' }} />
        <Text style={[st.done, { color: c.ink }]} accessibilityRole="header">
          Amen.
        </Text>
        <P>
          Now unto the King eternal, immortal, invisible, the only wise God, be honour and glory for ever and ever. Amen.
        </P>
        <P muted>1 Timothy 1:17. Tomorrow the guided prayer gives the next heads of each part.</P>
        <View style={st.nav}>
          <Button flex label="Back" onPress={() => go(PRAY_PARTS.length)} />
          <Button flex primary label="Done" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        </View>
      </ScrollView>
    )
  }

  const total = prayerHeads(part).length
  const days = cycleDays(total, prefs.perDay)
  return (
    <ScrollView ref={scroll} style={{ backgroundColor: c.bg }} contentContainerStyle={st.page} contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen options={{ title: part.name }} />
      <View style={st.dots} accessibilityLabel={`Part ${step} of ${PRAY_PARTS.length}`}>
        {PRAY_PARTS.map((p, i) => (
          <View key={p.id} style={[st.dot, { backgroundColor: i < step ? c.accent : c.line }]} />
        ))}
      </View>
      <Text style={[st.step, { color: c.gold }]}>
        Part {step} of {PRAY_PARTS.length}
      </Text>
      <Text style={[st.name, { color: c.ink }]} accessibilityRole="header">
        {part.name}
      </Text>
      <Text style={[st.henry, { color: c.muted }]}>{part.title}</Text>

      {part.id === 'intercession' && (
        <View style={[st.list, { backgroundColor: c.card, borderColor: c.line }]}>
          <Text style={[st.listTitle, { color: c.ink }]}>Your list</Text>
          {list.length ? (
            list.map((x) => (
              <Text key={x.id} style={[st.item, { color: c.ink }]}>
                • {x.text}
              </Text>
            ))
          ) : (
            <Text style={[st.item, { color: c.muted }]}>Your list is empty.</Text>
          )}
          <Link href={{ pathname: '/intercession', params: { from: String(step) } }} style={[st.edit, { color: c.accent }]}>
            {list.length ? 'Change the list' : 'Add names and needs'}
          </Link>
        </View>
      )}

      {heads.map((h) => (
        <HeadView key={h.id} head={h} limit={FIRST_PARAS} />
      ))}
      <Text style={[st.note, { color: c.muted }]}>
        Each day shows the next heads of this part. All {total} heads take {days} {days === 1 ? 'day' : 'days'}.
      </Text>
      <Link href={{ pathname: '/book/[part]', params: { part: part.id } }} style={[st.edit, { color: c.accent }]}>
        Read all of {part.name}
      </Link>
      <View style={st.nav}>
        {step > 1 && <Button flex label="Back" onPress={() => go(step - 1)} />}
        <Button flex primary label={step < PRAY_PARTS.length ? `Next: ${PRAY_PARTS[step].name}` : 'Finish'} onPress={() => go(step + 1)} />
      </View>
    </ScrollView>
  )
}

const st = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48, maxWidth: 720, width: '100%', alignSelf: 'center' },
  dots: { flexDirection: 'row', gap: 6, marginTop: 4, marginBottom: 12 },
  dot: { flex: 1, height: 4, borderRadius: 2 },
  step: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  name: { fontFamily: serif.semibold, fontSize: 30, lineHeight: 36, marginTop: 2 },
  henry: { fontFamily: serif.italic, fontSize: 15.5, lineHeight: 22, marginTop: 4, marginBottom: 16 },
  list: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 16, marginBottom: 16, gap: 4 },
  listTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  item: { fontFamily: serif.regular, fontSize: 17, lineHeight: 25 },
  edit: { fontSize: 15, fontWeight: '600', paddingVertical: 6 },
  note: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  nav: { flexDirection: 'row', gap: 12, marginTop: 20 },
  done: { fontFamily: serif.semibold, fontSize: 34, marginTop: 24, marginBottom: 12 },
})
