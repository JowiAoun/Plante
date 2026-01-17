'use client'

import { AppShell } from '@/components/AppShell'
import { mockNotifications, mockUsers } from '@/mocks/data'

const Museum = () => (
  <div>
    <h1 style={{ fontFamily: 'var(--font-game)', fontSize: '20px', color: 'var(--color-accent)', marginBottom: '16px' }}>
      Museum
    </h1>
    <p style={{ color: 'var(--color-text-muted)' }}>
      Your plant collection and exhibits will appear here.
    </p>
  </div>
)

export default function MuseumPage() {
  const currentUser = mockUsers[0]
  return (
    <AppShell 
      user={currentUser} 
      notifications={mockNotifications} 
    >
      <Museum />
    </AppShell>
  )
}
