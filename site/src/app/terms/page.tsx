import { type Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'
import { REPO_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms',
  description:
    'The terms of use of A Method for Prayer. A Method for Prayer is free, and we supply it as it is.',
  alternates: { canonical: '/terms/' },
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

export default function Terms() {
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
            Terms
          </h1>
          <p className="mt-4 text-xl tracking-tight text-slate-600 dark:text-slate-300">
            A Method for Prayer is free. These terms tell what you can expect
            from A Method for Prayer and from us.
          </p>
          <p className="mt-2 font-ui text-sm text-slate-500 dark:text-slate-400">
            Last change: 26 November 2026
          </p>
        </Container>
      </header>

      <main className="py-16">
        <Container>
          <H2>Who we are</H2>
          <P>
            Alpine Hills Consulting Pty Ltd publishes A Method for Prayer. The
            company is in Australia. In these terms, “we” and “us” mean this
            company.
          </P>

          <H2>Use of A Method for Prayer</H2>
          <P>
            You can use A Method for Prayer at no cost. You need no account.
          </P>
          <P>
            If you use A Method for Prayer, you agree to these terms. If you do
            not agree, do not use A Method for Prayer.
          </P>

          <H2>No warranty</H2>
          <P>
            We supply A Method for Prayer as it is. We do not promise that it
            has no errors, or that it is always available.
          </P>
          <P>
            To the extent that the law permits, we are not liable for loss or
            damage from your use of A Method for Prayer.
          </P>
          <P>
            These terms do not remove rights that you have under the Australian
            Consumer Law, or under other law that an agreement cannot remove.
          </P>

          <H2>Links to other sites</H2>
          <P>
            A Method for Prayer links to other sites and apps. We do not control
            them. Their own terms apply.
          </P>

          <H2>Privacy</H2>
          <P>
            The <A href="/privacy/">privacy policy</A> tells what A Method for
            Prayer keeps, and where.
          </P>

          <H2>The law</H2>
          <P>The law of Australia applies to these terms.</P>

          <H2>Changes and contact</H2>
          <P>
            If these terms change, this page shows the new terms and the date of
            the change. For a question, open an issue on{' '}
            <A href={`${REPO_URL}/issues`}>GitHub</A>.
          </P>
        </Container>
      </main>
      <Footer />
    </>
  )
}
