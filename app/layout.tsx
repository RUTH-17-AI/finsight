import type { Metadata } from 'next'
import { DM_Sans, DM_Mono, Fraunces } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  weight: ['300', '400', '500'],
  variable: '--font-sans'
})

const dmMono = DM_Mono({ 
  subsets: ["latin"],
  weight: ['400', '500'],
  variable: '--font-mono'
})

const fraunces = Fraunces({ 
  subsets: ["latin"],
  weight: ['300', '400'],
  variable: '--font-serif'
})

export const metadata: Metadata = {
  title: 'FinSight — Finance Dashboard',
  description: 'Personal finance dashboard for tracking income, expenses, and insights',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${dmMono.variable} ${fraunces.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
