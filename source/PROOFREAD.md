# Proof check against the scan

This file records the proof check of the app text against the page images of the scan
`methodforprayerw0000henr`. Use it to continue the work after a stop.

## Method

1. Download the page images with `sh scripts/fetch-pages.sh`. The images go to `source/pages/`.
   Git ignores that folder.
2. To print the app text of a page, run `node scripts/proof-dump.mjs <page>`.
3. Compare the text with the image of the page. The image of page N is `source/pages/n<N+3>.jpg`.
4. Write each fix in `source/corrections.txt`. Use `--raw` to see the text that a fix must match.
5. Put each printed word that the KJV does not have in `source/words.txt`.
6. Run `node scripts/build-data.mjs`.
7. Run `node --test scripts/parser.test.mjs`.

The marks for a fix are in the comment of `buildBook` and of `resolveParagraph` in
`scripts/build-data.mjs`:

| Mark | Meaning |
| --- | --- |
| `{Ps.139.14}` | A reference, checked against the scan |
| `{-}` | The paragraph has no reference |
| `{H}` | A head with no number |
| `{P}` | A paragraph of prayer |
| `{L2}` | A head at level 2 |
| `{+}` | Join the paragraph to the paragraph before it |

## Rules

- The text follows the print: the words, the letters, the punctuation and the capitals.
- The build removes the space before a mark of punctuation. The printer set a thin space there.
- The print uses large type for the words of Henry and small type for the prayers. A paragraph in
  large type is a head. A paragraph in small type is prayer.
- A reference follows the print. If the print has a reference that is clearly wrong, the app uses
  the correct verse. Each of these errors is in the list below.
- An old form of a word stays as printed. Examples are `befal`, `stedfast` and `burthens`.
- A clear misprint is a word that does not exist, such as `exceeeding`. The app corrects a clear
  misprint. Each misprint is in the list below.
- The app shows small capitals as normal letters: `OUR spirits` becomes `Our spirits`.

## Progress

| Pages | Chapter | Status |
| --- | --- | --- |
| v to xiii, 15 to 39 | Preface, 1 | Done |
| 40 to 65 | 2 | Done |
| 202 to 228 | 7, 8 | Done |
| 109 to 146 | 4 | Done |
