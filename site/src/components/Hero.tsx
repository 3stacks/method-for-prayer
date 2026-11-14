import Image from 'next/image'

import { Button } from '@/components/Button'
import { GridPattern } from '@/components/GridPattern'
import { APP_URL } from '@/lib/site'
import heroImage from '@/images/screens/pray.png'

function Verse() {
  return (
    <figure className="relative mx-auto max-w-md text-center lg:mx-0 lg:text-left">
      <blockquote>
        <p className="font-display text-2xl text-slate-900 italic dark:text-slate-100">
          “Lord, teach us to pray, as John also taught his disciples.”
        </p>
      </blockquote>
      <figcaption className="mt-2 font-ui text-sm text-slate-500 dark:text-slate-400">
        <strong className="font-semibold text-gold-600 dark:text-gold-300">
          Luke 11:1
        </strong>
      </figcaption>
    </figure>
  )
}

export function Hero() {
  return (
    <header className="overflow-hidden bg-slate-100 lg:bg-transparent lg:px-5 dark:bg-night-2 lg:dark:bg-transparent">
      <div className="mx-auto grid max-w-6xl grid-cols-1 grid-rows-[auto_1fr] gap-y-16 pt-16 md:pt-20 lg:grid-cols-12 lg:gap-y-20 lg:px-3 lg:pt-20 lg:pb-36 xl:py-32">
        <div className="relative flex items-end lg:col-span-5 lg:row-span-2">
          <div className="absolute -top-20 right-1/2 -bottom-12 left-0 z-10 rounded-br-6xl bg-brand-600 text-white/10 md:bottom-8 lg:-inset-y-32 lg:right-full lg:left-[-100vw] lg:-mr-40 dark:bg-brand-800">
            <GridPattern
              x="100%"
              y="100%"
              patternTransform="translate(112 64)"
            />
          </div>
          <div className="relative z-10 mx-auto flex w-64 overflow-hidden rounded-3xl bg-slate-600 shadow-xl ring-8 ring-slate-900 md:w-72 lg:w-auto lg:max-w-xs">
            <Image
              className="w-full"
              src={heroImage}
              alt="The app on a phone: Pray now, at the part for adoration, with the words of Psalm 31 and Psalm 62"
              priority
            />
          </div>
        </div>
        <div className="relative px-4 sm:px-6 lg:col-span-7 lg:pr-0 lg:pb-14 lg:pl-16 xl:pl-20">
          <div className="hidden lg:absolute lg:-top-32 lg:right-[-100vw] lg:bottom-0 lg:left-[-100vw] lg:block lg:bg-slate-100 dark:lg:bg-night-2" />
          <Verse />
        </div>
        <div className="bg-paper pt-16 lg:col-span-7 lg:bg-transparent lg:pt-0 lg:pl-16 xl:pl-20 dark:bg-night lg:dark:bg-transparent">
          <div className="mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:px-0">
            <p className="font-ui text-sm font-semibold tracking-widest text-gold-600 uppercase dark:text-gold-300">
              A Method for Prayer
            </p>
            <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
              Pray in the words of Scripture.
            </h1>
            <p className="mt-6 text-2xl text-slate-600 dark:text-slate-300">
              Matthew Henry wrote <cite>A Method for Prayer</cite> in 1710.
              For each part of prayer, he gives you the words of the Bible.
              This free app puts his whole book in your hand.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                href={APP_URL}
                color="brand"
                data-event="Open app"
                data-event-label="hero"
              >
                Open in your browser
              </Button>
              <Button
                href="#download"
                variant="outline"
                color="brand"
                data-event="Get the app"
                data-event-label="hero"
              >
                Get the app
              </Button>
            </div>
            <p className="mt-4 font-ui text-base tracking-tight text-slate-500 dark:text-slate-400">
              Free. No account. No advertisements.
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
