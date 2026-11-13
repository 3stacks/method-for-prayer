import { P, Page } from '../components/Prose.tsx'
import { PREFACE } from '../lib/data.ts'

export default function Preface() {
  return (
    <Page>
      {PREFACE.map((p, i) => (
        <P key={i}>{p}</P>
      ))}
    </Page>
  )
}
