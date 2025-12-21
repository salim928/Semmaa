// app/providers.tsx
'use client'

import { AuthProvider, AppProvider } from '@/context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>
        {children}
      </AppProvider>
    </AuthProvider>
  )
}
