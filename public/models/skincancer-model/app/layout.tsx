import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Melanoma Detection',
  description: 'AI-powered skin cancer melanoma detection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
