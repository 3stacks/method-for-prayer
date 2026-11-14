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
| `{L2}` | A head at level 2 (the levels are 1 to 5) |
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
- Small capitals at the start of a chapter or a paragraph become normal letters in the app. For
  example, `OUR spirits` becomes `Our spirits`. Capitals for emphasis stay, for example
  `JESUS CHRIST` on page 230.
- A heading in capitals in chapters 8 and 9 shows in sentence case in the app.

## Progress

We checked all the pages: v to xiii, and 15 to 273.

| Pages | Chapter |
| --- | --- |
| v to xiii | Preface |
| 15 to 39 | 1 |
| 40 to 65 | 2 |
| 66 to 108 | 3 |
| 109 to 146 | 4 |
| 147 to 170 | 5 |
| 171 to 201 | 6 |
| 202 to 228 | 7, 8 |
| 229 to 273 | 9 |

## Printer's errors in references

The app uses the verse in the right column. The words of the prayer are from that verse.

| Page | Print | App |
| --- | --- | --- |
| 23 | `Rom. x. 33` | Rom 11:33 |
| 25 | `Psa. xcii. 5` | Ps 92:15 |
| 25 | `Psa. xciii. 15` | Ps 93:5 |
| 25 to 26 | `Psa. c. 5` and `Psa. cxvii. 2`, in the wrong order | Ps 117:2, then Ps 100:5 |
| 31 | `Psa. xxxii. 9, 10` | Ps 22:9-10 |
| 41 | `Psa. xc. 12` | Ps 90:11 |
| 45 | `Eccl. xi. 19` | Eccl 11:9 |
| 70 | `Exod. xxxvi. 7` | Exod 34:7 |
| 70 | `1 Sam. xi. 7` | Ps 11:7 |
| 84 | `Acts xviii. 29` | Acts 18:24 |
| 95 | `xx. 21` (Proverbs) | Prov 10:21 |
| 99 | `Prov. v. 6` | Prov 3:6 |
| 105 | `Matt. vi. 48` | Matt 6:33 |
| 115 | `1 Cor. vi. 10, 20` | 1 Cor 6:19, 20 |
| 121 | `John vi. 30` | John 6:39 |
| 133 | `Matt. xiii. 41, 44` | Matt 13:41, 43 |
| 142 | `Psa. lxxiii. 2, 3` | Ps 73:2, 23 |
| 144 | `Isa. lxv. 25` | Isa 65:24 |
| 159 | `Jer. vii. 12, 41` | Jer 7:12, 14 |
| 163 | `Num. x. 33, 36` | Num 10:35-36 |
| 164 | `xlix. 7` (Psalms) | Ps 47:9 |
| 181 | `Eph. v. 8, 18` | Eph 5:9, 18 |
| 182 | `1 Cor. xi. 20` | 1 Cor 11:26 |
| 186 | `2 Tim. i. 13` | 1 Tim 1:12 |
| 195 | `Luke xxi. 9` | Luke 21:19 |
| 195 | `Matt. v. 15` | Mark 5:15 |
| 196 | `1 Tim. ii. 13` | 1 Tim 2:15 |
| 218 | `Eph. i. 12` | Eph 1:11 |
| 225 | `1 Cor. x. 31` | 1 Cor 10:13 |

The preface has no links to verses. On page xi, the text keeps `Psa. lxxxvi. 7` as printed. The
words are from Ps 87:7.

## Misprints that the app corrects

| Page | Print | App |
| --- | --- | --- |
| 38 | `exceeeding` | exceeding |
| 47 | `brokeh` | broken |
| 51 | `np` | up |
| 54 | `frowarduess` | frowardness |
| 87 | `thanskgiving` | thanksgiving |
| 131 | `sceing` | seeing |
| 179 | `wordly` | worldly |
| 238 | `wordly` | worldly |
| 271 | `re deemed`, with no hyphen at the end of the line | redeemed |

## Decisions on the structure

- Page 16: `Having thus engaged our hearts` is in large type. It is a head at level 1.
- Page 29: the head on the three persons has no printed number. It stays with no number.
- Page 40: the print has `In this part of our work,` in large type. It is now the second
  paragraph of the chapter 2 introduction. An earlier fix removed it.
- Page 87: the list from `1. We must pray for faith` is at level 4, under `5. To sanctify our
  nature`. The list `(1.)` to `(7.)` under head 12 of that list is at level 5.
- Page 111: the print numbers the second top head of chapter 4 `1.`. The app keeps the printed
  number.
- Pages 113 to 146: the lists under `1st` and `2dly` are at level 5. An earlier fix shows `1st` and
  `2dly` as `(1.)` and `(2.)`.
- Page 207: the Lord's Prayer is in small capitals. The app shows it in normal case.

## Open questions

These items stay as the text shows them now. A person with the book in hand can make a decision.

| Page | Text now | Other reading |
| --- | --- | --- |
| vii | `prævisam` (Latin) | `prœvisam`. The ligature is not clear. |
| 18 | `James i. 17.` | The full stop is very faint. |
| 45 | `the mind. Hosea` | The print can have two dots. The second dot can be a speck. |
| 91 | `our own selves` | `ownselves`. The line is tight. |
| 99 | 1 Cor 7:21 | The word `freemen` is in verse 22. |
| 120 | Eph 1:4, 6 | The prayer also uses verse 5. |
| 131 | `that they all may be one` | A low dot after `they` can be a mark of the print. |
| 174 | `rest a while And now` | The print has no full stop here. |
| 203 | Heb 13:20 | The prayer also uses verse 21. |
| 259 | `this night, and` | A small mark above the comma. |
| 273 | `covenant love` | `covenant-love`. The hyphen is at the end of a line. |

## Forms that the print has

The test `the text has no OCR artefacts` in `scripts/parser.test.mjs` finds marks that the OCR
leaves. These forms are in the print, so the test accepts them:

- Page 79: `lusts;, that walking`.
