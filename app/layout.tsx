import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { ReduxProvider } from '@/store/providers'

export const metadata:Metadata={
      title: 'Drawsurus- The ultimate Drawing and Guessing Game',
      description: 'Join Drawsurus for an exciting drawing and guessing experience with friends!',
      generator: 'Next.js'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
    return (
      <html lang='en'>
        <head>
        <style>{`
            html {
              font-family: ${GeistSans.style.fontFamily};
              --font-sans: ${GeistSans.variable};
              --font-mono: ${GeistMono.variable};
            }
        `}</style>
        </head>
        <body>
         <ReduxProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
         </ReduxProvider>
        </body>
      </html>
    )
}