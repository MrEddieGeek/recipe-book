# Recipe Book - Task Checklist

**Last Updated: 2026-02-16 (session 3)**

## Phase 1: MVP - Manual Recipes ✅ COMPLETE

### Setup
- [x] Initialize Next.js project
- [x] Configure TypeScript and Tailwind
- [x] Set up Supabase project
- [x] Create database schema
- [x] Deploy to Vercel

### Core Architecture
- [x] Create adapter pattern structure
- [x] Implement base RecipeAdapter class
- [x] Create Recipe interface and types
- [x] Implement ManualRecipeAdapter
- [x] Create adapter factory
- [x] Build RecipeService

### Authentication (Removed for personal use)
- [x] Remove authentication system
- [x] Simplify to personal use only
- [x] Update RLS policies for open access

### UI Components
- [x] Button, Card, Input, Textarea, Modal, Spinner, Badge components

### Recipe Features
- [x] Recipe listing page
- [x] Recipe detail page
- [x] Recipe create/edit forms
- [x] Recipe delete function
- [x] RecipeCard, RecipeForm, IngredientList, InstructionSteps components

### Layout & Deployment
- [x] Header, Bottom navigation, Mobile-responsive design
- [x] Push to GitHub, Deploy to Vercel

---

## Phase 2: Multi-Source Recipes ✅ COMPLETE

- [x] Implement `ApiRecipeAdapter` (TheMealDB)
- [x] AI Recipe Generation via Google Gemini
- [x] Multi-source UI with tabs
- [x] Photo upload from files
- [x] Full Spanish translation

---

## Phase 3: Shopping List Management ✅ COMPLETE

- [x] Shopping list service with full CRUD
- [x] 5 API route files
- [x] Shopping list UI with checkboxes
- [x] Recipe integration (AddToShoppingListButton)

---

## Phase 4: Meal Planning Calendar ✅ COMPLETE

- [x] Meal plan service and API routes
- [x] Weekly calendar grid UI
- [x] Recipe picker modal
- [x] Generate shopping list from meal plan

---

## Security Hardening ✅ COMPLETE

- [x] Zod validation on all API routes
- [x] File upload magic byte validation
- [x] Rate limiting (3+ tiers)
- [x] CSP, security headers, body size limits
- [x] Fetch timeouts on all external calls

---

## Favorites ✅ COMPLETE

- [x] Migration 006, data layer, API, FavoriteButton, Favoritos tab

---

## Dark Mode ✅ COMPLETE

- [x] ThemeProvider, tailwind darkMode: 'class', dark: variants on all components

---

## Sprint 1: Video Recipe Extraction + Gemini Migration ✅ COMPLETE (2026-02-16)

### 1A. Migrate Gemini to 2.5-flash
- [x] Change model from gemini-2.0-flash to gemini-2.5-flash in generate-recipe route
- [x] Update nutrition fields in Gemini prompt

### 1B. Video extraction API route
- [x] Create `/api/extract-recipe-from-video/route.ts` (maxDuration=60)
- [x] Add EXTRACT_VIDEO rate limit (2/min)
- [x] Add VideoExtractionSchema to validation
- [x] 3 URL resolution paths: YouTube direct, TikTok/Instagram og:video, file upload fallback

### 1C. Video extraction page
- [x] Create `/recipes/from-video/page.tsx`
- [x] URL input with paste detection, platform auto-detection
- [x] File upload fallback for unsupported platforms
- [x] Add "Video" button to recipes page

---

## Sprint 2: Recipe Enhancements ✅ COMPLETE (2026-02-16)

### 2A. Recipe Categories
- [x] Migration 007 (categories table + category_id FK)
- [x] CategoryService, /api/categories route
- [x] Category dropdown in RecipeForm
- [x] Category filter chips on recipes page
- [x] Updated types.ts and manual-adapter

### 2B. Recipe Import from URL
- [x] Create `/api/import-recipe/route.ts`
- [x] Create `/recipes/import/page.tsx`
- [x] Add "Importar" button to recipes page

### 2C. Print-Friendly Recipe View
- [x] Create RecipePrintView component
- [x] Create `/recipes/[id]/print/page.tsx`
- [x] Add `@media print` styles to globals.css
- [x] Add "Imprimir" button to RecipeDetail

---

## Sprint 3: Shopping List Enhancements ✅ COMPLETE (2026-02-16)

### 3A. Ingredient Consolidation
- [x] Create `ingredient-consolidation.ts` (normalize, group, sum, fractions, unit aliases)
- [x] Integrate into generate-shopping-list route

### 3B. Drag-Drop Reorder
- [x] Migration 008 (sort_order, price, share_token)
- [x] Create reorder API route (PATCH batch)
- [x] HTML5 drag-and-drop on shopping list page
- [x] ShoppingListService reorderItems method

### 3C. Share Shopping List
- [x] Create share API route (generates crypto.randomUUID token)
- [x] Create public `/shared/shopping-list/[token]` page
- [x] "Compartir" button with clipboard copy

### 3D. Price Tracking
- [x] Price input per item (MXN), total display
- [x] ShoppingListService updateItemPrice method

---

## Sprint 4: Meal Planning Enhancements ✅ COMPLETE (2026-02-16)

### 4A. Monthly Calendar View
- [x] Create MonthlyCalendar component (Monday-based, today highlight)
- [x] Weekly/monthly toggle on meal-plan page

### 4B. Meal Templates
- [x] Migration 009 (meal_templates + meal_template_items)
- [x] MealTemplateService (CRUD + saveFromWeek + applyToWeek)
- [x] Template API routes (GET/POST/DELETE/Apply)
- [x] TemplateManager UI component

### 4C. Nutritional Tracking
- [x] Migration 010 (nutrition columns on recipes)
- [x] Updated types.ts, validation, RecipeForm, RecipeDetail
- [x] Updated Gemini prompts to include nutrition estimates
- [x] Daily nutrition totals on meal-plan page

---

## Sprint 5: Technical Improvements ✅ COMPLETE (2026-02-16)

### 5A. Image Optimization
- [x] Create `image-compress.ts` (Canvas API, 1200px max, 0.8 quality)
- [x] Integrate into RecipeForm (compress before upload)

### 5B. Automated Testing
- [x] Install vitest 2.x, @testing-library/react, jsdom 24, @vitejs/plugin-react
- [x] Create vitest.config.mjs
- [x] Create `validation.test.ts` (15 tests)
- [x] Create `ingredient-consolidation.test.ts` (7 tests)
- [x] Create `RecipeCard.test.tsx` (5 tests)
- [x] All 27 tests pass

### 5C. PWA Support
- [x] Install @serwist/next + serwist
- [x] Create manifest.json (Spanish metadata, green theme)
- [x] Create SVG app icons (192x192, 512x512)
- [x] Create sw.ts service worker
- [x] Wrap next.config.ts with serwist
- [x] Add manifest link + meta tags to layout.tsx

### 5D. Performance Monitoring
- [x] Install @vercel/speed-insights
- [x] Add `<SpeedInsights />` to root layout

---

## ⚠️ DEPLOYMENT CHECKLIST (before features go live)

### Database Migrations to Run
- [ ] Verify migrations 004-006 are already run
- [ ] Run migration 007 (recipe categories)
- [ ] Run migration 008 (shopping list: sort_order, price, share_token)
- [ ] Run migration 009 (meal templates)
- [ ] Run migration 010 (recipe nutrition columns)

### Vercel Actions
- [ ] Enable Fluid Compute (free toggle, for 60s video extraction timeout)
- [ ] Commit and push all changes
- [ ] Verify deployment succeeds

### Code Not Yet Committed
- [ ] All Sprint 1-5 code changes (large diff, many new files)
- [ ] Updated dev docs

---

## Future Enhancements 🚀 BACKLOG

- [ ] Recipe export to PDF
- [ ] Offline recipe access (PWA cache recipes)
- [ ] Multi-language support
- [ ] Recipe scaling (adjust servings → recalculate ingredients)
- [ ] Cooking timers in recipe view
- [ ] Recipe rating system
- [ ] Social sharing (share recipes via link)
- [ ] Meal plan AI suggestions based on preferences
- [ ] Shopping list price history/trends
- [ ] More test coverage (services, API routes)

---

**Current State**: All phases + 5 enhancement sprints complete ✅
**Next Priority**: Commit/push code, run migrations, deploy
