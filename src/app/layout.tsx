import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '醫Me 醫師 CRM',
  description: '醫師客戶關係管理系統',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
