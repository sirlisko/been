# 🛫 BEEN 🛬

> Keep track of where you've BEEN 🌍 🌎 🌏 — [been.sirlisko.com](https://been.sirlisko.com/)

## Features

- Mark visited countries on a world map; progress counts the 195 UN states, other places count as territories
- Works without an account (saved in the browser); sign in with an email code to sync across devices
- Share a read-only map of your countries via link

## Setup

Supabase is optional: without it the app runs in local-only mode.

To enable accounts, copy `.env.example` to `.env` and fill in your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then, in the Supabase project:

- run the SQL in `supabase/migrations/` (in order)
- use `supabase/email-template-otp.html` as the Magic Link email template, so users receive a sign-in code

## Requirements

- Node.js 24

## Build

To install all the dependencies:

```bash
pnpm install
```

To start the project locally:

```bash
pnpm dev
```

To build:

```bash
pnpm build
```

To run tests:

```bash
pnpm test
```

## Under the hood

- [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for bundling and dev server
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Supabase](https://supabase.com/) for database and auth
- [Biome](https://biomejs.dev/) for linting and formatting
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for unit tests
- Deployed on [Netlify](https://www.netlify.com/)

## Previous version (tag 0.1)

A version with the old stack is available at git tag 0.1: https://github.com/sirlisko/been/tree/0.1

Old stack: Create React App, Firestore, ESLint + Prettier, Styled Components, Jest.
