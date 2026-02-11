# Recipe Book - Setup Guide

This guide will walk you through setting up the Recipe Book application from scratch.

## Prerequisites

- Node.js 18+ installed (20+ recommended for Supabase)
- A Supabase account (free tier is sufficient)
- Git installed

## Step 1: Supabase Project Setup

### 1.1 Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: recipe-book (or your preferred name)
   - **Database Password**: Create a strong password (save it somewhere safe)
   - **Region**: Choose closest to your location
5. Click "Create new project" and wait for it to initialize (~2 minutes)

### 1.2 Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the contents of `supabase/migrations/001_initial_schema.sql` from this project
4. Paste into the SQL editor and click "Run"
5. Create another new query
6. Copy the contents of `supabase/migrations/002_rls_policies.sql`
7. Paste and click "Run"

You should see success messages. Your database schema is now set up!

### 1.3 Set Up Storage

1. Go to **Storage** in the Supabase dashboard
2. Click "Create a new bucket"
3. Name it: `recipe-images`
4. Set it to **Public** bucket
5. Click "Create bucket"

#### Add Upload Policy

1. Click on the `recipe-images` bucket
2. Go to the "Policies" tab
3. Click "New Policy"
4. Select "Create policy from scratch"
5. Name: "Authenticated users can upload images"
6. Policy definition:
   ```sql
   CREATE POLICY "Authenticated users can upload images"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'recipe-images');
   ```
7. Click "Review" and then "Save policy"

### 1.4 Enable Email Authentication

1. Go to **Authentication** → **Providers** in the Supabase dashboard
2. Make sure **Email** provider is enabled (it should be by default)
3. Configure email templates if desired (optional)

### 1.5 Get Your API Keys

1. Go to **Settings** → **API**
2. You'll need three values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`
   - **service_role key**: Another long string (click "Reveal" to see it)

⚠️ **IMPORTANT**: Never commit your service_role key to git. It gives full database access!

## Step 2: Configure Environment Variables

1. In your project root, copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and replace the placeholder values with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Run the Development Server

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000)

## Step 5: Test the Application

### 5.1 Create an Account

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. You'll be redirected to the login page
3. Click "Don't have an account? Sign up"
4. Enter your details:
   - Email address
   - Password (min 6 characters)
   - Full name
5. Click "Create Account"

⚠️ **Note**: By default, Supabase requires email confirmation. Check your email inbox for a confirmation link.

If you want to disable email confirmation for development:
1. Go to Supabase → **Authentication** → **Providers** → **Email**
2. Uncheck "Enable email confirmations"

### 5.2 Create Your First Recipe

1. Once logged in, click "New Recipe"
2. Fill in the recipe details:
   - Title (required)
   - Description
   - Image URL (optional - try a URL from Unsplash or similar)
   - Prep time, cook time, servings
   - Tags (comma-separated)
3. Add ingredients:
   - Click "Add Ingredient" to add more rows
   - Fill in ingredient name, amount, and unit
   - Remove ingredients with the trash icon
4. Add instructions:
   - Click "Add Step" to add more steps
   - Write clear, step-by-step instructions
5. Click "Create Recipe"

### 5.3 Browse, Edit, and Delete

- Click on a recipe card to view details
- Click "Edit" to modify a recipe
- Click "Delete" to remove a recipe (with confirmation)

## Step 6: Deploy to Vercel (Optional)

### 6.1 Push to GitHub

```bash
git remote add origin https://github.com/yourusername/recipe-book.git
git push -u origin master
```

### 6.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel will auto-detect Next.js
5. Add environment variables:
   - Click "Environment Variables"
   - Add all variables from your `.env.local` file
   - **Don't forget to update `NEXT_PUBLIC_APP_URL`** to your Vercel domain
6. Click "Deploy"

Your app will be live in ~2 minutes!

### 6.3 Update Supabase URLs

After deployment, add your Vercel domain to Supabase's allowed URLs:

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Add your Vercel URL to "Site URL" and "Redirect URLs"
3. Format: `https://your-app.vercel.app`

## Troubleshooting

### Build Fails: "Your project's URL and API key are required"

**Solution**: Make sure your `.env.local` file exists and has valid Supabase credentials.

### Can't Sign In: "Invalid login credentials"

**Possible causes**:
1. Email confirmation required (check your email)
2. Wrong password
3. User doesn't exist yet (sign up first)

### Recipe Images Don't Load

**Possible causes**:
1. Invalid image URL
2. URL not accessible
3. Storage bucket not public

**Solution**: Make sure `recipe-images` bucket is set to public in Supabase Storage settings.

### "User must be authenticated" Error

**Solution**:
1. Make sure you're logged in
2. Clear cookies and log in again
3. Check that RLS policies are applied correctly

### TypeScript Errors During Build

**Solution**:
```bash
npm run build
```
If you see errors, check that all required dependencies are installed.

## Next Steps

### Phase 2: Multi-Source Recipes (Coming Soon)

In the next phase, you'll be able to:
- Browse recipes from TheMealDB API
- Generate recipes using Claude AI
- Search across all sources simultaneously

### Phase 3: Shopping Lists

Create shopping lists from your recipes with smart ingredient consolidation.

### Phase 4: Meal Planning

Plan your weekly meals with a calendar view and generate shopping lists automatically.

## Support

If you encounter issues:

1. Check this guide again
2. Review the [Supabase documentation](https://supabase.com/docs)
3. Check the [Next.js documentation](https://nextjs.org/docs)
4. Open an issue on GitHub

## Architecture Notes

This application uses a modular adapter pattern for recipe sources:

- **ManualRecipeAdapter**: Handles user-created recipes (Phase 1 - ✅ Complete)
- **ApiRecipeAdapter**: TheMealDB integration (Phase 2 - Coming Soon)
- **AiRecipeAdapter**: Claude AI generation (Phase 2 - Coming Soon)

The adapter pattern makes it easy to add new recipe sources without modifying existing code!

---

Enjoy building your recipe collection! 👨‍🍳
