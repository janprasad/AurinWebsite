# Welcome to your Convex + Next.js + Clerk app

This is a [Convex](https://convex.dev/) project created with [`npm create convex`](https://www.npmjs.com/package/create-convex).

After the initial setup (<2 minutes) you'll have a working full-stack app using:

- Convex as your backend (database, server logic)
- [React](https://react.dev/) as your frontend (web page interactivity)
- [Next.js](https://nextjs.org/) for optimized web hosting and page routing
- [Tailwind](https://tailwindcss.com/) for building great looking accessible UI
- [Clerk](https://clerk.com/) for authentication

## Get started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

You'll need to fill in:

**From Convex Dashboard:**
- `NEXT_PUBLIC_CONVEX_URL` - Get this from https://dashboard.convex.dev after creating a project

**From Clerk Dashboard:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Get from https://dashboard.clerk.com
- `CLERK_SECRET_KEY` - Get from https://dashboard.clerk.com

**Optional (for integrations):**
- `HYPERSPELL_CLIENT_ID` and `HYPERSPELL_CLIENT_SECRET`
- `MOSS_CLIENT_ID` and `MOSS_CLIENT_SECRET`

### 3. Configure Clerk with Convex

1. Open your app. There should be a "Claim your application" button from Clerk in the bottom right of your app.
2. Follow the steps to claim your application and link it to this app.
3. Follow step 3 in the [Convex Clerk onboarding guide](https://docs.convex.dev/auth/clerk#get-started) to create a Convex JWT template.
4. **Important:** The Clerk provider is already enabled in `convex/auth.config.ts`
5. Add `CLERK_JWT_ISSUER_DOMAIN` to your Convex Dashboard:
   - Go to https://dashboard.convex.dev
   - Select your deployment
   - Go to Settings → Environment Variables
   - Add `CLERK_JWT_ISSUER_DOMAIN` with your Clerk JWT template issuer URL (e.g., `https://your-app.clerk.accounts.dev`)

### 4. Run the Development Server

```bash
npm run dev
```

This will start both the Next.js frontend and Convex backend.

If you want to sync Clerk user data via webhooks, check out this [example repo](https://github.com/thomasballinger/convex-clerk-users-table/).

## Learn more

To learn more about developing your project with Convex, check out:

- The [Tour of Convex](https://docs.convex.dev/get-started) for a thorough introduction to Convex principles.
- The rest of [Convex docs](https://docs.convex.dev/) to learn about all Convex features.
- [Stack](https://stack.convex.dev/) for in-depth articles on advanced topics.

## Join the community

Join thousands of developers building full-stack apps with Convex:

- Join the [Convex Discord community](https://convex.dev/community) to get help in real-time.
- Follow [Convex on GitHub](https://github.com/get-convex/), star and contribute to the open-source implementation of Convex.
