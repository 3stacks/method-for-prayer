import { A, H2, P, Page } from '../components/Prose.tsx'
import { PRIVACY_URL } from '../lib/links.ts'

export default function Privacy() {
  return (
    <Page>
      <P>
        A Method for Prayer collects no personal data. It has no account, no advertisements and no tracking. The app has no
        analytics.
      </P>
      <H2>On your device</H2>
      <P>
        The app keeps your settings and your intercession list on this device. It does not send them to us or to another
        company. When you delete the app, you delete them.
      </P>
      <P>
        The text of the book and of the Bible is in the app, so the app works with no connection. The app connects to the
        internet only when you open a link, for example to Hearers or to Haddington Bible. Those sites have their own privacy
        policies.
      </P>
      <H2>The website</H2>
      <P>
        The website counts visits with Umami. Umami uses no cookies and does not identify you. It records the page, the site
        that sent you, the type of browser and device, and the country. It does not keep your IP address. Analytics counts
        only the public site, methodforprayer.app.
      </P>
      <P>
        Cloudflare hosts the website. Cloudflare processes each visit, as each web host does, to deliver the page and to
        protect the site. Read the <A href="https://www.cloudflare.com/privacypolicy/">privacy policy of Cloudflare</A>.
      </P>
      <H2>Questions</H2>
      <P>
        The full policy is at <A href={PRIVACY_URL}>methodforprayer.app/privacy</A>.
      </P>
    </Page>
  )
}
