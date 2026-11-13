// Finish the web build after "expo export --platform web" and scripts/seo.mjs.
//
//   node scripts/web-postbuild.mjs [dist]
//
// Copies the app icon to apple-touch-icon.png, for the home screen of iOS and
// for the Open Graph image.
import { copyFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(new URL('.', import.meta.url).pathname, '..')
const dist = process.argv[2] ?? join(root, 'dist')
copyFileSync(join(root, 'assets/icon.png'), join(dist, 'apple-touch-icon.png'))
console.log('web-postbuild: apple-touch-icon.png')
