# A Method for Prayer

Pray in the words of Scripture with Matthew Henry's *A Method for Prayer* (1710). This is one Expo
app for the web, iOS and Android. It uses Expo SDK 58, React Native 0.88 and Expo Router. It is the
fifth app of a suite of free Reformed apps, with Precentor, Hearers, Covenant Household and
Haddington Bible.

The app has all the text in its bundle, so it works with no connection. It has no account, no
analytics and no server. The settings and the intercession list stay on the device, in
AsyncStorage.

## Run

The app needs Node 24.

```bash
npm ci
npx expo start
```

Run these checks before a release:

```bash
npm test                 # the parser tests and the rotation tests
npx tsc --noEmit
npx expo lint
npx expo-doctor
npx expo export --platform ios --platform android   # the bundles must compile
npm run build            # the web build, with the crawler pages
```

## Screens

| Path | Screen |
| --- | --- |
| `/` | Home |
| `/pray` | Pray now: the six parts in order. `?step=1` to `?step=6` |
| `/book` | The book: the preface and the chapters |
| `/book/<part>` | A chapter and its heads, for example `/book/confession` |
| `/head/<id>` | One head, for example `/head/adoration-3` |
| `/occasions` | The occasions, the forms of prayer and the Lord's Prayer |
| `/intercession` | The intercession list |
| `/preface`, `/settings`, `/about`, `/privacy` | The text pages |

The deep link `methodforprayer://head/adoration-3` opens a head.

## The daily rule

Pray now shows some heads of each part each day. The number comes from Settings (1 to 4, the
default is 2). A part with many heads shows more each day, so that each part takes 30 days or
fewer. The days count from 1 January 2026, in local time. Each day shows the next heads, in the
order of the book. `src/lib/rotation.ts` has the rule, and `src/lib/rotation.test.ts` tests it.

## The text

The source is the Internet Archive scan
[methodforprayerw0000henr](https://archive.org/details/methodforprayerw0000henr). It is a printing
by the Presbyterian Board of Publication, Philadelphia, from the 19th century. Henry's text is in
the public domain. This printing already uses modern spelling. The app keeps its spelling and its
words.

To build the data again:

```bash
npm run data      # data/kjv/ and data/method.json
```

- `source/methodforprayerw0000henr_djvu.txt` is the OCR text of the Internet Archive.
- `scripts/clean.mjs` removes the running heads and the noise of the page edge, and joins the
  paragraphs.
- `source/corrections.txt` fixes words and heads that the OCR misread. Each fix was checked against
  the scan.
- `scripts/refs.mjs` resolves each reference against the KJV. It mends a misread reference with the
  words of the prayer before it. It finds a lost reference with a search of the KJV.
- `scripts/build-data.mjs` writes `data/method.json`, and `source/proofing.txt` lists the words and
  the references to check against the scan.
- `scripts/check-refs.mjs` prints a sample of references beside the KJV text.
- `scripts/build-kjv.mjs` writes `data/kjv/`, from thiagobodruk/bible (public domain).
- `scripts/make-lexicon.mjs` wrote `source/lexicon.txt` from a second scan (Glasgow, 1834).

`data/method.json` has the source, the preface and nine parts. Each part has Henry's title, its
opening paragraphs and its heads. Each head has a level, its printed number, the head above it,
Henry's heading and its paragraphs. A paragraph is a list of text and references, such as
`["Unto thee, O Lord, do we lift up our souls. ", ["Ps.25.1"]]`.

## Links to the other apps

`src/lib/appLink.ts` is the same file in each app of the suite. This copy adds
`methodforprayer.app` with the scheme `methodforprayer`. The other apps need the same line in their
copies.

## Build for the stores

Read `store/RELEASE.md`. The app id is `com.lukeboyle.methodforprayer` on both stores. You cannot
change it after the first upload.
