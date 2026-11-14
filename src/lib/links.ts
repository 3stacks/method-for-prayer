// Links to the website and to the other apps of the suite.

/** The domain of the website. It is not registered yet. Change it here only. */
export const WEBSITE = 'https://methodforprayer.app'
/** The homepage is at /. The web app is at /app/. The privacy policy is a page of the homepage. */
export const PRIVACY_URL = `${WEBSITE}/privacy/`
export const KOFI = 'https://ko-fi.com/lukeboyle'
export const HEARERS = 'https://hearers.app'
export const PRECENTOR = 'https://precentor.app'
export const HADDINGTON = 'https://haddingtonbible.org'
export const COVENANT_HOUSEHOLD = 'https://covenanthousehold.app'
export const SCAN_URL = 'https://archive.org/details/methodforprayerw0000henr'

/** Add a verse to "My verses" in Hearers. The id is a Hearers passage id: "John.3.16". */
export const memoriseInHearers = (code: string, chapter: number, verse: number) =>
  `${HEARERS}/app/#/add/${code}.${chapter}.${verse}`

/** A chapter with the notes of John Brown in Haddington Bible: "psalms-23#v23-1". */
export const brownsNotes = (bookName: string, chapter: number, verse?: number) =>
  `${HADDINGTON}/${bookName.toLowerCase().replace(/ /g, '-')}-${chapter}${verse ? `#v${chapter}-${verse}` : ''}`
