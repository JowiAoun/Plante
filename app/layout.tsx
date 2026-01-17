import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Plante - Pixel Plant Monitoring',
  description: 'A gamified pixel-art plant monitoring application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
