'use client' // Needed for Convex provider

import './globals.css'
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Initialize Convex client
// The NEXT_PUBLIC_CONVEX_URL will be set after running `npx convex dev`
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* ConvexProvider wraps the app to give access to Convex database */}
        <ConvexProvider client={convex}>
          {children}
        </ConvexProvider>
      </body>
    </html>
  )
}
