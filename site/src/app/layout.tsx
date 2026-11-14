import { type Metadata, type Viewport } from 'next'
import { Source_Serif_4 } from 'next/font/google'
import clsx from 'clsx'

import { ANALYTICS_LOADER } from '@/lib/analytics'
import { SITE_URL } from '@/lib/site'
import '@/styles/tailwind.css'

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
})

const DESCRIPTION =
  'Pray in the words of Scripture with Matthew Henry’s A Method for Prayer (1710). A guided prayer in six parts, the whole book, and prayers for occasions. Free, with no account.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'A Method for Prayer: pray in the words of Scripture',
    template: '%s | A Method for Prayer',
  },
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  icons: {
    icon: '/app/favicon.ico',
    apple: '/app/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'A Method for Prayer',
    description: DESCRIPTION,
    images: ['/app/apple-touch-icon.png'],
  },
  twitter: { card: 'summary' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1f4d3a' },
    { media: '(prefers-color-scheme: dark)', color: '#111814' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en-GB"
      className={clsx(
        'h-full scroll-smooth bg-paper text-slate-900 antialiased dark:bg-night dark:text-slate-100',
        sourceSerif.variable,
      )}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: ANALYTICS_LOADER }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
