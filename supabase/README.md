# Supabase Database Setup

This directory contains database migration files for the Recipe Book application.

## Quick Start

1. Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard)

2. Go to the SQL Editor in your Supabase dashboard

3. Run the migrations in order:
   - First: `001_initial_schema.sql`
   - Second: `002_rls_policies.sql`

4. Set up Storage:
   - Go to Storage
   - Create a new bucket called `recipe-images`
   - Set it to **Public** (for read access)
   - Add policy to allow authenticated users to upload:
     ```sql
     CREATE POLICY "Authenticated users can upload images"
     ON storage.objects FOR INSERT
     TO authenticated
     WITH CHECK (bucket_id = 'recipe-images');
     ```

5. Enable Email Authentication:
   - Go to Authentication → Providers
   - Ensure Email provider is enabled

6. Copy your project credentials:
   - Go to Settings → API
   - Copy `Project URL` → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon/public` key → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key → Use as `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

7. Add credentials to `.env.local` in the project root

## Database Schema

### Tables

- **profiles**: User profile information (synced with auth.users)
- **recipes**: Recipe storage with support for manual, API, and AI sources
- **meal_plans**: Weekly meal planning with date and meal type
- **shopping_lists**: Shopping list containers
- **shopping_list_items**: Individual items in shopping lists

### Row Level Security

All tables have RLS enabled:
- Users can only access their own data
- Manual recipes belong to specific users
- API/AI recipes are readable by all (for discovery)
- Shopping list items inherit permissions from parent shopping list

## Local Development (Optional)

If you want to run Supabase locally:

```bash
npm install -g supabase
supabase init
supabase start
```

The migrations in this directory will be automatically applied.
