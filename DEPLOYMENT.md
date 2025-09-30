# Deployment Information

## Production URLs

### Convex Backend
- **Production URL**: `https://perceptive-zebra-661.convex.cloud`
- **Dashboard**: https://dashboard.convex.dev

### Vercel Frontend
- **Repository**: https://github.com/Oksymoron/habitTracker
- **Vercel Dashboard**: https://vercel.com/dashboard

## Environment Variables (Vercel)

Make sure these are set in Vercel → Project Settings → Environment Variables:

```
NEXT_PUBLIC_CONVEX_URL=https://perceptive-zebra-661.convex.cloud
```

## Making Updates

### 1. Update Code Locally
Make your changes, then:

```bash
git add .
git commit -m "Your commit message"
git push
```

Vercel will automatically rebuild and deploy!

### 2. Update Convex Functions
If you modify files in `/convex` folder, they auto-deploy while `npx convex dev` is running.

For production:
```bash
npx convex deploy
```

## Testing

Once deployed, test these features:
- ✅ Click meditation buttons (data should persist)
- ✅ Open on two different devices (should sync in real-time)
- ✅ Check streak counter
- ✅ Navigate through different months
- ✅ Verify heatmap shows correct data

## Troubleshooting

**If buttons don't work:**
- Check Vercel environment variable is set correctly
- Check browser console for errors
- Verify Convex deployment is active in dashboard

**If data doesn't sync:**
- Make sure both devices are using the production URL
- Check Convex dashboard for errors
