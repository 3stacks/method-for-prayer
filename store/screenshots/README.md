# Store screenshots

Upload the files in their order. They are slices of one wide picture, so the order is important.

- `ios/`: App Store, 6.9-inch iPhone, 1320 × 2868.
- `ios-6.3/`: App Store, 6.3-inch iPhone, 1206 × 2622. Use this set if App Store Connect asks for
  the 6.1-inch or the 6.3-inch display.
- `ipad/`: App Store, 13-inch iPad, 2064 × 2752. App Store Connect needs this set, because the app
  runs on the iPad.
- `play/`: Google Play, phone, 1080 × 1920.

Each `panorama.png` is the whole picture. Keep it for reference.

## How to make them again

The raw screens come from the web export of the app, at the size of an iPhone or an iPad.

```bash
npm run build
# Serve dist/ at /app on port 5191. Send a path with no file to index.html.
node store/screenshots/capture.cjs store/screenshots/raw http://127.0.0.1:5191/app   # needs playwright
node store/screenshots/compose.cjs store/screenshots/config.json store/screenshots ios ios-6.3 play   # needs sharp
```

For the iPad set, add `--ipad` to the capture. The raw screens go to `raw-ipad/`, at 1032 × 1376
with a scale of 2. Then make only the `ipad` target:

```bash
node store/screenshots/capture.cjs store/screenshots/raw-ipad http://127.0.0.1:5191/app --ipad
node store/screenshots/compose.cjs store/screenshots/config.json store/screenshots ipad
```

With no target, `compose.cjs` makes all four sets. The `ipad` target uses the same headlines and
the same order of screens, in an iPad frame.

`compose.cjs` needs the fonts Inter and Source Serif 4. `config.json` holds the colours, the
headlines and the order of the screens. `store/make-graphics.cjs` draws the icons and the Play
feature graphic. It also needs sharp.

## The bold set

`bold/` holds a second design, for a test against the first design. `compose-bold.cjs` draws it
from the same raw screens.

- The first card and the last card have a loud colour. One card in the middle is dark.
- Each headline has two to four words. The key word is large and italic.
- The phones tilt. Parts of each screen stand out of the phone at a larger size.

`bold.json` holds the colours, the headlines and the crops. The script needs `sharp`, and
`playwright` with its Chromium browser. The fonts are in `fonts/`.

```bash
NODE_PATH=<the node_modules with sharp and playwright> node compose-bold.cjs bold.json bold
```

### The iPad set

`bold/ipad/` holds the bold set for the 13-inch iPad. Each image is 2064 × 2752 px.
`compose-bold-ipad.cjs` draws the set from the raw iPad screens. `bold-ipad.json` holds the
colours, the headlines and the crops.

```bash
NODE_PATH=<the node_modules with sharp and playwright> node compose-bold-ipad.cjs bold-ipad.json bold/ipad
```
