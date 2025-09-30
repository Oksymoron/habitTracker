# Setup Instructions

## 1. Initialize Convex

Run this command to set up Convex (you'll need to login/create account):

```bash
npx convex dev
```

This will:
- Prompt you to login to Convex (or create free account)
- Create a new Convex project
- Generate `.env.local` with your `NEXT_PUBLIC_CONVEX_URL`
- Start the Convex dev server
- Generate TypeScript types in `convex/_generated/`

**Keep this terminal running** - it watches for Convex function changes.

## 2. Start Next.js Dev Server

In a **new terminal**, run:

```bash
npm run dev
```

Open http://localhost:3000

## 3. Deploy to Vercel

### Push to GitHub first:
```bash
git init
git add .
git commit -m "Initial meditation tracker"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Deploy on Vercel:
1. Go to https://vercel.com
2. Import your GitHub repository
3. Vercel will auto-detect Next.js
4. Add Environment Variable:
   - Key: `NEXT_PUBLIC_CONVEX_URL`
   - Value: (copy from your `.env.local` file)
5. Click Deploy!

### Deploy Convex:
```bash
npx convex deploy
```

This creates a production Convex deployment. Update the Vercel environment variable with the production URL if needed.

## How It Works

- **Convex** = Real-time database (both you and Magda see updates instantly)
- **Vercel** = Hosts the website
- **Free tier** = Plenty for 2 users!

Your meditation data will sync across all devices in real-time! 🔥
