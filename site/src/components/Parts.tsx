import { Container } from '@/components/Container'
import { SectionHeading } from '@/components/SectionHeading'

const parts: { name: string; id: string; heads: number; description: string }[] = [
  {
    name: 'Adoration',
    id: 'adoration',
    heads: 32,
    description: 'Come to God, and give him glory for who he is.',
  },
  {
    name: 'Confession',
    id: 'confession',
    heads: 34,
    description: 'Confess your sin, and tell God of your sorrow for it.',
  },
  {
    name: 'Petition',
    id: 'petition',
    heads: 57,
    description: 'Ask God for the good things that you need.',
  },
  {
    name: 'Thanksgiving',
    id: 'thanksgiving',
    heads: 48,
    description: 'Thank God for the mercies that you receive from him.',
  },
  {
    name: 'Intercession',
    id: 'intercession',
    heads: 32,
    description:
      'Pray for others: the world, the church, the nation, your family and your friends.',
  },
  {
    name: 'Conclusion',
    id: 'conclusion',
    heads: 6,
    description: 'Close with praise to God, and say Amen.',
  },
]

export function Parts() {
  return (
    <section
      id="parts"
      aria-labelledby="parts-title"
      className="scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32"
    >
      <Container>
        <SectionHeading number="1" id="parts-title">
          The six parts
        </SectionHeading>
        <p className="mt-8 font-display text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Henry divides prayer into six parts.
        </p>
        <p className="mt-4 text-lg tracking-tight text-slate-700 dark:text-slate-300">
          Pray now takes you through the parts in order. Each day it gives you
          the next heads of each part. Each part comes round again in 30 days
          or fewer.
        </p>
      </Container>
      <Container size="lg" className="mt-16">
        <ol
          role="list"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {parts.map((part, i) => (
            <li
              key={part.id}
              className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-night-2 dark:ring-slate-800"
            >
              <p className="font-ui text-xs font-semibold tracking-widest text-gold-600 uppercase dark:text-gold-300">
                Part {i + 1} of 6
              </p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-white">
                <a
                  href={`/app/book/${part.id}`}
                  className="hover:text-brand-600 dark:hover:text-brand-300"
                >
                  {part.name}
                </a>
              </h3>
              <p className="mt-2 text-lg text-slate-700 dark:text-slate-300">
                {part.description}
              </p>
              <p className="mt-4 font-ui text-sm text-slate-500 dark:text-slate-400">
                {part.heads} heads
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
