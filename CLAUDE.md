# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Habit tracking application built for learning modern web development. The user is learning, so code should be educational with explanatory comments.

## Tech Stack

### Frontend
- **Next.js 14+** with App Router (NOT Pages Router)
- **React 18+** (functional components only)
- **TypeScript** optional (JavaScript is fine for learning)
- **Tailwind CSS** for styling (NO plain CSS files)
- **shadcn/ui** for UI components
- **Framer Motion** for animations (when needed)

### Backend & Database
- **Convex** (primary choice - real-time, serverless)
- Alternatives: Supabase or PocketBase (only if specifically requested)
- NEVER suggest: Firebase, custom Node.js backends, MongoDB

### Authentication
- **Clerk.dev** (NOT NextAuth or Auth0)

### Payments
- **Stripe** (embedded checkout)
- **Lemon Squeezy** (alternative for global markets)

### File Storage
- **Uploadthing** (simple uploads)
- **Cloudflare R2** (large-scale storage)

### AI Integration
- **Vercel AI SDK**
- **Google Gemini** (vision/image analysis)
- **OpenAI/Anthropic** (text generation)

### Deployment
- **Vercel** for hosting
- **Cloudflare** for DNS/CDN

## Coding Standards

### Educational Comments Required
ALWAYS include explanatory comments for learning purposes:

```javascript
// ✅ GOOD - Educational
const handleSubmit = async (e) => {
  // Prevent default form submission (would reload page)
  e.preventDefault();

  // Fetch is native browser API for HTTP requests
  // async/await makes asynchronous code look synchronous
  await fetch('/api/submit', {
    method: 'POST', // HTTP method (GET, POST, PUT, DELETE)
    body: JSON.stringify(data) // Convert JS object to JSON string
  });
};

// ❌ BAD - No learning value
const handleSubmit = async (e) => {
  e.preventDefault();
  await fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};
```

### Component Structure
- Use functional components with hooks
- Keep components small and focused
- Explain hook usage (useState, useEffect, etc.)
- Comment complex logic and why it's needed

### Code Organization
- Follow Next.js App Router conventions
- Use Server Components by default
- Add 'use client' only when needed (explain why)
- Keep API routes in app/api/

## Development Commands

### Development
```bash
# Terminal 1: Start Convex dev server (watches convex/ folder)
npx convex dev

# Terminal 2: Start Next.js dev server
npm run dev         # http://localhost:3000
```

### Production Build
```bash
npm run build      # Build Next.js for production
npm run start      # Start production server
npm run lint       # Run ESLint

npx convex deploy  # Deploy Convex functions to production
```

## Project Architecture

### Application Structure
- **Next.js App Router**: Single-page app in `app/page.tsx` with root layout in `app/layout.tsx`
- **Convex Backend**: Real-time database functions in `convex/` directory
- **No API Routes**: All backend logic handled by Convex mutations and queries

### Convex Integration
- Database schema defined in `convex/schema.ts`
- Functions in `convex/meditations.ts`:
  - `getAll`: Query to fetch all meditation entries
  - `toggleMeditation`: Mutation to toggle meditation status for a person on a date
- ConvexProvider wraps app in `layout.tsx` to enable real-time data sync
- Use `useQuery` and `useMutation` hooks in client components

### Data Model
```typescript
meditations: {
  date: string,      // 'YYYY-MM-DD'
  person1: boolean,  // Michał's meditation status
  person2: boolean,  // Magda's meditation status
  _id: Id<"meditations">,
  _creationTime: number
}
```
- Indexed by date for fast lookups
- Real-time sync across all connected clients

### Environment Variables
```
NEXT_PUBLIC_CONVEX_URL=https://perceptive-zebra-661.convex.cloud
```
Set in `.env.local` for development (created by `npx convex dev`)

### PWA Configuration
- Progressive Web App enabled via `public/manifest.json`
- iOS-specific meta tags in layout for home screen installation
- Icons in `public/icons/`