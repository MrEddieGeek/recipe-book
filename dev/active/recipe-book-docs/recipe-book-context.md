# Recipe Book - Development Context

**Last Updated: 2026-02-11**

## Project Overview

Personal recipe management web application with modular architecture for multiple recipe sources.

**Live URL**: https://recipe-book-ten-mu.vercel.app
**Repository**: https://github.com/MrEddieGeek/recipe-book
**Database**: Supabase (PostgreSQL)
**Deployment**: Vercel (automatic on git push)

---

## Key Architectural Decisions

### 1. Adapter Pattern for Recipe Sources

**Decision**: Use abstract adapter pattern for all recipe sources

**Rationale**:
- Adding new sources requires zero changes to existing code
- Each source is completely isolated
- Easy to test and mock
- Can enable/disable sources via configuration

**Implementation**:
```
RecipeAdapter (abstract base)
├── ManualRecipeAdapter (Supabase CRUD)
├── ApiRecipeAdapter (TheMealDB) [Phase 2]
└── AiRecipeAdapter (Claude API) [Phase 2]
```

**Key Files**:
- `src/lib/adapters/base-adapter.ts` - Abstract base class
- `src/lib/adapters/types.ts` - Common Recipe interface
- `src/lib/adapters/adapter-factory.ts` - Factory pattern
- `src/lib/services/recipe-service.ts` - High-level API

### 2. No Authentication (Personal Use)

**Decision**: Remove all authentication, use fixed user ID

**Rationale**:
- Simplifies deployment and maintenance
- Eliminates auth debugging
- Perfect for single-user personal project
- Can add auth later if needed

**Implementation**:
- Fixed user ID: `00000000-0000-0000-0000-000000000000`
- RLS policies set to permissive (allow all)
- No login page or session management

**Trade-offs**:
- Not suitable for multi-user deployment
- Database accessible to anyone with credentials
- Solution: Keep Supabase credentials private

### 3. Service Layer Architecture

**Decision**: Separate business logic from UI via service layer

**Rationale**:
- Pages/components use simple, consistent API
- Business logic is testable
- Can swap implementations without changing UI
- Clear separation of concerns

**Structure**:
```
Pages → Services → Adapters → Data Sources
```

**Key Services**:
- `RecipeService` - Recipe operations
- `ShoppingListService` - Shopping list logic (Phase 3)
- `MealPlanService` - Meal planning (Phase 4)

### 4. Server Components First

**Decision**: Use Server Components by default, Client Components only when needed

**Rationale**:
- Faster initial page loads
- Reduced JavaScript bundle
- Better SEO
- Simpler data fetching

**Client Components Only For**:
- Forms with state
- Interactive UI (modals, dropdowns)
- Browser APIs (localStorage, etc)

### 5. Mobile-First Design

**Decision**: Optimize for mobile, enhance for desktop

**Rationale**:
- Most recipe viewing happens in kitchen on phone
- Touch-first interactions
- Smaller screen is harder constraint

**Implementation**:
- Bottom navigation bar (mobile)
- Large touch targets (min 44px)
- 16px font size on inputs (prevents iOS zoom)
- Responsive grid: 1 col mobile → 2-3 desktop

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.12 with App Router
- **Language**: TypeScript 5.7.3 (strict mode)
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Custom (no component library)
- **Validation**: Zod 3.23.8

### Backend
- **Database**: Supabase (PostgreSQL)
- **ORM**: Supabase client (type-safe queries)
- **Auth**: None (personal use)
- **Storage**: Supabase Storage (images)

### External APIs (Phase 2)
- **TheMealDB**: Free recipe API (1000+ recipes)
- **Claude API**: AI recipe generation (Anthropic)

### Deployment
- **Hosting**: Vercel
- **CI/CD**: Automatic deployment on git push
- **Domain**: Vercel-provided subdomain

### Development Tools
- **Package Manager**: npm
- **Linter**: ESLint with Next.js config
- **Git**: GitHub repository
- **Node Version**: 18.19.1 (works, but 20+ recommended)

---

## Project Structure

```
/home/lustucru/Documents/Projects/menu/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── (authenticated)/          # Authenticated routes group
│   │   │   ├── layout.tsx            # Auth layout (no auth check now)
│   │   │   ├── recipes/              # Recipe pages
│   │   │   │   ├── page.tsx          # Recipe list
│   │   │   │   ├── new/page.tsx      # Create recipe
│   │   │   │   ├── [id]/page.tsx     # Recipe detail
│   │   │   │   └── [id]/edit/        # Edit recipe
│   │   │   ├── meal-plan/page.tsx    # Meal planning (placeholder)
│   │   │   └── shopping-list/page.tsx # Shopping list (placeholder)
│   │   ├── api/                      # API routes
│   │   │   └── check-env/route.ts    # Debug endpoint
│   │   ├── test-auth/page.tsx        # Test page
│   │   ├── login/page.tsx            # Login (not used)
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home (redirects)
│   │   └── globals.css               # Global styles
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # Reusable UI components (8)
│   │   │   ├── Button.tsx            # Button component
│   │   │   ├── Card.tsx              # Card container
│   │   │   ├── Input.tsx             # Form input
│   │   │   ├── Textarea.tsx          # Multi-line input
│   │   │   ├── Modal.tsx             # Modal dialog
│   │   │   ├── Spinner.tsx           # Loading spinner
│   │   │   └── Badge.tsx             # Label badge
│   │   │
│   │   ├── recipe/                   # Recipe-specific components (7)
│   │   │   ├── RecipeCard.tsx        # Recipe preview card
│   │   │   ├── RecipeDetail.tsx      # Full recipe display
│   │   │   ├── RecipeForm.tsx        # Create/edit form (complex!)
│   │   │   ├── RecipeSourceBadge.tsx # Source type badge
│   │   │   ├── IngredientList.tsx    # Ingredient display
│   │   │   ├── InstructionSteps.tsx  # Instruction display
│   │   │   └── DeleteRecipeButton.tsx # Delete with modal
│   │   │
│   │   └── layout/                   # Layout components (2)
│   │       ├── Header.tsx            # Top header
│   │       └── Navigation.tsx        # Bottom nav bar
│   │
│   └── lib/                          # Business logic
│       ├── adapters/                 # Recipe source adapters (CORE!)
│       │   ├── types.ts              # Recipe interface
│       │   ├── base-adapter.ts       # Abstract base
│       │   ├── manual-adapter.ts     # Supabase CRUD (Phase 1)
│       │   ├── api-adapter.ts        # TheMealDB stub (Phase 2)
│       │   ├── ai-adapter.ts         # Claude stub (Phase 2)
│       │   └── adapter-factory.ts    # Factory pattern
│       │
│       ├── services/                 # Business logic services
│       │   └── recipe-service.ts     # Recipe operations
│       │
│       ├── supabase/                 # Supabase clients
│       │   ├── client.ts             # Browser client
│       │   ├── server.ts             # Server client
│       │   └── middleware.ts         # Session middleware
│       │
│       └── utils/                    # Utilities
│           └── validation.ts         # Zod schemas
│
├── supabase/                         # Database migrations
│   ├── migrations/
│   │   ├── 001_initial_schema.sql    # Create tables
│   │   ├── 002_rls_policies.sql      # Security policies
│   │   └── 003_disable_rls_for_personal_use.sql
│   └── README.md                     # Supabase setup guide
│
├── dev/                              # Development docs
│   └── active/
│       └── recipe-book-docs/         # This documentation
│
├── .env.local                        # Environment variables (gitignored)
├── .env.example                      # Env template
├── middleware.ts                     # Next.js middleware
├── next.config.ts                    # Next.js config
├── tailwind.config.ts                # Tailwind config
├── tsconfig.json                     # TypeScript config
├── package.json                      # Dependencies
├── README.md                         # Project overview
├── SETUP.md                          # Setup instructions
└── IMPLEMENTATION_SUMMARY.md         # What was built

```

---

## Database Schema

### Tables

#### profiles
```sql
id          UUID PRIMARY KEY (references auth.users)
email       TEXT
full_name   TEXT
avatar_url  TEXT
created_at  TIMESTAMP
```
*Currently unused (no auth), but ready for Phase 5*

#### recipes ⭐ PRIMARY TABLE
```sql
id                  UUID PRIMARY KEY
user_id             UUID (references profiles.id) - NULLABLE
title               TEXT NOT NULL
description         TEXT
image_url           TEXT
prep_time_minutes   INTEGER
cook_time_minutes   INTEGER
servings            INTEGER
source_type         TEXT NOT NULL ('manual' | 'api' | 'ai')
source_id           TEXT (external ID for API recipes)
ingredients         JSONB (array of {item, amount, unit})
instructions        JSONB (array of {step, description})
tags                TEXT[]
created_at          TIMESTAMP
updated_at          TIMESTAMP (auto-updated)
```

**Indexes**:
- `recipes_user_id_idx` on user_id
- `recipes_source_type_idx` on source_type
- `recipes_tags_idx` on tags (GIN index)

#### meal_plans (Phase 4)
```sql
id          UUID PRIMARY KEY
user_id     UUID NOT NULL (references profiles.id)
recipe_id   UUID NOT NULL (references recipes.id)
date        DATE NOT NULL
meal_type   TEXT NOT NULL ('breakfast' | 'lunch' | 'dinner')
servings    INTEGER DEFAULT 1
created_at  TIMESTAMP
```

#### shopping_lists (Phase 3)
```sql
id          UUID PRIMARY KEY
user_id     UUID NOT NULL (references profiles.id)
name        TEXT NOT NULL
created_at  TIMESTAMP
```

#### shopping_list_items (Phase 3)
```sql
id                  UUID PRIMARY KEY
shopping_list_id    UUID NOT NULL (references shopping_lists.id ON DELETE CASCADE)
item                TEXT NOT NULL
amount              TEXT
unit                TEXT
checked             BOOLEAN DEFAULT false
recipe_id           UUID (references recipes.id) - tracks origin
created_at          TIMESTAMP
```

### RLS Policies

**Current State**: Open for personal use
```sql
CREATE POLICY "Allow all access to recipes for personal use"
  ON recipes FOR ALL
  USING (true) WITH CHECK (true);
```

**To Re-enable Security** (if adding multi-user later):
Run `002_rls_policies.sql` to add user-specific policies

---

## Environment Variables

### Required

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://ogtqpsqliggszflsobny.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App URL
NEXT_PUBLIC_APP_URL=https://recipe-book-ten-mu.vercel.app
```

### Phase 2 (Optional - for API/AI features)

```env
# TheMealDB API (Free, no key needed)
MEAL_DB_API_KEY=1

# Claude API (Requires account)
ANTHROPIC_API_KEY=sk-ant-...
```

### Setting in Vercel

1. Go to: https://vercel.com/mreddiegeek/recipe-book/settings/environment-variables
2. Add each variable
3. ✅ Check **all three**: Production, Preview, Development
4. Save
5. Redeploy

---

## Key Files Reference

### Core Adapter Pattern

**Base Types** (`src/lib/adapters/types.ts`)
```typescript
interface Recipe {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags: string[];
  source: RecipeSource;
}

interface RecipeSource {
  type: 'manual' | 'api' | 'ai';
  id: string;
  name?: string;
}
```

**Abstract Adapter** (`src/lib/adapters/base-adapter.ts`)
```typescript
abstract class RecipeAdapter {
  abstract sourceType: 'manual' | 'api' | 'ai';
  abstract getRecipeById(id: string): Promise<Recipe | null>;
  abstract searchRecipes(options: RecipeSearchOptions): Promise<Recipe[]>;

  // Optional methods (manual only)
  saveRecipe?(recipe): Promise<Recipe>;
  updateRecipe?(id, recipe): Promise<Recipe>;
  deleteRecipe?(id): Promise<void>;
}
```

**Manual Adapter** (`src/lib/adapters/manual-adapter.ts`)
- Full CRUD implementation
- Uses Supabase client
- Fixed user ID: `00000000-0000-0000-0000-000000000000`
- Maps database rows to Recipe interface

**Service Layer** (`src/lib/services/recipe-service.ts`)
```typescript
class RecipeService {
  static async getRecipeById(id, sourceType): Promise<Recipe | null>
  static async searchManualRecipes(options): Promise<Recipe[]>
  static async searchAllSources(options): Promise<{manual, api, ai}>
  static async createManualRecipe(recipe): Promise<Recipe>
  static async updateManualRecipe(id, recipe): Promise<Recipe>
  static async deleteManualRecipe(id): Promise<void>
}
```

### Complex Components

**RecipeForm** (`src/components/recipe/RecipeForm.tsx`)
- Most complex component (~200 lines)
- Dynamic ingredient list (add/remove)
- Dynamic instruction steps (add/remove)
- Form validation with Zod
- Image URL input
- Tag management (comma-separated)

**RecipeCard** (`src/components/recipe/RecipeCard.tsx`)
- Preview card for recipe grid
- Shows image, title, description
- Displays time, servings, tags
- Source badge
- Hover effects

**RecipeDetail** (`src/components/recipe/RecipeDetail.tsx`)
- Full recipe display
- Image header
- Meta info (times, servings)
- Ingredient list
- Instruction steps
- Tags

---

## Common Development Tasks

### Add New Recipe Source

1. Create adapter extending `RecipeAdapter`:
   ```typescript
   // src/lib/adapters/new-source-adapter.ts
   export class NewSourceAdapter extends RecipeAdapter {
     readonly sourceType = 'newsource' as const;

     async getRecipeById(id: string): Promise<Recipe | null> {
       // Implementation
     }

     async searchRecipes(options): Promise<Recipe[]> {
       // Implementation
     }
   }
   ```

2. Update factory:
   ```typescript
   // src/lib/adapters/adapter-factory.ts
   case 'newsource':
     return new NewSourceAdapter();
   ```

3. Update types:
   ```typescript
   // src/lib/adapters/types.ts
   type: 'manual' | 'api' | 'ai' | 'newsource';
   ```

4. No other changes needed! 🎉

### Add New Database Table

1. Create migration:
   ```sql
   -- supabase/migrations/004_new_table.sql
   CREATE TABLE new_table (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     -- columns...
   );
   ```

2. Run in Supabase SQL Editor

3. Add TypeScript types in `types.ts`

4. Create service in `src/lib/services/`

### Add New Page

1. Create file in `src/app/(authenticated)/`:
   ```typescript
   // src/app/(authenticated)/new-page/page.tsx
   export default function NewPage() {
     return <div>New Page</div>;
   }
   ```

2. Add to navigation (if needed):
   ```typescript
   // src/components/layout/Navigation.tsx
   links.push({
     href: '/new-page',
     label: 'New',
     icon: <svg>...</svg>
   });
   ```

3. Auto-included in auth layout!

---

## Troubleshooting

### Common Issues

**Build fails: "Cannot find module '@/...'"**
- Check `tsconfig.json` paths configuration
- Verify import path starts with `@/`

**"Supabase URL and API key required"**
- Check `.env.local` exists
- Verify no extra spaces in env vars
- Restart dev server after adding vars

**RLS Policy denies access**
- Current setup: All access allowed
- If re-enabling RLS: Check user_id matches

**Images don't load**
- Check `next.config.ts` has domain in `remotePatterns`
- Verify URL is valid and accessible

**TypeScript errors on Supabase queries**
- Supabase types are inferred, may need explicit types
- Use `as DatabaseRecipe` for type assertion

### Debug Endpoints

**Check Environment Variables**
- URL: `/api/check-env`
- Shows which env vars are loaded
- Useful for debugging deployment issues

**Test Auth** (currently unused)
- URL: `/test-auth`
- Tests Supabase connection
- Shows session state

---

## Testing Strategy

### Current State: Manual Testing Only

**Test Checklist**:
- [ ] Can view recipe list
- [ ] Can create new recipe
- [ ] Can edit existing recipe
- [ ] Can delete recipe (with confirmation)
- [ ] Mobile responsive (test on phone)
- [ ] Images display correctly
- [ ] Forms validate properly
- [ ] Navigation works

### Future: Automated Testing

**Phase 2+**: Add testing framework
- **Unit Tests**: Adapters, services
- **Integration Tests**: API routes
- **E2E Tests**: Critical user flows (Playwright)

**Test Files**:
```
src/
  lib/
    adapters/
      __tests__/
        manual-adapter.test.ts
        api-adapter.test.ts
```

---

## Deployment

### Vercel Configuration

**Build Settings**:
- Framework: Next.js (auto-detected)
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node Version: 18.x (20.x recommended)

**Environment Variables**:
Set in Vercel dashboard, not in code!

**Automatic Deployment**:
1. Push to GitHub
2. Vercel detects push
3. Runs build
4. Deploys if successful
5. Sends notification

**Preview Deployments**:
- Every branch gets preview URL
- Test before merging
- Auto-comments on PRs

### Supabase Configuration

**Database**:
- Run migrations in SQL Editor
- Don't use Supabase CLI (optional)
- Backup before major changes

**Storage**:
- Bucket: `recipe-images` (public)
- Upload policy allows authenticated users
- Images accessible via URL

---

## Performance Considerations

### Current Optimization

- ✅ Server Components by default
- ✅ Next.js Image optimization
- ✅ Static generation where possible
- ✅ Code splitting automatic
- ✅ Tailwind CSS tree-shaking

### Future Optimization (if needed)

- Add pagination for recipe list
- Implement infinite scroll
- Add image thumbnails
- Cache API responses client-side
- Use CDN for static assets
- Implement service worker (PWA)

---

## Security Notes

### Current Security Posture

**Strengths**:
- Supabase credentials kept secret
- Database not publicly accessible
- RLS at database level (even if permissive)
- Input validation with Zod
- XSS protection via React

**Weaknesses** (acceptable for personal use):
- No user authentication
- Anyone with credentials has full access
- No rate limiting
- No audit logging

**Mitigation**:
- Don't share Supabase credentials
- Keep `.env.local` in `.gitignore`
- Don't expose service role key publicly
- Deploy to private/protected domain if needed

---

## Dependencies and Versions

### Core Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "next": "^15.1.0",
    "@supabase/supabase-js": "^2.48.0",
    "@supabase/ssr": "^0.6.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "typescript": "^5.7.3",
    "@types/node": "^22.10.2",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "eslint": "^9.18.0",
    "eslint-config-next": "^15.1.0"
  }
}
```

### Phase 2 Additions

```bash
npm install @anthropic-ai/sdk
```

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update next

# Update all (careful!)
npm update
```

---

## Git Workflow

### Branch Strategy

**Current**: Simple flow
- `master` = production
- Feature branches for major changes

**Commits**:
```bash
git add .
git commit -m "feat: add new feature"
git push
```

**Commit Message Format**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Tests
- `chore:` - Maintenance

### Deployment Flow

```bash
# Local development
npm run dev

# Test build locally
npm run build
npm start

# Commit and push
git add .
git commit -m "feat: describe change"
git push

# Vercel auto-deploys!
# Check: https://vercel.com/mreddiegeek/recipe-book/deployments
```

---

## Contacts and Resources

### Project Links
- **Live App**: https://recipe-book-ten-mu.vercel.app
- **GitHub**: https://github.com/MrEddieGeek/recipe-book
- **Vercel**: https://vercel.com/mreddiegeek/recipe-book
- **Supabase**: https://supabase.com/dashboard/project/ogtqpsqliggszflsobny

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Docs](https://zod.dev)

### External APIs (Phase 2)
- [TheMealDB API](https://www.themealdb.com/api.php)
- [Anthropic API Docs](https://docs.anthropic.com)

---

## Change Log

### 2026-02-11 - Phase 1 Complete
- Initial project setup
- Core adapter pattern implemented
- Manual recipe CRUD complete
- Mobile-responsive UI
- Removed authentication for personal use
- Deployed to Vercel

### Future Changes
- Phase 2: API/AI integration
- Phase 3: Shopping lists
- Phase 4: Meal planning

---

**This document should be updated whenever major architectural decisions are made or significant features are added.**
