// The addresses that the website links to.

/** The web app. It is not a Next.js route, so link to it with a plain <a>. */
export const APP_URL = '/app/'
export const REPO_URL = 'https://github.com/3stacks/method-for-prayer'
export const KOFI_URL = 'https://ko-fi.com/lukeboyle'
export const SCAN_URL = 'https://archive.org/details/methodforprayerw0000henr'
export const KJV_URL = 'https://github.com/thiagobodruk/bible'

// TODO: add the store addresses when the apps are live. Until then, the
// website shows "Soon" in place of each store button.
export const APP_STORE_URL: string | null = null
export const GOOGLE_PLAY_URL: string | null = null

/** The public address of the site, for canonical URLs. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://methodforprayer.app').replace(/\/+$/, '')

/** The other free apps of the suite. */
export const SIBLINGS = [
  {
    name: 'Hearers',
    href: 'https://hearers.app',
    description: 'Learn the catechisms, the creeds and Scripture by heart.',
  },
  {
    name: 'Precentor',
    href: 'https://precentor.app',
    description: 'Sing the Psalms of the 1650 Scottish Psalter.',
  },
  {
    name: 'Haddington Bible',
    href: 'https://haddingtonbible.org',
    description: 'Read the Self-Interpreting Bible of John Brown.',
  },
  {
    name: 'Covenant Household',
    href: 'https://covenanthousehold.app',
    description: 'Lead family worship each day.',
  },
]
