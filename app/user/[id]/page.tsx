'use client'

import React, { use } from 'react'
import Link from 'next/link'
import { Profile } from '@/components/pages/Profile/Profile'
import { mockUsers } from '@/mocks/data'

interface UserPageProps {
  params: Promise<{ id: string }>
}

export default function UserPage({ params }: UserPageProps) {
  const { id } = use(params)
  const user = mockUsers.find(u => u.id === id)

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ 
          fontFamily: 'var(--font-game)', 
          color: 'var(--color-critical)',
          marginBottom: '16px' 
        }}>
          User Not Found
        </h1>
        <p style={{ 
          fontFamily: 'var(--font-ui)', 
          color: 'var(--color-text-muted)', 
          marginBottom: '32px' 
        }}>
          The farmer you are looking for ({id}) could not be located.
        </p>
        <Link href="/" className="nes-btn is-primary">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="user-profile-page" style={{ padding: '20px' }}>
       <div style={{ maxWidth: '600px', margin: '0 auto 20px auto' }}>
          <Link href="/" style={{ 
            fontFamily: 'var(--font-game)', 
            color: 'var(--color-text-muted)', 
            textDecoration: 'none',
            fontSize: '12px',
            display: 'inline-block',
            padding: '8px'
          }}>
            ← Back
          </Link>
       </div>
       <Profile user={user} isOwnProfile={false} />
    </div>
  )
}
