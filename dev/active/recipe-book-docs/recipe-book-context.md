# Recipe Book - Development Context

**Last Updated: 2026-02-16 (session 3 — Major Enhancement Sprints)**

## Project Overview

Personal recipe management web application with modular architecture for multiple recipe sources. All UI is in **Spanish**.

**Live URL**: https://recipe-book-ten-mu.vercel.app
**Repository**: https://github.com/MrEddieGeek/recipe-book
**Database**: Supabase (PostgreSQL)
**Deployment**: Vercel (automatic on git push to master)

---

## Current State: All Phases + 5 Enhancement Sprints Complete

- **Phase 1** ✅ Manual recipe CRUD, deployed to Vercel
- **Phase 2** ✅ Multi-source recipes (TheMealDB API + Google Gemini AI), photo upload, Spanish UI
- **Phase 3** ✅ Shopping lists with recipe integration
- **Phase 4** ✅ Meal Planning Calendar
- **Security** ✅ Full security audit and hardening (rate limiting, CSP, body size guards, timeouts)
- **Favorites** ✅ Heart toggle on manual recipes, Favoritos tab
- **Dark Mode** ✅ Full dark mode with toggle in header, localStorage persistence
- **Sprint 1** ✅ Video Recipe Extraction + Gemini Migration (2.0-flash → 2.5-flash)
- **Sprint 2** ✅ Recipe Categories, URL Import, Print-Friendly View
- **Sprint 3** ✅ Shopping List Enhancements (consolidation, drag-drop, share, prices)
- **Sprint 4** ✅ Meal Planning Enhancements (monthly calendar, templates, nutrition)
- **Sprint 5** ✅ Technical Improvements (image compression, testing, PWA, speed insights)

---

## Key Architectural Decisions

### 1. Adapter Pattern for Recipe Sources

```
RecipeAdapter (abstract base)
├── ManualRecipeAdapter (Supabase CRUD + favorites)
├── ApiRecipeAdapter (TheMealDB API)
└── AiRecipeAdapter (stub — AI uses direct API route instead)
```

**Key Files**:
- `src/lib/adapters/base-adapter.ts` — Abstract base class
- `src/lib/adapters/types.ts` — Common Recipe interface (includes `isFavorited`, `categoryId`, nutrition fields) + DB conversion utilities
- `src/lib/adapters/manual-adapter.ts` — Supabase CRUD, `PERSONAL_USER_ID = null`, `toggleFavorite()`, `getFavorites()`, category/nutrition update support
- `src/lib/adapters/api-adapter.ts` — TheMealDB integration (descriptions in Spanish), `fetchWithTimeout()` wrapper
- `src/lib/adapters/adapter-factory.ts` — Factory with TypeScript overloads
- `src/lib/services/recipe-service.ts` — High-level API, auto-routes by ID prefix

### 2. No Authentication (Personal Use)

- `PERSONAL_USER_ID = null` (not a UUID — avoids FK constraint issues)
- RLS policies set to permissive (allow all)
- No login page or session management

### 3. Google Gemini for AI Generation

- **Provider**: Google Gemini (**gemini-2.5-flash** — migrated from 2.0-flash in Sprint 1)
- **Env var**: `GEMINI_API_KEY`
- **API routes**:
  - `/api/generate-recipe` — text-based recipe generation (30s timeout)
  - `/api/extract-recipe-from-video` — video URL or upload extraction (60s timeout, needs Vercel Fluid Compute)
  - `/api/import-recipe` — extract recipe from web page URL
- **Output**: Uses `responseMimeType: 'application/json'` for structured JSON
- **Language**: All prompts generate recipes in Spanish
- **Nutrition**: Gemini prompts include estimated calories, protein, carbs, fat

### 4. Client-Side API Routes Pattern

Client components fetch via `/api/*` routes which call server-side services:
- `/api/recipes` — POST (create)
- `/api/recipes/search` — GET (search by source: manual/api/favorites/all)
- `/api/recipes/[id]/favorite` — POST (toggle favorite)
- `/api/categories` — GET/POST (recipe categories)
- `/api/shopping-lists/*` — Full CRUD for shopping lists and items
- `/api/shopping-lists/[id]/items/reorder` — PATCH (drag-drop reorder)
- `/api/shopping-lists/[id]/share` — POST (generate share token)
- `/api/meal-plans/*` — CRUD for meal planning + shopping list generation
- `/api/meal-templates/*` — CRUD + apply templates
- `/api/generate-recipe` — AI recipe generation
- `/api/extract-recipe-from-video` — Video recipe extraction
- `/api/import-recipe` — Web page recipe import
- `/api/upload-image` — Image upload to Supabase Storage

### 5. Env Var Trimming

**Critical fix**: Vercel env vars can contain embedded newline characters that cause "invalid header value" errors. The `getSupabaseAdmin()` function in `manual-adapter.ts` applies `.trim()` to all env vars.

### 6. Security Hardening

- Zod validation on all API routes
- Magic byte file upload validation
- In-memory sliding-window rate limiter (multiple tiers including EXTRACT_VIDEO: 2/min)
- Content-Length body size check (1MB max) on POST/PATCH routes
- Content-Security-Policy header in `next.config.ts`
- AbortController timeouts on all external fetches

### 7. Video Recipe Extraction (Sprint 1)

Three URL resolution paths:
1. **YouTube/Shorts** → pass URL directly to Gemini `file_data.file_uri`
2. **TikTok/Instagram** → server-side HTML fetch → extract `og:video` meta tag → pass to Gemini
3. **File upload fallback** → upload to Gemini File API → call generateContent

Route config: `export const maxDuration = 60;` (requires Vercel Fluid Compute toggle)

### 8. Recipe Categories (Sprint 2)

- `categories` table with 6 defaults: Desayuno, Almuerzo, Cena, Postre, Snack, Bebida
- `category_id` FK on `recipes` table
- Category filter chips on recipes page
- Category dropdown in RecipeForm

### 9. Shopping List Enhancements (Sprint 3)

- **Ingredient consolidation** (`src/lib/utils/ingredient-consolidation.ts`): normalizes names, groups by item, sums compatible units, handles fractions and unit aliases
- **Drag-drop reorder**: HTML5 native drag-and-drop (no external libs), `sort_order` column
- **Share**: `share_token` on shopping_lists, public read-only page at `/shared/shopping-list/[token]`
- **Price tracking**: optional `price` field per item, MXN currency, totals display

### 10. Meal Planning Enhancements (Sprint 4)

- **Monthly calendar**: `MonthlyCalendar` component, Monday-based weeks, today highlighting
- **Templates**: save current week as template, apply templates to any week
- **Nutrition**: `calories_per_serving`, `protein_grams`, `carbs_grams`, `fat_grams` on recipes table

### 11. Technical Stack (Sprint 5)

- **Image compression**: Canvas API resize (1200px max), 0.8 quality, only files >500KB
- **Testing**: Vitest 2.x + @testing-library/react + jsdom 24 + @vitejs/plugin-react
- **PWA**: @serwist/next, service worker with cache-first static / network-first API
- **Performance**: @vercel/speed-insights (free tier)

---

## Technology Stack

- **Frontend**: Next.js 15.5.12, TypeScript 5.7.3, Tailwind CSS 3.4.17
- **Database**: Supabase PostgreSQL + Storage (bucket: `recipe-images`)
- **AI**: Google Gemini API (**gemini-2.5-flash**)
- **External API**: TheMealDB (free, key=1)
- **Validation**: Zod (all API inputs validated)
- **Testing**: Vitest 2.x, @testing-library/react, jsdom 24
- **PWA**: @serwist/next + serwist
- **Monitoring**: @vercel/speed-insights
- **Hosting**: Vercel (auto-deploy on push)

---

## Project Structure

```
src/
├── app/
│   ├── (authenticated)/
│   │   ├── layout.tsx
│   │   ├── recipes/
│   │   │   ├── page.tsx            # Recipe list (tabs + category filter chips)
│   │   │   ├── new/page.tsx        # Create recipe
│   │   │   ├── generate/page.tsx   # AI recipe generation
│   │   │   ├── from-video/page.tsx # Video recipe extraction (NEW Sprint 1)
│   │   │   ├── import/page.tsx     # URL recipe import (NEW Sprint 2)
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Recipe detail + nutrition display
│   │   │       ├── edit/page.tsx   # Edit recipe
│   │   │       └── print/page.tsx  # Print-friendly view (NEW Sprint 2)
│   │   ├── meal-plan/page.tsx      # Weekly/Monthly calendar + templates
│   │   └── shopping-list/page.tsx  # Shopping list (drag-drop, share, prices)
│   │
│   ├── shared/
│   │   └── shopping-list/[token]/page.tsx  # Public shared shopping list (NEW Sprint 3)
│   │
│   ├── api/
│   │   ├── recipes/...                     # CRUD + search + favorite
│   │   ├── categories/route.ts             # GET/POST (NEW Sprint 2)
│   │   ├── generate-recipe/route.ts        # AI generation (gemini-2.5-flash)
│   │   ├── extract-recipe-from-video/route.ts  # Video extraction (NEW Sprint 1)
│   │   ├── import-recipe/route.ts          # URL import (NEW Sprint 2)
│   │   ├── upload-image/route.ts
│   │   ├── shopping-lists/...              # CRUD + reorder + share
│   │   ├── meal-plans/...                  # CRUD + generate shopping list
│   │   └── meal-templates/...              # CRUD + apply (NEW Sprint 4)
│   │
│   ├── sw.ts                        # Service worker (NEW Sprint 5)
│   ├── layout.tsx                   # Root layout (manifest, SpeedInsights, ThemeProvider)
│   ├── globals.css                  # Tailwind + dark mode + @media print
│   └── page.tsx                     # Home (redirects to /recipes)
│
├── components/
│   ├── ui/                          # Button, Card, Input, Textarea, Modal, Spinner, Badge
│   ├── recipe/                      # RecipeCard, RecipeDetail, RecipeForm, FavoriteButton, RecipePrintView
│   ├── meal-plan/                   # MonthlyCalendar, TemplateManager (NEW Sprint 4)
│   ├── layout/                      # Header, Navigation
│   └── providers/ThemeProvider.tsx   # Dark mode context + localStorage
│
├── lib/
│   ├── adapters/                    # Recipe source adapters
│   ├── services/
│   │   ├── recipe-service.ts
│   │   ├── shopping-list-service.ts # + reorderItems, updateItemPrice, share methods
│   │   ├── meal-plan-service.ts
│   │   ├── meal-template-service.ts # NEW Sprint 4
│   │   └── category-service.ts      # NEW Sprint 2
│   ├── supabase/
│   └── utils/
│       ├── validation.ts            # ALL Zod schemas (+ VideoExtractionSchema, nutrition)
│       ├── rate-limit.ts            # In-memory rate limiter (+ EXTRACT_VIDEO tier)
│       ├── ingredient-consolidation.ts  # NEW Sprint 3
│       └── image-compress.ts        # NEW Sprint 5

public/
├── manifest.json                    # PWA manifest (NEW Sprint 5)
├── icons/                           # SVG app icons (NEW Sprint 5)
└── sw.js                            # Generated service worker output

supabase/migrations/
├── 001_initial_schema.sql
├── 002_rls_policies.sql
├── 003_disable_rls_for_personal_use.sql
├── 004_fix_shopping_tables_personal_use.sql
├── 005_fix_meal_plans_personal_use.sql
├── 006_add_favorites.sql
├── 007_recipe_categories.sql           # NEW Sprint 2
├── 008_shopping_list_enhancements.sql  # NEW Sprint 3
├── 009_meal_templates.sql              # NEW Sprint 4
└── 010_recipe_nutrition.sql            # NEW Sprint 4

vitest.config.mjs                    # Vitest 2.x config (NEW Sprint 5)
```

---

## Database Schema

### recipes
```sql
id, user_id (nullable), title, description, image_url,
prep_time_minutes, cook_time_minutes, servings,
source_type ('manual'|'api'|'ai'), source_id,
ingredients (jsonb), instructions (jsonb), tags (text[]),
is_favorited (boolean, default false),
category_id (UUID FK → categories, nullable),          -- NEW Sprint 2
calories_per_serving (INTEGER nullable),                -- NEW Sprint 4
protein_grams (DECIMAL nullable),                       -- NEW Sprint 4
carbs_grams (DECIMAL nullable),                         -- NEW Sprint 4
fat_grams (DECIMAL nullable),                           -- NEW Sprint 4
created_at, updated_at
```

### categories (NEW Sprint 2)
```sql
id (UUID), name (TEXT UNIQUE), color (TEXT), icon (TEXT), created_at
-- Seeded: Desayuno, Almuerzo, Cena, Postre, Snack, Bebida
```

### shopping_lists
```sql
id, user_id (nullable), name,
share_token (TEXT UNIQUE nullable),    -- NEW Sprint 3
created_at
```

### shopping_list_items
```sql
id, shopping_list_id (FK cascade), item, amount, unit,
checked (boolean), recipe_id (nullable),
sort_order (INTEGER DEFAULT 0),        -- NEW Sprint 3
price (DECIMAL(10,2) nullable),        -- NEW Sprint 3
created_at
```

### meal_plans
```sql
id, user_id (nullable), recipe_id, date, meal_type ('breakfast'|'lunch'|'dinner'),
servings, created_at
```

### meal_templates (NEW Sprint 4)
```sql
id (UUID), name (TEXT), description (TEXT nullable), user_id (nullable), created_at
```

### meal_template_items (NEW Sprint 4)
```sql
id (UUID), template_id (FK cascade), recipe_id (FK cascade),
day_offset (INTEGER 0-6), meal_type (TEXT), servings (INTEGER DEFAULT 1)
```

---

## Environment Variables

### Required (set in Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://ogtqpsqliggszflsobny.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # IMPORTANT: no newlines!
NEXT_PUBLIC_APP_URL=https://recipe-book-ten-mu.vercel.app
GEMINI_API_KEY=...  # Google AI Studio API key
```

### Vercel Dashboard
https://vercel.com/mreddiegeek/recipe-book/settings/environment-variables

---

## Handoff Notes for Next Session

### What was just completed (2026-02-16 session 3)
All 5 enhancement sprints implemented (code written, NOT yet committed/pushed):

**Sprint 1**: Video recipe extraction (YouTube/TikTok/Instagram + file upload), Gemini migrated to 2.5-flash
**Sprint 2**: Recipe categories (6 defaults), URL import, print-friendly view
**Sprint 3**: Ingredient consolidation, drag-drop reorder, share shopping lists, price tracking (MXN)
**Sprint 4**: Monthly calendar view, meal templates (save/apply), nutritional tracking
**Sprint 5**: Image compression (Canvas API), testing (vitest 2.x, 27 tests pass), PWA (@serwist/next), SpeedInsights

### ⚠️ UNCOMMITTED CHANGES — All sprint work needs to be committed and pushed

### ⚠️ REQUIRED ACTIONS before features work:
1. **Run migrations 006-010** in Supabase SQL Editor (006 may already be done)
2. **Enable Vercel Fluid Compute** in project settings (free toggle, needed for 60s video extraction timeout)
3. **Redeploy** after push for changes to take effect

### Key technical decisions made this session:
- **Vitest 2.x** (not 4.x) because Node 18 on this machine; vitest 4+ requires Node >=20
- **jsdom 24** (not 28) due to ESM compat issues with jsdom 28 + vitest forks pool
- **@vitejs/plugin-react** added to vitest config for automatic JSX transform (React components use JSX without explicit `import React`)
- **SVG icons** for PWA (not PNG) — crisp at any size, no image generation needed
- **vitest.config.mjs** (not .ts) — ESM file extension avoids `ERR_REQUIRE_ESM` without adding `"type": "module"` to package.json

### Build verification:
- `npm run build` ✅ passes cleanly
- `npx vitest run` ✅ 27/27 tests pass
- No TypeScript errors

---

## Change Log

### 2026-02-11 — Phases 1-4 Complete
- Phase 1: Core adapter pattern, manual CRUD, Vercel deployment
- Phase 2: TheMealDB + Gemini AI, photo upload, Spanish UI
- Phase 3: Shopping lists with recipe integration
- Phase 4: Meal planning calendar with weekly grid

### 2026-02-12 (session 1) — Security Hardening
- Deleted `/api/debug` route, Zod validation on all routes
- Magic byte file validation, SQL escape, security headers

### 2026-02-12 (session 2) — Security v2 + Favorites + Dark Mode
- Rate limiting (in-memory sliding window, 3 tiers)
- Body size guards (1MB), fetch timeouts (30s Gemini, 10s TheMealDB)
- Content-Security-Policy header
- Favorites: `is_favorited` column, toggle API, FavoriteButton, Favoritos tab
- Dark mode: ThemeProvider, localStorage, Header toggle, `dark:` variants on all components

### 2026-02-16 (session 3) — Major Enhancement Sprints 1-5
- Sprint 1: Video recipe extraction + Gemini 2.0→2.5-flash migration
- Sprint 2: Categories, URL import, print view
- Sprint 3: Ingredient consolidation, drag-drop, share lists, price tracking
- Sprint 4: Monthly calendar, meal templates, nutritional tracking
- Sprint 5: Image compression, vitest testing (27 tests), PWA, speed insights

---

**This document should be updated whenever major architectural decisions are made or significant features are added.**
