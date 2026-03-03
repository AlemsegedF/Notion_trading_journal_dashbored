import './globals.css'

export const metadata = {
  title: 'Trading Journal Dashboard',
  description: 'Track and analyze trading performance',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
