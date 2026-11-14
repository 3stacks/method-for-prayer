import Link from 'next/link'

import { GridPattern } from '@/components/GridPattern'
import { APP_URL, KOFI_URL } from '@/lib/site'

export function Footer() {
  return (
    <footer className="relative pt-5 pb-20 sm:pt-14 sm:pb-32">
      <div className="absolute inset-x-0 top-0 h-32 mask-[linear-gradient(white,transparent)] text-slate-900/10 dark:text-white/10">
        <GridPattern x="50%" />
      </div>
      <div className="relative flex flex-col items-center gap-4 text-center font-ui text-sm text-slate-600 dark:text-slate-400">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-medium text-slate-900 dark:text-slate-100">
          <Link href="/">Home</Link>
          <a href={APP_URL}>Open in your browser</a>
          <a href="/app/book">The book</a>
          <a href="/app/occasions">Occasions</a>
          <a href={KOFI_URL}>Ko-fi</a>
          <Link href="/privacy/">Privacy</Link>
        </nav>
        <p>Made by Luke Boyle. Free to use.</p>
      </div>
    </footer>
  )
}
