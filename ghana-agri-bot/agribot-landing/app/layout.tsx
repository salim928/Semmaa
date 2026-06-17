// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import GoogleAnalytics from './components/GoogleAnalytics'
import { Providers } from './providers'
import { ThemeProvider } from '../context/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#16a34a' },
    { media: '(prefers-color-scheme: dark)', color: '#15803d' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://semma-ai.vercel.app'),
  title: {
    default: 'SEMMA-AI — Smarter Advice. Bigger Harvests.',
    template: '%s | SEMMA-AI',
  },
  description: 'AI-powered agricultural platform revolutionizing farming in Ghana with smart insights, digital marketplace, and community features.',
  keywords: 'agriculture, AI, farming, Ghana, marketplace, agritech, SEMMA-AI',
  formatDetection: { telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SemmaAI',
  },
  icons: {
    icon: [
      { url: '/logo.jpg', sizes: 'any', type: 'image/jpeg' },
    ],
    apple: '/logo.jpg',
    shortcut: '/logo.jpg',
  },
  openGraph: {
    title: 'SEMMA-AI - Smarter Advice. Bigger Harvests.',
    description: 'AI-powered agricultural platform revolutionizing farming in Ghana with smart insights and digital marketplace.',
    images: ['/logo.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <ThemeProvider>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW registered:', reg.scope))
                    .catch(err => console.log('SW registration failed:', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}