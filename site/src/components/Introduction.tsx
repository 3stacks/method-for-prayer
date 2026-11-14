import { CheckIcon } from '@/components/CheckIcon'
import { Container } from '@/components/Container'

export function Introduction() {
  return (
    <section
      id="introduction"
      aria-label="Introduction"
      className="pt-20 pb-16 sm:pb-20 md:pt-36 lg:py-32"
    >
      <Container className="text-lg tracking-tight text-slate-700 dark:text-slate-300">
        <p className="font-display text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
          When you do not know what to say, pray the words that God gave.
        </p>
        <p className="mt-4">
          Matthew Henry (1662 to 1714) was a Presbyterian minister at Chester
          and at Hackney. Many people know him for his commentary on the whole
          Bible. His <cite>Method for Prayer</cite> takes prayer one part at a
          time. Under each head of each part, he gives the words of Scripture
          that fit that head.
        </p>
        <p className="mt-4">
          The app puts his method into a daily prayer. Each day, it gives you
          the next heads of each part. You pray through the whole book, a few
          heads at a time.
        </p>
        <ul role="list" className="mt-8 space-y-3">
          {[
            'A guided prayer in six parts, with new heads each day',
            'The whole book: the preface, nine chapters and 264 heads',
            'Tap a reference to read the verse in the King James Version',
            'Prayers for the morning, the evening, the Lord’s Day and more',
            'Free, with no account and no advertisements',
          ].map((feature) => (
            <li key={feature} className="flex">
              <CheckIcon className="h-8 w-8 flex-none fill-gold-600 dark:fill-gold-300" />
              <span className="ml-4">{feature}</span>
            </li>
          ))}
        </ul>
        <p className="mt-10">
          <a
            href="/app/pray"
            className="font-ui text-base font-medium text-brand-600 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
            data-event="Open app"
            data-event-label="introduction"
          >
            Pray now <span aria-hidden="true">&rarr;</span>
          </a>
        </p>
      </Container>
    </section>
  )
}
