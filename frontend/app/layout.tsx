import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Archivo_Black, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { AppShell } from '@/components/shell/app-shell'
import { FleetDataProvider } from '@/components/shell/data-context'
import { AuthProvider } from '@/components/shell/auth-context'
import './globals.css'

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-archivo-black',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'REDLINE — Fleet Operations Console',
  description:
    'Smart transport operations platform. Vehicles, drivers, trips, maintenance, and cost analytics in one command console.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#160a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-background ${archivoBlack.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased font-sans grain">
        <AuthProvider>
          <FleetDataProvider>
            <AppShell>{children}</AppShell>
          </FleetDataProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
