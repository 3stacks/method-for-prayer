import Image, { type StaticImageData } from 'next/image'

import { CheckIcon } from '@/components/CheckIcon'
import { Container } from '@/components/Container'
import { SectionHeading } from '@/components/SectionHeading'
import prayImage from '@/images/screens/pray.png'
import verseImage from '@/images/screens/verse.png'
import bookImage from '@/images/screens/book.png'
import occasionsImage from '@/images/screens/occasions.png'
import intercessionImage from '@/images/screens/intercession.png'

const features: {
  title: string
  description: string
  image: StaticImageData
  alt: string
}[] = [
  {
    title: 'Pray now',
    description:
      'A guided prayer through the six parts. Each day it gives you the next heads of each part.',
    image: prayImage,
    alt: 'Pray now, at the part for adoration',
  },
  {
    title: 'The verse in the KJV',
    description:
      'Tap a reference to read the verse in the King James Version, with the verses around it.',
    image: verseImage,
    alt: 'Psalm 25:3 in the King James Version, in a sheet below the prayer',
  },
  {
    title: 'The whole book',
    description:
      'Read the preface and all nine chapters. Open any head, and pray it.',
    image: bookImage,
    alt: 'The book, with the list of chapters',
  },
  {
    title: 'Occasions',
    description:
      'Henry’s words for the morning, the evening, meals, the Lord’s Day, the Lord’s Supper and the family.',
    image: occasionsImage,
    alt: 'The occasions, with prayers for particular times',
  },
  {
    title: 'Intercession list',
    description:
      'Add the names of people and their needs. Pray now shows them in the part for intercession.',
    image: intercessionImage,
    alt: 'The intercession list, with names and needs',
  },
]

const extras = [
  'The list stays on your device only',
  'Works with no connection on iPhone and Android',
  'No account, no sign-in and no advertisements',
  'Light and dark mode',
]

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="scroll-mt-14 overflow-x-clip py-16 sm:scroll-mt-32 sm:py-20 lg:py-32"
    >
      <Container>
        <SectionHeading number="2" id="features-title">
          Features
        </SectionHeading>
        <p className="mt-8 font-display text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Simple tools for daily prayer.
        </p>
        <p className="mt-4 text-lg tracking-tight text-slate-700 dark:text-slate-300">
          The app holds the whole text of the book and of the King James
          Version. It asks for no account and no payment.
        </p>
      </Container>
      <Container size="lg" className="mt-16">
        <ol
          role="list"
          className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5"
        >
          {features.map((feature) => (
            <li key={feature.title}>
              <div className="relative flex h-72 items-start justify-center overflow-hidden rounded-2xl bg-brand-600 px-6 pt-6 shadow-lg dark:bg-brand-800">
                <Image
                  src={feature.image}
                  alt={feature.alt}
                  className="w-full max-w-60 rounded-t-xl shadow-md"
                  sizes="(min-width: 1024px) 14rem, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                {feature.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
      <Container className="mt-16">
        <ul
          role="list"
          className="grid grid-cols-1 gap-3 text-lg tracking-tight text-slate-700 sm:grid-cols-2 dark:text-slate-300"
        >
          {extras.map((extra) => (
            <li key={extra} className="flex">
              <CheckIcon className="h-8 w-8 flex-none fill-gold-600 dark:fill-gold-300" />
              <span className="ml-4">{extra}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
