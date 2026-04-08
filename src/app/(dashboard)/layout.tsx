'use client'

import Sidebar from '@/components/layout/Sidebar'
import { AuthProvider } from '@/contexts/AuthContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
