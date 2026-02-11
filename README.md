# Recipe Book Web Application

A modern, mobile-first recipe management application built with Next.js and Supabase.

## Features

### Phase 1 (MVP) ✅
- **Manual Recipe Management**: Create, read, update, and delete your own recipes
- **Authentication**: Secure user authentication with Supabase
- **Image Upload**: Upload recipe photos
- **Mobile-First Design**: Optimized for mobile devices with bottom navigation
- **Tag System**: Organize recipes with custom tags

### Phase 2 (Coming Soon)
- **Multi-Source Recipes**: Browse recipes from TheMealDB API
- **AI Recipe Generation**: Generate recipes using Claude AI
- **Multi-Source Search**: Search across all recipe sources simultaneously

### Phase 3 (Coming Soon)
- **Shopping Lists**: Create shopping lists from recipes
- **Smart Consolidation**: Automatically combine duplicate ingredients

### Phase 4 (Coming Soon)
- **Meal Planning Calendar**: Plan meals for the week
- **Weekly Shopping Lists**: Generate shopping lists from your meal plan

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm or yarn
- A Supabase account (free tier is fine)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd recipe-book
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard)
   - Run the migrations in `supabase/migrations/` (see [supabase/README.md](supabase/README.md))
   - Create a storage bucket called `recipe-images` (set to public)
   - Enable Email authentication

4. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (keep secret!)

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### First Steps

1. Click "Sign Up" to create an account
2. Click "New Recipe" to add your first recipe
3. Fill in the details, add ingredients and instructions
4. Save and view your recipe!

## Project Structure

```
/src
  /app                  # Next.js pages (App Router)
  /components           # React components
    /ui                 # Reusable UI components
    /recipe             # Recipe-specific components
    /layout             # Layout components
  /lib
    /adapters           # Recipe source adapters (core architecture)
    /services           # Business logic
    /supabase           # Supabase clients
    /utils              # Utilities and validation
/supabase
  /migrations           # Database migrations
```

## Architecture

This application uses a **modular adapter pattern** for recipe sources:

- **RecipeAdapter**: Abstract base class defining the interface
- **ManualRecipeAdapter**: Handles user-created recipes (Phase 1)
- **ApiRecipeAdapter**: Integrates with TheMealDB (Phase 2)
- **AiRecipeAdapter**: Generates recipes with Claude AI (Phase 2)

Adding new recipe sources is as simple as creating a new adapter class!

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically deploy on every push to your main branch.

## Contributing

This is a personal project, but feel free to fork and customize for your own use!

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
