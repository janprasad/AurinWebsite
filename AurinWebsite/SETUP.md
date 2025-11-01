# Setup Guide

## Setting up CLERK_JWT_ISSUER_DOMAIN in Convex

### Step 1: Get Your Clerk JWT Issuer Domain

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **"JWT Templates"** in the left sidebar
4. Look for a template named **"convex"** (or create one if it doesn't exist)
   - If creating new: Click "New template" → Name it "convex" → Use default settings
5. Copy the **Issuer URL** - it looks like: `https://your-app-name.clerk.accounts.dev`

### Step 2: Add to Convex Dashboard

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your **deployment** (or create one if you haven't)
3. In the left sidebar, click **"Settings"**
4. Click on **"Environment Variables"** tab
5. Click **"Add Variable"** button
6. Fill in:
   - **Name**: `CLERK_JWT_ISSUER_DOMAIN`
   - **Value**: Paste your Clerk Issuer URL (e.g., `https://your-app-name.clerk.accounts.dev`)
7. Click **"Save"**

### Step 3: Verify Configuration

The `convex/auth.config.ts` file is already configured to use this environment variable:

```typescript
domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
```

### Step 4: Restart Convex (if needed)

If Convex is already running, you may need to restart it for the environment variable to take effect:

```bash
# Stop Convex (Ctrl+C) and restart
npm run dev
```

## Complete Environment Setup Checklist

### Local Environment Variables (.env.local)

Create a `.env.local` file in the root directory with:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url_from_dashboard

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Convex Dashboard Environment Variables

Set these in the Convex Dashboard (Settings → Environment Variables):

- `CLERK_JWT_ISSUER_DOMAIN` - Your Clerk JWT template issuer URL

## Troubleshooting

### Authentication not working?

1. ✅ Check that `CLERK_JWT_ISSUER_DOMAIN` is set in Convex Dashboard
2. ✅ Verify the Issuer URL matches exactly (no trailing slashes)
3. ✅ Ensure your Clerk JWT template is named "convex" or matches the template you're using
4. ✅ Check that `.env.local` has `NEXT_PUBLIC_CONVEX_URL` set correctly
5. ✅ Restart both Next.js and Convex dev servers

### Where to find values:

- **Convex URL**: Convex Dashboard → Deployment → Settings → Copy deployment URL
- **Clerk Keys**: Clerk Dashboard → API Keys section
- **Clerk Issuer**: Clerk Dashboard → JWT Templates → Issuer URL


