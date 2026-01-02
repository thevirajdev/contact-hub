# Contact Hub

Simple contact management application built with Vite, React, TypeScript, Tailwind CSS, and shadcn/ui. Uses Supabase for backend services.

## Tech stack

- Vite
- React + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth/DB/Storage)

## Prerequisites

- Node.js 18+ and npm 9+
- A Supabase project with API credentials

## Local development

1. Clone the repository
   ```bash
   git clone <YOUR_GIT_URL>
   cd contact-hub-main
   ```
2. Create an `.env` file in the project root with the following variables:
   ```ini
   VITE_SUPABASE_URL="https://<YOUR_PROJECT_REF>.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="<YOUR_SUPABASE_ANON_KEY>"
   VITE_SUPABASE_PROJECT_ID="<YOUR_PROJECT_REF>"
   ```
   - Get these from Supabase Dashboard > Project Settings > API
   - Use the anon public key for the publishable key
3. Install dependencies and start dev server
   ```bash
   npm install
   npm run dev
   ```

## Build

```bash
npm run build
npm run preview
```

## Required environment variables

- VITE_SUPABASE_URL: https://<project-ref>.supabase.co
- VITE_SUPABASE_PUBLISHABLE_KEY: Supabase anon public key
- VITE_SUPABASE_PROJECT_ID: Supabase project ref (optional, used by some features)

Notes:
- Variables prefixed with `VITE_` are exposed to the browser; only use public/anon keys on the client.

## Deployment

Choose one of the static hosting options below. This is a Vite SPA that outputs to `dist`.

### Vercel
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: add all from the “Required environment variables” section
- Set “Install Command” to `npm install` (default)

### Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: add all from the “Required environment variables” section
- Optional: Add a `_redirects` file to support SPA routing if needed:
  ```
  /*  /index.html  200
  ```

### GitHub Pages (via Actions)
- Configure an action to build on `push` and deploy `dist` to `gh-pages`
- Ensure the site is served from the repository’s Pages settings

### Render (Static Site)
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: add all from the “Required environment variables” section

## Supabase configuration

- Create the project in Supabase and note the project ref and anon public key
- Configure Auth providers as needed
- Create tables/SQL per your app requirements

## Scripts

- `npm run dev` — Start dev server on http://localhost:8080
- `npm run build` — Production build into `dist`
- `npm run preview` — Preview the production build

## Troubleshooting

- 404s on client-side routes: add SPA redirects as noted above
- Supabase auth issues: confirm `VITE_*` vars are set in the hosting provider and the anon key is correct

