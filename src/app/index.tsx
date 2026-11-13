import { router } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../components/Button.tsx'
import { Footer } from '../components/Footer.tsx'
import { P, Page } from '../components/Prose.tsx'
import { Row } from '../components/Row.tsx'
import { useStore } from '../lib/prefs.tsx'
import { serif, useColors } from '../lib/theme.ts'

export default function Home() {
  const c = useColors()
  const { list } = useStore()
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <Page>
      <Text style={[st.kicker, { color: c.gold }]}>Matthew Henry, 1710</Text>
      <Text style={[st.title, { color: c.ink }]} accessibilityRole="header">
        Pray in the words of Scripture
      </Text>
      <P muted>
        Henry gives a method for prayer in six parts. Under each head, he gives the words of the Bible that are proper to it.
      </P>
      <View style={[st.today, { backgroundColor: c.card, borderColor: c.line }]}>
        <Text style={[st.date, { color: c.muted }]}>{today}</Text>
        <Text style={[st.parts, { color: c.ink }]}>Adoration · Confession · Petition · Thanksgiving · Intercession · Conclusion</Text>
        <Button primary label="Pray now" onPress={() => router.push('/pray')} />
      </View>
      <Row href="/book" title="The book" hint="The whole method. Read and pray any head." />
      <Row href="/occasions" title="Occasions" hint="Morning and evening, the Lord’s Day, meals, the family, children and other times." />
      <Row
        href="/intercession"
        title="Intercession list"
        hint={list.length ? `${list.length} ${list.length === 1 ? 'name or need' : 'names and needs'}. Only on this device.` : 'Add names and needs. They stay on this device.'}
      />
      <Footer />
    </Page>
  )
}

const st = StyleSheet.create({
  kicker: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 12 },
  title: { fontFamily: serif.semibold, fontSize: 30, lineHeight: 36, marginTop: 4, marginBottom: 10 },
  today: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 16, marginVertical: 12, gap: 10 },
  date: { fontSize: 14 },
  parts: { fontFamily: serif.regular, fontSize: 16, lineHeight: 23 },
})
