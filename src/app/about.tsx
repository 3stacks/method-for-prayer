import { Platform, StyleSheet, Text, View } from 'react-native'
import { A, H2, I, Li, P, Page } from '../components/Prose.tsx'
import { SOURCE } from '../lib/data.ts'
import { COVENANT_HOUSEHOLD, HADDINGTON, HEARERS, KOFI, PRECENTOR, SCAN_URL } from '../lib/links.ts'
import { useColors } from '../lib/theme.ts'

function Credit({ term, children }: { term: string; children: React.ReactNode }) {
  const c = useColors()
  return (
    <View style={st.credit}>
      <Text style={[st.term, { color: c.ink }]}>{term}</Text>
      <Text style={[st.def, { color: c.muted }]}>{children}</Text>
    </View>
  )
}

export default function About() {
  return (
    <Page>
      <H2>The book</H2>
      <P>
        <I>A Method for Prayer</I> teaches you to pray in the words of Scripture. Matthew Henry first published it at London
        in 1710. He divides prayer into six parts: adoration, confession, petition, thanksgiving, intercession and the
        conclusion. Under each head of each part, he gives the words of the Bible that are proper to it.
      </P>
      <P>
        Later chapters give words for particular occasions, a paraphrase of the Lord’s Prayer, and short forms of prayer for
        families and for children.
      </P>
      <H2>The author</H2>
      <P>
        Matthew Henry (1662 to 1714) was an English Presbyterian minister. He was the minister of a congregation at Chester for
        25 years, and then at Hackney. His commentary on the whole Bible is still in print.
      </P>
      <H2>How to use the app</H2>
      <Li>Pray now takes you through the six parts. Each day it gives the next heads of each part.</Li>
      <Li>Tap a reference to read the verse in the King James Version, with the verses around it.</Li>
      <Li>The book has each chapter and each head. Read and pray any head.</Li>
      <Li>Add names and needs to the intercession list. The guided prayer shows them.</Li>

      <H2>Sources and licences</H2>
      <Credit term="The printed book">
        {SOURCE.edition} Henry’s text is in the public domain.
      </Credit>
      <Credit term="The text in the app">
        From the scan and the OCR text of the Internet Archive (<A href={SCAN_URL}>archive.org</A>). The OCR text was
        corrected against the scan, and each reference was checked against the KJV. This printing already uses modern
        spelling. The app keeps its spelling and its words. The app shows each reference in a modern form, for example “Ps
        118:27”.
      </Credit>
      <Credit term="King James Version">From thiagobodruk/bible. Public domain.</Credit>
      <P muted>
        The OCR text can still have a wrong word or a wrong reference. If you find one, tell us through the website.
      </P>

      <H2>Other free apps</H2>
      <Li>
        <A href={HEARERS}>Hearers</A>: learn the catechism and Scripture by heart.
      </Li>
      <Li>
        <A href={HADDINGTON}>Haddington Bible</A>: the Self-Interpreting Bible of John Brown.
      </Li>
      <Li>
        <A href={PRECENTOR}>Precentor</A>: sing the Psalms of the 1650 Scottish Psalter.
      </Li>
      <Li>
        <A href={COVENANT_HOUSEHOLD}>Covenant Household</A>: family worship.
      </Li>

      <H2>Support</H2>
      {/* The App Store does not allow a link to outside payments, so iOS does not show it. */}
      <P>
        A Method for Prayer is free and has no advertisements.
        {Platform.OS !== 'ios' && (
          <>
            {' '}
            If it helps you, you can support it on <A href={KOFI}>Ko-fi</A>.
          </>
        )}
      </P>
    </Page>
  )
}

const st = StyleSheet.create({
  credit: { marginTop: 12 },
  term: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  def: { fontSize: 15, lineHeight: 22 },
})
