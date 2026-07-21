import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono-geist',
})

export const metadata: Metadata = {
  title: 'Saarstahl Green-Steel Sales Simulator',
  description:
    'Stakeholder-specific green-steel sales-support pipeline: business value, objection-risk prediction, and sales preparation briefs for Saarstahl Pure Steel+. Academic prototype trained on synthetic data.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f6f8f7',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-background ${inter.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased overflow-hidden h-screen">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
