import { GridPattern } from '@/components/GridPattern'
import { SectionHeading } from '@/components/SectionHeading'
import { KOFI_URL, REPO_URL, SIBLINGS } from '@/lib/site'

function CupIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" />
      <path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17M8 3v2M12 3v2" />
    </svg>
  )
}

const link =
  'font-medium text-brand-600 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200'

export function About() {
  return (
    <section
      id="apps"
      aria-labelledby="apps-title"
      className="relative scroll-mt-14 pt-8 pb-3 sm:scroll-mt-32 sm:pt-10 sm:pb-16 lg:pt-16"
    >
      <div className="absolute inset-x-0 top-1/2 bottom-0 mask-[linear-gradient(transparent,white)] text-slate-900/10 dark:text-white/10">
        <GridPattern x="50%" y="100%" />
      </div>
      <div className="relative mx-auto max-w-5xl sm:px-6">
        <div className="bg-slate-100 sm:rounded-6xl dark:bg-night-2">
          <div className="px-4 py-10 sm:px-10 sm:py-16 md:py-20 lg:px-20 lg:py-32">
            <SectionHeading number="5" id="apps-title">
              Other apps
            </SectionHeading>
            <p className="mt-8 font-display text-4xl font-semibold tracking-tight text-pretty text-slate-900 sm:text-5xl dark:text-white">
              <span className="block text-brand-600 dark:text-brand-300">
                One of five free Reformed apps.
              </span>{' '}
              No advertisements, no accounts, no cookies.
            </p>
            <ul role="list" className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {SIBLINGS.map((app) => (
                <li key={app.name}>
                  <a
                    href={app.href}
                    className="block h-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:ring-brand-400 dark:bg-night dark:ring-slate-800 dark:hover:ring-brand-400"
                    data-event="Sibling"
                    data-event-label={app.name}
                  >
                    <span className="block font-display text-xl font-semibold text-slate-900 dark:text-white">
                      {app.name}
                    </span>
                    <span className="mt-1 block text-base text-slate-600 dark:text-slate-300">
                      {app.description}
                    </span>
                    <span className="mt-2 block font-ui text-sm text-brand-600 dark:text-brand-300">
                      {app.href.replace('https://', '')}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-10 text-lg tracking-tight text-slate-700 dark:text-slate-300">
              Luke Boyle makes these apps. They are free for anyone to use. The
              source code of this app is on GitHub, at{' '}
              <a href={REPO_URL} className={link}>
                github.com/3stacks/method-for-prayer
              </a>
              .
            </p>
            <p className="mt-4 text-lg tracking-tight text-slate-700 dark:text-slate-300">
              If the app helps you, you can support it on Ko-fi. The support
              pays for the time that these apps need.
            </p>
            <p className="mt-8">
              <a
                href={KOFI_URL}
                className="inline-flex items-center font-ui text-base font-medium tracking-tight text-slate-900 dark:text-slate-100"
                data-event="Ko-fi"
              >
                <CupIcon className="h-10 w-10" />
                <span className="ml-4">Support the app on Ko-fi</span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
