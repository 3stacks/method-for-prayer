import clsx from 'clsx'

import { Button } from '@/components/Button'
import { CheckIcon } from '@/components/CheckIcon'
import { Container } from '@/components/Container'
import { GridPattern } from '@/components/GridPattern'
import { SectionHeading } from '@/components/SectionHeading'
import { APP_STORE_URL, APP_URL, GOOGLE_PLAY_URL } from '@/lib/site'

function Plan({
  name,
  description,
  features,
  featured = false,
  children,
}: {
  name: string
  description: string
  features: Array<string>
  featured?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={clsx(
        'relative px-4 py-16 sm:rounded-5xl sm:px-10 md:py-12 lg:px-12',
        featured && 'bg-brand-600 sm:shadow-lg dark:bg-brand-800',
      )}
    >
      {featured && (
        <div className="absolute inset-0 mask-[linear-gradient(white,transparent)] text-white/10">
          <GridPattern x="50%" y="50%" />
        </div>
      )}
      <div className="relative flex flex-col">
        <h3
          className={clsx(
            'mt-7 font-display text-2xl font-semibold tracking-tight',
            featured ? 'text-white' : 'text-slate-900 dark:text-white',
          )}
        >
          {name}
        </h3>
        <p
          className={clsx(
            'mt-2 text-lg tracking-tight',
            featured ? 'text-white' : 'text-slate-600 dark:text-slate-300',
          )}
        >
          {description}
        </p>
        <p
          className={clsx(
            'order-first font-display text-7xl font-semibold tracking-tight',
            featured ? 'text-gold-300' : 'text-gold-600 dark:text-gold-300',
          )}
        >
          Free
        </p>
        <div className="order-last mt-8">
          <ul
            role="list"
            className={clsx(
              '-my-2 divide-y text-base tracking-tight',
              featured
                ? 'divide-white/10 text-white'
                : 'divide-slate-200 text-slate-900 dark:divide-slate-800 dark:text-slate-100',
            )}
          >
            {features.map((feature) => (
              <li key={feature} className="flex py-2">
                <CheckIcon
                  className={clsx(
                    'h-8 w-8 flex-none',
                    featured ? 'fill-gold-300' : 'fill-slate-600 dark:fill-slate-400',
                  )}
                />
                <span className="ml-4">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8 flex flex-col gap-3">{children}</div>
      </div>
    </div>
  )
}

/** A store button. Until the store address exists, it shows "Soon" and links nowhere. */
function StoreButton({
  store,
  action,
  href,
}: {
  store: string
  action: string
  href: string | null
}) {
  if (!href) {
    return (
      <span
        className="inline-flex cursor-default justify-center rounded-md border border-dashed border-slate-300 px-4 py-1 font-ui text-base font-semibold tracking-tight text-slate-500 dark:border-slate-600 dark:text-slate-400"
        title={`${store}: soon`}
      >
        {store}: soon
      </span>
    )
  }
  return (
    <Button
      href={href}
      color="slate"
      data-event="Store"
      data-event-label={store}
    >
      {action}
    </Button>
  )
}

export function Download() {
  return (
    <section
      id="download"
      aria-labelledby="download-title"
      className="scroll-mt-14 pt-16 pb-8 sm:scroll-mt-32 sm:pt-20 sm:pb-10 lg:pt-32 lg:pb-16"
    >
      <Container>
        <SectionHeading number="3" id="download-title">
          Get the app
        </SectionHeading>
        <p className="mt-8 font-display text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
          Free on each device
        </p>
        <p className="mt-4 max-w-xl text-lg tracking-tight text-slate-600 dark:text-slate-300">
          The app is the same on the web, on iPhone and on Android. Each one has
          every feature.
        </p>
      </Container>
      <div className="mx-auto mt-16 max-w-5xl lg:px-6">
        <div className="grid bg-slate-100 sm:px-6 sm:pb-16 md:grid-cols-2 md:rounded-6xl md:px-8 md:pt-16 lg:p-20 dark:bg-night-2">
          <Plan
            featured
            name="In your browser"
            description="Open the app and pray. You install nothing."
            features={[
              'The whole book and every feature',
              'Add it to your home screen',
              'Your list stays in this browser',
              'No account and no advertisements',
            ]}
          >
            <Button
              href={APP_URL}
              color="white"
              data-event="Open app"
              data-event-label="download"
            >
              Open in your browser
            </Button>
          </Plan>
          <Plan
            name="On your phone"
            description="Install the app from the App Store or from Google Play."
            features={[
              'iPhone and Android',
              'Works with no connection',
              'Your list stays on your phone',
              'No account and no advertisements',
            ]}
          >
            <StoreButton
              store="App Store"
              action="Download on the App Store"
              href={APP_STORE_URL}
            />
            <StoreButton
              store="Google Play"
              action="Get it on Google Play"
              href={GOOGLE_PLAY_URL}
            />
          </Plan>
        </div>
      </div>
    </section>
  )
}
