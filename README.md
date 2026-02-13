# Recipe Book Web Application

A modern, mobile-first recipe management application built with Next.js and Supabase. All UI in Spanish.

## Features

### Phase 1 - Manual Recipes ✅
- **Recipe CRUD**: Create, read, update, and delete your own recipes
- **Image Upload**: Upload recipe photos (with server-side magic byte validation)
- **Mobile-First Design**: Optimized for mobile devices with bottom navigation
- **Tag System**: Organize recipes with custom tags

### Phase 2 - Multi-Source Recipes ✅
- **TheMealDB API**: Browse recipes from the TheMealDB public API
- **AI Recipe Generation**: Generate recipes using Google Gemini (gemini-2.0-flash)
- **Multi-Source Search**: Search across all recipe sources simultaneously
- **Spanish UI**: Entire interface translated to Spanish

### Phase 3 - Shopping Lists ✅
- **Shopping Lists**: Create shopping lists from recipes
- **Smart Consolidation**: Automatically combine duplicate ingredients
- **Manual Items**: Add custom items to any list

### Phase 4 - Meal Planning (Next)
- **Meal Planning Calendar**: Plan meals for the week
- **Weekly Shopping Lists**: Generate shopping lists from your meal plan

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL + Storage)
- **AI**: Google Gemini (gemini-2.0-flash)
- **Validation**: Zod (all API inputs validated)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm or yarn
- A Supabase account (free tier is fine)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MrEddieGeek/recipe-book.git
   cd recipe-book
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard)
   - Run the migrations in `supabase/migrations/`
   - Create a storage bucket called `recipe-images` (set to public)

4. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```

   Required variables:
   - `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` — Your service role key (keep secret!)
   - `GEMINI_API_KEY` — Google Gemini API key (for AI recipe generation)

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/src
  /app                  # Next.js pages (App Router)
    /api                # API routes (all inputs Zod-validated)
  /components           # React components
    /ui                 # Reusable UI components
    /recipe             # Recipe-specific components
    /layout             # Layout components
  /lib
    /adapters           # Recipe source adapters (core architecture)
    /services           # Business logic
    /supabase           # Supabase clients
    /utils              # Utilities and validation schemas
/supabase
  /migrations           # Database migrations
```

## Architecture

This application uses a **modular adapter pattern** for recipe sources:

- **RecipeAdapter**: Abstract base class defining the interface
- **ManualRecipeAdapter**: Handles user-created recipes (Supabase)
- **ApiRecipeAdapter**: Integrates with TheMealDB
- **AiRecipeAdapter**: Generates recipes with Google Gemini

## Security

- All API inputs validated with Zod schemas
- File uploads validated via magic byte detection (not client MIME type)
- Security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- SQL LIKE wildcards escaped in search queries
- Generic error messages returned to clients (detailed logs server-side only)
- No debug/diagnostic routes in production

## Development

```bash
npm run dev       # Development server
npm run build     # Production build
npm start         # Production server
npm run lint      # ESLint
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

**Note**: After adding/changing env vars in Vercel, you must redeploy for them to take effect.

## License

MIT
