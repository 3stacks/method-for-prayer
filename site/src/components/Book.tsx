import { Container } from '@/components/Container'
import { SectionHeading } from '@/components/SectionHeading'
import { KJV_URL, SCAN_URL } from '@/lib/site'

const A = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="font-medium text-brand-600 underline decoration-brand-600/30 underline-offset-2 hover:text-brand-800 dark:text-brand-300 dark:decoration-brand-300/40 dark:hover:text-brand-200"
  >
    {children}
  </a>
)

export function Book() {
  return (
    <section
      id="book"
      aria-labelledby="book-title"
      className="scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32"
    >
      <Container>
        <SectionHeading number="4" id="book-title">
          The book
        </SectionHeading>
        <p className="mt-8 font-display text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Henry’s own words, from an old printing.
        </p>
        <figure className="mt-8 border-l-4 border-gold-600 pl-6 dark:border-gold-300">
          <blockquote className="text-xl text-slate-800 italic dark:text-slate-200">
            “A Method for Prayer, with Scripture Expressions Proper to be Used
            under Each Head.”
          </blockquote>
          <figcaption className="mt-2 font-ui text-sm text-slate-500 dark:text-slate-400">
            The full title. London, 1710.
          </figcaption>
        </figure>
        <div className="mt-8 space-y-4 text-lg tracking-tight text-slate-700 dark:text-slate-300">
          <p>
            The text comes from a printing of the Presbyterian Board of
            Publication, Philadelphia, from the 19th century. The Internet
            Archive holds a <A href={SCAN_URL}>scan of this printing</A>. We
            corrected the text against the scan. We also checked each reference
            against the King James Version.
          </p>
          <p>
            The printing uses modern spelling. The app keeps its spelling and
            its words. It shows each reference in a modern form, for example
            “Ps 118:27”.
          </p>
          <p>
            Henry died in 1714, so his text is in the public domain. The King
            James text comes from <A href={KJV_URL}>thiagobodruk/bible</A>. It
            is also in the public domain.
          </p>
        </div>
        <p className="mt-10">
          <a
            href="/app/book"
            className="font-ui text-base font-medium text-brand-600 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
            data-event="Open app"
            data-event-label="book"
          >
            Read the book <span aria-hidden="true">&rarr;</span>
          </a>
        </p>
      </Container>
    </section>
  )
}
