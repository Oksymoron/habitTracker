# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meditation tracking application with Greek/Stoic philosophy theme. Tracks daily meditation practice for two users (Michał and Magda) with streaks, monthly heatmaps, and rotating philosophical quotes.

## Tech Stack

**Current Stack:**
- **Next.js 15** with App Router
- **React 19** (functional components with hooks)
- **TypeScript** (configured but optional)
- **Tailwind CSS 4** (using @tailwindcss/postcss)
- **Convex** - Real-time serverless database
- **PWA** - Progressive Web App with service worker

**Design Theme:**
- Greek/Ancient philosophy aesthetic (Stoic/Cynic quotes)
- Custom fonts: Cinzel (headings), Crimson Text (body)
- Athens background image with overlay
- Greek-inspired UI elements (🏛️ temple, 🏺 amphora icons)

## Development Commands

```bash
npm run dev        # Start Next.js dev server (port 3000)
npm run build      # Build for production
npm run start      # Run production build
npm run lint       # Run ESLint

# Convex (run in separate terminal)
npx convex dev     # Start Convex development server
npx convex deploy  # Deploy Convex to production
```

## Code Architecture

### Database Schema (Convex)
- **meditations** table tracks daily entries
  - `date`: string ('YYYY-MM-DD')
  - `person1`: boolean (Michał's meditation status)
  - `person2`: boolean (Magda's meditation status)
  - Index: `by_date` for fast date lookups

### Convex Functions
- **Query: `getAll`** - Fetches all meditation entries
- **Mutation: `toggleMeditation`** - Toggle meditation status for a person on a date
  - Creates new entry if date doesn't exist
  - Updates existing entry if date exists

### App Structure
- `app/layout.tsx` - Root layout with ConvexProvider (Client Component)
  - Initializes Convex client with `NEXT_PUBLIC_CONVEX_URL`
  - PWA manifest and iOS meta tags
  - Service worker registration
- `app/page.tsx` - Main page (Client Component)
  - Meditation toggles for both users
  - Streak calculation (consecutive days)
  - Monthly heatmap calendar
  - Random Stoic/Cynic quote on page load

### Key Features
1. **Daily Meditation Tracking** - Toggle buttons for each person
2. **Streak Calculation** - Counts consecutive days backwards from today
3. **Monthly Heatmap** - Visual calendar showing meditation days
4. **Month Navigation** - Browse historical data by month/year
5. **Celebration Animation** - Lightning bolt (⚡) on completion
6. **PWA Support** - Installable, works offline, iOS optimized

### PWA Configuration
- Manifest: `public/manifest.json`
- Service Worker: `public/sw.js`
- Icons: `public/icons/` (192px, 512px, maskable variants, iOS touch icon)

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
```

### Component Patterns
- Use functional components with hooks
- Client Components: Use `'use client'` directive when needed for:
  - State management (useState, useEffect)
  - Convex hooks (useQuery, useMutation)
  - Browser APIs (service worker, localStorage)
  - Event handlers (onClick, etc.)
- Explain hook usage and why Client Component is needed

### Convex Patterns
- Queries: Read-only data fetching
- Mutations: Data modification (create, update, delete)
- Use `withIndex()` for efficient lookups
- Handle missing data with `?? []` or `.first()` null checks