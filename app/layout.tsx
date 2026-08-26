import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Acquisition Authentik',
  description: 'Pipeline de qualification clubs premium — Phase 1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
