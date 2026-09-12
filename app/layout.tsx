import type { Metadata } from 'next'
import './globals.css'
import { Probe } from './probe'

export const metadata: Metadata = {
  title: 'React ViewTransition repro',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Probe />
        {children}
      </body>
    </html>
  )
}
