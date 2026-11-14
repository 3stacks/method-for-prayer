import { type Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'
import { REPO_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'A Method for Prayer collects no personal data. Your settings and your intercession list stay on your device.',
  alternates: { canonical: '/privacy/' },
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-14 font-display text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
      {children}
    </h2>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-lg tracking-tight text-slate-700 dark:text-slate-300">
      {children}
    </p>
  )
}

const A = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="font-medium text-brand-600 underline dark:text-brand-300"
  >
    {children}
  </a>
)

export default function Privacy() {
  return (
    <>
      <header className="bg-slate-100 py-16 sm:py-20 dark:bg-night-2">
        <Container>
          <p className="font-ui text-base font-medium text-slate-500 dark:text-slate-400">
            <Link
              href="/"
              className="hover:text-slate-900 dark:hover:text-white"
            >
              A Method for Prayer
            </Link>
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            Privacy
          </h1>
          <p className="mt-4 text-xl tracking-tight text-slate-600 dark:text-slate-300">
            A Method for Prayer collects no personal data. Your settings and
            your intercession list stay on your device.
          </p>
          <p className="mt-2 font-ui text-sm text-slate-500 dark:text-slate-400">
            Last change: 14 November 2026
          </p>
        </Container>
      </header>

      <main className="py-16">
        <Container>
          <H2>The iPhone and Android apps</H2>
          <P>
            The apps have no account, no advertisements and no analytics. They
            send no data to us or to another company.
          </P>
          <P>
            The app keeps your settings and your intercession list on your
            device. When you delete the app, you delete them.
          </P>
          <P>
            The text of the book and of the Bible is in the app, so the app
            works with no connection. The app connects to the internet only when
            you open a link, for example to Hearers or to Haddington Bible.
            Those sites have their own privacy policies.
          </P>

          <H2>The website and the web app</H2>
          <P>
            The web app keeps your settings and your intercession list in the
            storage of your browser, on your device. We do not receive them.
          </P>
          <P>
            The website and the web app count visits with Umami. Umami uses no
            cookies and does not identify you. It records the page, the site
            that sent you, the type of browser and device, and the country. It
            does not keep your IP address. It never sends the names in your
            intercession list. Analytics counts only the public site,
            methodforprayer.app.
          </P>
          <P>
            Cloudflare hosts the website. Cloudflare processes each visit, as
            each web host does, to deliver the page and to protect the site.
            Read the{' '}
            <A href="https://www.cloudflare.com/privacypolicy/">
              privacy policy of Cloudflare
            </A>
            .
          </P>

          <H2>Gifts</H2>
          <P>
            On the web and on Android, you can give a gift on Ko-fi. Ko-fi and
            its payment provider process the gift. If you give your name and
            your message to Ko-fi, we receive them. If not, we do not.
          </P>

          <H2>Children</H2>
          <P>
            A Method for Prayer collects no data from anyone, so it collects no
            data from children.
          </P>

          <H2>Changes and contact</H2>
          <P>
            If this policy changes, this page shows the new policy and the date
            of the change. For a question, open an issue on{' '}
            <A href={`${REPO_URL}/issues`}>GitHub</A>.
          </P>
        </Container>
      </main>
      <Footer />
    </>
  )
}
