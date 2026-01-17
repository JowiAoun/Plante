# Authentication & User Registration Specification

> **Google OAuth with Profile Setup Flow**

This document specifies the authentication system using **Google OAuth** via NextAuth.js, with a complete user registration flow including avatar selection, username, and display name.

---

## Prerequisites

Before implementing this feature, ensure the following are completed:

### Required Infrastructure
- [ ] **MongoDB Database** — Complete setup per [MONGODB.md](./MONGODB.md)
- [ ] **MongoDB Adapter for NextAuth** — Included in MongoDB setup

### Google OAuth Setup
- [ ] **Google Cloud Project** — Create at [console.cloud.google.com](https://console.cloud.google.com)
- [ ] **OAuth Consent Screen** — Configure with app name, logo, scopes (email, profile)
- [ ] **OAuth Credentials** — Create credentials at APIs & Credentials → OAuth 2.0 Client IDs
- [ ] **Authorized Redirect URIs** — Add `http://localhost:3000/api/auth/callback/google` (dev) and production URL

### Dependencies to Install
```bash
npm install @dicebear/core @dicebear/collection
```

> **Note:** MongoDB dependencies are installed as part of the [MONGODB.md](./MONGODB.md) setup.

### Environment Configuration
- [ ] Add `GOOGLE_CLIENT_ID` to `.env` (existing)
- [ ] Add `GOOGLE_CLIENT_SECRET` to `.env` (existing)
- [ ] Add `NEXTAUTH_SECRET` to `.env` (existing)
- [ ] Add `MONGODB_URI` to `.env` — See [MONGODB.md](./MONGODB.md)

---

## Overview

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   /login    │ ──▶ │ Google OAuth│ ──▶ │  New User?  │ ──▶ │  /dashboard │
│             │     │   Sign In   │     │             │     │             │
└─────────────┘     └─────────────┘     └──────┬──────┘     └─────────────┘
                                               │ Yes
                                               ▼
                                        ┌─────────────┐
                                        │/profile-setup│
                                        │  Avatar +   │
                                        │  Username   │
                                        └─────────────┘
```

### Key Features

| Feature | Description |
|---------|-------------|
| **Google-Only Auth** | Single sign-on with Google accounts |
| **Profile Setup** | First-time users complete profile before accessing app |
| **Avatar Selection** | Randomizable DiceBear avatar with seed |
| **Username System** | Unique usernames for social features |
| **Persistent Sessions** | JWT-based sessions stored securely |

---

## Data Model

> **Full Schema:** See the `users` collection in [MONGODB.md](./MONGODB.md) for the complete User schema.

### Username Validation Rules

```typescript
const usernameRules = {
  minLength: 3,
  maxLength: 20,
  pattern: /^[a-z0-9_]+$/,  // lowercase, numbers, underscores only
  reserved: ['admin', 'plante', 'system', 'api', 'null', 'undefined'],
};
```

---

## Pages & Components

### `/login` — Login Page

```
┌───────────────────────────────────────┐
│                                       │
│            🌱 Plante                  │
│                                       │
│      "Grow your plants with care"     │
│                                       │
│   ┌─────────────────────────────┐    │
│   │   🔵 Continue with Google   │    │
│   └─────────────────────────────┘    │
│                                       │
│        Already have an account?       │
│        You'll be signed in.           │
│                                       │
└───────────────────────────────────────┘
```

**Components:**
- `LoginPage` — Page container
- `GoogleSignInButton` — Styled OAuth trigger

**Behavior:**
- If already authenticated → redirect to `/dashboard`
- If new user after OAuth → redirect to `/profile-setup`
- If returning user → redirect to `/dashboard`

---

### `/profile-setup` — Profile Setup Page

```
┌───────────────────────────────────────┐
│                                       │
│        Welcome to Plante! 🌱          │
│        Let's set up your profile      │
│                                       │
│   ┌───────────────────────────────┐   │
│   │                               │   │
│   │      [ Avatar Preview ]       │   │
│   │         (48x48 px)            │   │
│   │                               │   │
│   │    [ 🎲 Randomize Avatar ]    │   │
│   │                               │   │
│   └───────────────────────────────┘   │
│                                       │
│   Display Name                        │
│   ┌─────────────────────────────┐    │
│   │ Alex Green                   │    │
│   └─────────────────────────────┘    │
│                                       │
│   Username                            │
│   ┌─────────────────────────────┐    │
│   │ @alexgreen                   │    │
│   └─────────────────────────────┘    │
│   ✓ Username available                │
│                                       │
│   ┌─────────────────────────────┐    │
│   │      Complete Setup          │    │
│   └─────────────────────────────┘    │
│                                       │
└───────────────────────────────────────┘
```

**Components:**
- `ProfileSetupPage` — Page container with form
- `AvatarPicker` — Avatar preview + randomize button
- `UsernameInput` — With real-time availability check
- `DisplayNameInput` — Simple text input

**Behavior:**
- Only accessible to authenticated users without completed profile
- Username checked for availability on blur/debounce
- Avatar seed randomized on button click
- On submit → save to MongoDB → redirect to `/dashboard`

---

## New Components Required

| Component | Purpose | Props |
|-----------|---------|-------|
| `GoogleSignInButton` | OAuth trigger button | `callbackUrl?` |
| `AvatarPicker` | Avatar selection with randomize | `seed`, `onSeedChange`, `size` |
| `UsernameInput` | Username with availability check | `value`, `onChange`, `error`, `isAvailable` |
| `ProfileSetupForm` | Complete profile setup form | `onSubmit`, `isLoading` |

---

## API Routes

### Check Username Availability

```
GET /api/auth/check-username?username={username}
```

**Response:**
```typescript
{
  available: boolean;
  reason?: 'taken' | 'invalid' | 'reserved';
}
```

### Complete Profile Setup

```
POST /api/auth/complete-profile
```

**Request Body:**
```typescript
{
  username: string;
  displayName: string;
  avatarSeed: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  user?: User;
  error?: string;
}
```

---

## NextAuth Configuration Updates

### MongoDB Adapter

```typescript
// lib/auth.ts
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './mongodb';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
    newUser: '/profile-setup',
  },
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = token.sub || user?.id;
        session.user.username = token.username as string;
        session.user.displayName = token.displayName as string;
        session.user.avatarSeed = token.avatarSeed as string;
        session.user.level = token.level as number;
        session.user.xp = token.xp as number;
        session.user.profileCompleted = !!token.profileCompletedAt;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.username = user.username;
        token.displayName = user.displayName;
        token.avatarSeed = user.avatarSeed;
        token.level = user.level ?? 1;
        token.xp = user.xp ?? 0;
        token.profileCompletedAt = user.profileCompletedAt;
      }
      // Profile update
      if (trigger === 'update' && session) {
        token.username = session.username;
        token.displayName = session.displayName;
        token.avatarSeed = session.avatarSeed;
      }
      return token;
    },
    async redirect({ url, baseUrl, token }) {
      // Redirect to profile-setup if profile not completed
      if (!token?.profileCompletedAt) {
        return `${baseUrl}/profile-setup`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  session: { strategy: 'jwt' },
  secret: env.NEXTAUTH_SECRET,
};
```

### Extended Session Types

```typescript
// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      email?: string | null;
      image?: string | null;
      // Custom fields
      username?: string;
      displayName?: string;
      avatarSeed?: string;
      level?: number;
      xp?: number;
      profileCompleted?: boolean;
    };
  }
  
  interface User {
    username?: string;
    displayName?: string;
    avatarSeed?: string;
    level?: number;
    xp?: number;
    profileCompletedAt?: Date;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username?: string;
    displayName?: string;
    avatarSeed?: string;
    level?: number;
    xp?: number;
    profileCompletedAt?: Date;
  }
}
```

---

## MongoDB Setup

> **Full Details:** See [MONGODB.md](./MONGODB.md) for connection setup, indexes, and schema details.

---

## Avatar System (DiceBear)

### Implementation

```typescript
// utils/avatar.ts
import { createAvatar } from '@dicebear/core';
import { pixelArt } from '@dicebear/collection';

export function generateAvatarUrl(seed: string, size: number = 48): string {
  const avatar = createAvatar(pixelArt, {
    seed,
    size,
    backgroundColor: ['transparent'],
  });
  return avatar.toDataUri();
}

export function randomAvatarSeed(): string {
  return Math.random().toString(36).substring(2, 15);
}
```

### Avatar Component

```tsx
interface AvatarPickerProps {
  seed: string;
  onSeedChange: (seed: string) => void;
  size?: number;
}

function AvatarPicker({ seed, onSeedChange, size = 96 }: AvatarPickerProps) {
  return (
    <div className="avatar-picker">
      <img 
        src={generateAvatarUrl(seed, size)} 
        alt="Your avatar"
        style={{ imageRendering: 'pixelated' }}
      />
      <ActionButton 
        onClick={() => onSeedChange(randomAvatarSeed())}
        variant="secondary"
      >
        🎲 Randomize
      </ActionButton>
    </div>
  );
}
```

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| **Username enumeration** | Rate limit `/check-username` endpoint |
| **Session hijacking** | Use secure, httpOnly cookies via NextAuth |
| **OAuth token theft** | Never expose tokens to client |
| **Profile tampering** | Validate all inputs server-side |
| **CSRF** | NextAuth handles CSRF tokens automatically |

---

## Middleware Protection

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isProfileSetup = req.nextUrl.pathname === '/profile-setup';
    
    // Redirect to profile-setup if profile not completed
    if (!isProfileSetup && !token?.profileCompletedAt) {
      return NextResponse.redirect(new URL('/profile-setup', req.url));
    }
    
    // Redirect away from profile-setup if already completed
    if (isProfileSetup && token?.profileCompletedAt) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/farms/:path*', '/profile/:path*', '/profile-setup'],
};
```

---

## Migration from Mock Data

### Steps to Replace Mocks

1. **User Data** — Replace `mocks/users.ts` with MongoDB queries
2. **Session Data** — Use `useSession()` from next-auth/react
3. **API Calls** — Update services to fetch from `/api/*` routes
4. **Components** — Update to use real session user data

```typescript
// Before (mock)
const user = mockUsers[0];

// After (real)
import { useSession } from 'next-auth/react';
const { data: session } = useSession();
const user = session?.user;
```

---

## Dependencies

```json
{
  "@dicebear/core": "^8.0.0",
  "@dicebear/collection": "^8.0.0"
}
```

Install with:
```bash
npm install @dicebear/core @dicebear/collection
```

> **Note:** MongoDB dependencies (`mongodb`, `@auth/mongodb-adapter`) are covered in [MONGODB.md](./MONGODB.md).
