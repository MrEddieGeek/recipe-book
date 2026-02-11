# Recipe Book Application - Development Plan

**Last Updated: 2026-02-11**

## Executive Summary

The Recipe Book is a modern, mobile-first web application for personal recipe management. The application uses a modular adapter pattern architecture that makes it trivial to add new recipe sources (API integrations, AI generation) without modifying existing code.

**Current Status**: Phase 1 MVP Complete ✅
- Personal use only (no authentication)
- Full CRUD for manual recipes
- Mobile-responsive UI
- Deployed to Vercel + Supabase

**Next Priorities**:
1. Phase 2: Multi-source recipe integration (API + AI)
2. Phase 3: Shopping list functionality
3. Phase 4: Meal planning calendar

---

## Current State Analysis

### What's Implemented (Phase 1)

#### Core Architecture
- ✅ **Adapter Pattern**: Modular recipe source system
  - `RecipeAdapter` abstract base class
  - `ManualRecipeAdapter` fully implemented
  - `ApiRecipeAdapter` and `AiRecipeAdapter` stubs ready for Phase 2
  - `RecipeAdapterFactory` for managing adapters
  - `RecipeService` high-level orchestration

#### Backend & Database
- ✅ **Supabase Integration**
  - PostgreSQL database with 5 tables
  - RLS policies (currently open for personal use)
  - Server and client-side Supabase clients
  - Middleware for session management

#### Frontend
- ✅ **Next.js 15 with App Router**
  - Server Components by default
  - TypeScript throughout
  - Tailwind CSS styling

- ✅ **UI Components** (17 total)
  - 8 reusable UI components
  - 7 recipe-specific components
  - 2 layout components

- ✅ **Recipe Management**
  - Browse recipes in responsive grid
  - Create recipes with dynamic ingredient/instruction lists
  - Edit existing recipes
  - Delete recipes with confirmation
  - View detailed recipe pages

#### Deployment
- ✅ **Production Ready**
  - Deployed to Vercel
  - GitHub repository configured
  - Environment variables set
  - Automatic deployments on push

### Architecture Strengths

1. **Modularity**: Adding new recipe sources requires zero changes to existing code
2. **Type Safety**: Full TypeScript with Zod validation
3. **Scalability**: Service layer abstracts complexity from UI
4. **Mobile-First**: Optimized for mobile with bottom navigation
5. **Security**: Supabase RLS at database level

### Current Limitations

1. **Single Source**: Only manual recipes (by design for Phase 1)
2. **No External Data**: No API or AI integration yet
3. **Basic Features**: No shopping lists or meal planning
4. **Personal Use Only**: Removed authentication for simplicity

---

## Proposed Future State

### Phase 2: Multi-Source Recipe Discovery (Priority 1)

**Goal**: Allow browsing recipes from multiple sources alongside personal recipes.

**Features**:
- TheMealDB API integration (free, 1000+ recipes)
- Claude AI recipe generation
- Multi-source search with filtering
- Recipe source badges
- Caching for API recipes

**Benefits**:
- Discover new recipes without manual entry
- AI-powered recipe suggestions
- Inspiration from curated database

### Phase 3: Shopping List Management (Priority 2)

**Goal**: Generate shopping lists from recipes with smart consolidation.

**Features**:
- Create shopping lists from individual recipes
- Automatic ingredient consolidation
- Check off items as purchased
- Manual item addition
- Multiple shopping lists

**Benefits**:
- Streamline grocery shopping
- Reduce food waste
- Plan purchases efficiently

### Phase 4: Meal Planning Calendar (Priority 3)

**Goal**: Plan weekly meals and generate comprehensive shopping lists.

**Features**:
- Weekly calendar view
- Drag-and-drop recipe scheduling
- Breakfast/lunch/dinner slots
- Serving size adjustments
- Generate shopping list from week's meals

**Benefits**:
- Organize meal planning
- Batch shopping list generation
- Dietary tracking and planning

---

## Implementation Phases

### Phase 2: Multi-Source Recipes

#### Section 1: TheMealDB API Integration

**Objective**: Integrate free recipe API for discovery

**Tasks**:

1. **Implement API Adapter** [M]
   - Complete `ApiRecipeAdapter.getRecipeById()`
   - Complete `ApiRecipeAdapter.searchRecipes()`
   - Transform TheMealDB format to internal Recipe format
   - **Acceptance**: Can fetch and display API recipes
   - **Dependencies**: None
   - **Files**: `src/lib/adapters/api-adapter.ts`

2. **Add API Recipe Caching** [M]
   - Cache fetched recipes in Supabase (source_type='api')
   - Implement cache invalidation strategy
   - Add cache hit/miss metrics
   - **Acceptance**: API recipes persist in database
   - **Dependencies**: Task 1
   - **Files**: `src/lib/adapters/api-adapter.ts`, database

3. **Create Recipe Search UI** [L]
   - Add search bar to recipes page
   - Implement filtering by source type
   - Add category/cuisine filters
   - Show search results with source badges
   - **Acceptance**: Can search across all sources
   - **Dependencies**: Task 1, 2
   - **Files**: `src/app/(authenticated)/recipes/page.tsx`, new components

4. **Update Recipe Display** [S]
   - Enhance RecipeSourceBadge styling
   - Add "from TheMealDB" attribution
   - Show external recipe metadata
   - **Acceptance**: API recipes clearly distinguished
   - **Dependencies**: Task 1
   - **Files**: `src/components/recipe/RecipeSourceBadge.tsx`, `RecipeDetail.tsx`

#### Section 2: AI Recipe Generation

**Objective**: Generate custom recipes using Claude AI

**Tasks**:

1. **Implement AI Adapter** [L]
   - Create structured prompt templates
   - Implement `AiRecipeAdapter.generateRecipe(prompt)`
   - Add Zod schema validation for AI output
   - Handle API errors and retries
   - **Acceptance**: Can generate valid recipes from prompts
   - **Dependencies**: ANTHROPIC_API_KEY configured
   - **Files**: `src/lib/adapters/ai-adapter.ts`

2. **Create Generation UI** [M]
   - Build `/recipes/generate` page
   - Add prompt input form
   - Show loading state with progress
   - Display generated recipe for review
   - Add "Save" and "Regenerate" options
   - **Acceptance**: User can generate and save AI recipes
   - **Dependencies**: Section 2 Task 1
   - **Files**: `src/app/(authenticated)/recipes/generate/page.tsx`

3. **Cache Generated Recipes** [S]
   - Save AI recipes to database (source_type='ai')
   - Associate with generation prompt
   - Track generation metadata
   - **Acceptance**: AI recipes persist in database
   - **Dependencies**: Section 2 Task 1
   - **Files**: `src/lib/adapters/ai-adapter.ts`

4. **Add Prompt Templates** [S]
   - Create common prompt templates
   - "Healthy dinner with chicken"
   - "Quick vegetarian lunch"
   - "Dessert with seasonal fruits"
   - **Acceptance**: Users can select from templates
   - **Dependencies**: Section 2 Task 2
   - **Files**: `src/app/(authenticated)/recipes/generate/page.tsx`

#### Section 3: Multi-Source Integration

**Objective**: Unify all recipe sources in the UI

**Tasks**:

1. **Update Recipe Service** [M]
   - Implement parallel source querying
   - Add source-specific error handling
   - Implement result aggregation
   - **Acceptance**: `searchAllSources()` returns combined results
   - **Dependencies**: Section 1 Task 1, Section 2 Task 1
   - **Files**: `src/lib/services/recipe-service.ts`

2. **Update Adapter Factory** [S]
   - Enable all adapters in `getAllAdapters()`
   - Update `getEnabledSources()` to return all three
   - **Acceptance**: Factory returns all three adapters
   - **Dependencies**: Section 1 Task 1, Section 2 Task 1
   - **Files**: `src/lib/adapters/adapter-factory.ts`

3. **Add Source Tabs to Recipe Page** [M]
   - Add "All", "My Recipes", "Discover", "AI" tabs
   - Filter results by source type
   - Maintain search query across tabs
   - **Acceptance**: Can filter recipes by source
   - **Dependencies**: Section 3 Task 1
   - **Files**: `src/app/(authenticated)/recipes/page.tsx`

4. **Add Discovery Page** [M]
   - Create dedicated `/recipes/discover` page
   - Show only API and AI recipes
   - Prominent search and filters
   - "Import to My Recipes" button
   - **Acceptance**: Dedicated discovery experience
   - **Dependencies**: Section 3 Task 1
   - **Files**: New `src/app/(authenticated)/recipes/discover/page.tsx`

---

### Phase 3: Shopping List Management

#### Section 1: Data Layer

**Objective**: Implement shopping list backend logic

**Tasks**:

1. **Create Shopping List Service** [M]
   - Implement CRUD operations
   - Create `shopping-list-service.ts`
   - Add ingredient consolidation logic
   - Handle quantity conversions (cups/tbsp/etc)
   - **Acceptance**: Can create, read, update, delete lists
   - **Dependencies**: Database tables exist
   - **Files**: New `src/lib/services/shopping-list-service.ts`

2. **Add Recipe Import Function** [M]
   - Extract ingredients from recipe
   - Map to shopping list items
   - Adjust quantities based on servings
   - Group by category (produce, dairy, etc)
   - **Acceptance**: Can import recipe ingredients to list
   - **Dependencies**: Section 1 Task 1
   - **Files**: `src/lib/services/shopping-list-service.ts`

3. **Implement Consolidation Algorithm** [M]
   - Detect duplicate ingredients
   - Sum quantities with unit conversion
   - Handle partial matches ("chicken breast" vs "chicken")
   - **Acceptance**: Duplicates automatically combined
   - **Dependencies**: Section 1 Task 1
   - **Files**: `src/lib/services/shopping-list-service.ts`

#### Section 2: Shopping List UI

**Objective**: Build shopping list interface

**Tasks**:

1. **Create Shopping List Page** [L]
   - List all shopping lists
   - "New List" button
   - Show item count and creation date
   - Delete lists with confirmation
   - **Acceptance**: Can view and manage lists
   - **Dependencies**: Section 1 Task 1
   - **Files**: `src/app/(authenticated)/shopping-list/page.tsx`

2. **Build List Detail View** [L]
   - Show all items with checkboxes
   - Group by category
   - Add manual items
   - Delete individual items
   - Show recipe source for items
   - **Acceptance**: Can check off items, add manually
   - **Dependencies**: Section 2 Task 1
   - **Files**: Update `shopping-list/page.tsx`, new components

3. **Add "Add to Shopping List" Button** [M]
   - Add button to recipe detail page
   - Show modal to select target list
   - Option to create new list
   - Confirm ingredient import
   - **Acceptance**: Can add recipe to shopping list
   - **Dependencies**: Section 1 Task 2, Section 2 Task 1
   - **Files**: `src/components/recipe/RecipeDetail.tsx`, new modal

4. **Mobile Optimization** [S]
   - Large checkboxes (easy to tap)
   - Swipe to delete items
   - Bottom sheet for adding items
   - **Acceptance**: Easy to use while shopping
   - **Dependencies**: Section 2 Task 2
   - **Files**: Update shopping list components

---

### Phase 4: Meal Planning Calendar

#### Section 1: Data Layer

**Objective**: Implement meal planning backend

**Tasks**:

1. **Create Meal Plan Service** [M]
   - CRUD operations for meal plans
   - Get week's meals by date range
   - Assign recipes to date/meal-type
   - Update servings per meal
   - **Acceptance**: Can schedule meals
   - **Dependencies**: Database tables exist
   - **Files**: New `src/lib/services/meal-plan-service.ts`

2. **Add Batch Shopping List Generator** [M]
   - Collect all recipes for week
   - Extract all ingredients
   - Apply consolidation algorithm
   - Adjust for servings
   - **Acceptance**: Can generate list from week
   - **Dependencies**: Phase 3 Section 1, Section 1 Task 1
   - **Files**: `src/lib/services/meal-plan-service.ts`

#### Section 2: Calendar UI

**Objective**: Build weekly meal planner

**Tasks**:

1. **Create Calendar Page** [XL]
   - Weekly grid view (7 days × 3 meals)
   - Show current week with navigation
   - Empty state for unplanned meals
   - Mobile: vertical scroll, desktop: grid
   - **Acceptance**: Can view week's meal plan
   - **Dependencies**: Section 1 Task 1
   - **Files**: `src/app/(authenticated)/meal-plan/page.tsx`

2. **Build Recipe Picker Modal** [L]
   - Search/filter recipes
   - Show recipe preview
   - Adjust servings before adding
   - **Acceptance**: Can select recipe for slot
   - **Dependencies**: Section 2 Task 1
   - **Files**: New `src/components/meal-plan/RecipePicker.tsx`

3. **Implement Meal Slot Component** [M]
   - Show assigned recipe with image
   - Click to change/remove
   - Show servings
   - Edit servings inline
   - **Acceptance**: Can assign and manage meals
   - **Dependencies**: Section 2 Task 1, Task 2
   - **Files**: New `src/components/meal-plan/MealSlot.tsx`

4. **Add "Generate Shopping List" Button** [M]
   - Button above calendar
   - Show preview of items
   - Option to name the list
   - Confirm and create
   - **Acceptance**: Can generate list from week
   - **Dependencies**: Section 1 Task 2, Section 2 Task 1
   - **Files**: `meal-plan/page.tsx`

---

## Risk Assessment and Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| API rate limits (TheMealDB) | High | Medium | Implement caching, local storage |
| AI token costs (Claude) | Medium | Medium | Add generation limits, prompt optimization |
| Database costs at scale | Medium | Low | Supabase free tier sufficient for personal use |
| Mobile performance | Medium | Medium | Code splitting, lazy loading, image optimization |

### Implementation Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Scope creep | Medium | High | Stick to phase plan, defer features |
| Third-party API changes | Medium | Medium | Version lock, adapter pattern isolates impact |
| Data migration issues | High | Low | Test migrations, backup data |
| Browser compatibility | Low | Low | Use standard APIs, test on major browsers |

### Mitigation Strategies

1. **API Integration**:
   - Start with API adapter, verify it works before UI
   - Cache aggressively to reduce API calls
   - Graceful degradation if API unavailable

2. **AI Generation**:
   - Set generation limits (e.g., 10/day for free tier)
   - Validate output thoroughly
   - Provide fallback to manual entry

3. **Data Quality**:
   - Validate all user input with Zod
   - Sanitize data from external sources
   - Regular database backups

4. **Performance**:
   - Server Components by default
   - Client Components only when needed
   - Image optimization with Next.js Image
   - Pagination for large lists

---

## Success Metrics

### Phase 2 Success Criteria

- [ ] Can search and view recipes from TheMealDB
- [ ] API recipes cached in database
- [ ] Can generate recipes with Claude AI
- [ ] AI recipes validate correctly
- [ ] Multi-source search returns results from all sources
- [ ] Source badges clearly indicate recipe origin
- [ ] No performance degradation from Phase 1

### Phase 3 Success Criteria

- [ ] Can create shopping lists
- [ ] Can add recipes to shopping lists
- [ ] Duplicate ingredients automatically consolidated
- [ ] Can check off items
- [ ] Can add manual items
- [ ] Shopping lists mobile-optimized

### Phase 4 Success Criteria

- [ ] Weekly calendar displays meals
- [ ] Can assign recipes to meal slots
- [ ] Can adjust servings per meal
- [ ] Can generate shopping list from week
- [ ] Calendar works on mobile and desktop
- [ ] Navigation between weeks smooth

### Overall Quality Metrics

- Build time: < 30 seconds
- Lighthouse score: > 90
- TypeScript errors: 0
- Test coverage: > 70% (when tests added)
- Mobile-first: All features usable on mobile

---

## Required Resources and Dependencies

### Phase 2 Dependencies

**External Services**:
- TheMealDB API (free, no key required)
- Claude API (requires API key, pay-as-you-go)
  - Cost: ~$0.02 per recipe generation
  - Budget: $5/month = 250 recipes

**Environment Variables**:
```env
MEAL_DB_API_KEY=1  # Free tier
ANTHROPIC_API_KEY=sk-ant-xxx  # Your API key
```

**Package Dependencies**:
```json
{
  "@anthropic-ai/sdk": "^0.30.0"  # For Claude AI
}
```

### Phase 3 Dependencies

**Database**: Tables already exist (shopping_lists, shopping_list_items)

**No new external dependencies**

### Phase 4 Dependencies

**Database**: Table already exists (meal_plans)

**Optional Libraries**:
```json
{
  "date-fns": "^3.0.0"  # Date manipulation
  "react-day-picker": "^9.0.0"  # Optional: enhanced calendar
}
```

---

## Timeline Estimates

### Phase 2: Multi-Source Recipes
- **Estimated Duration**: 2-3 days
- **Breakdown**:
  - API Integration: 1 day
  - AI Integration: 1 day
  - Multi-source UI: 0.5-1 day
- **Complexity**: Medium (well-defined architecture exists)

### Phase 3: Shopping Lists
- **Estimated Duration**: 2-3 days
- **Breakdown**:
  - Data layer: 1 day
  - UI components: 1-2 days
- **Complexity**: Medium (consolidation algorithm is tricky)

### Phase 4: Meal Planning
- **Estimated Duration**: 3-4 days
- **Breakdown**:
  - Calendar UI: 2 days
  - Integration: 1-2 days
- **Complexity**: High (complex UI, many interactions)

### Total for All Phases
- **Best Case**: 7 days
- **Realistic**: 10 days
- **With buffer**: 14 days

---

## Development Workflow

### Adding New Features

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/api-integration
   ```

2. **Implement Following TDD** (when applicable)
   - Write tests first
   - Implement feature
   - Refactor

3. **Test Locally**
   ```bash
   npm run dev
   npm run build
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add TheMealDB API integration"
   git push origin feature/api-integration
   ```

5. **Vercel Auto-Deploys Preview**
   - Test on preview URL
   - Verify all features work

6. **Merge to Main**
   ```bash
   git checkout master
   git merge feature/api-integration
   git push
   ```

7. **Production Deployment**
   - Automatic on push to master
   - Monitor Vercel dashboard

### Code Quality Checks

- [ ] TypeScript compiles with no errors
- [ ] ESLint passes
- [ ] All routes render correctly
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Environment variables documented

---

## Notes and Decisions

### Architectural Decisions

1. **Why Adapter Pattern?**
   - Makes adding new recipe sources trivial
   - Each source is completely isolated
   - Easy to test individual sources
   - Can disable sources without code changes

2. **Why No Authentication for Personal Use?**
   - Eliminates complexity
   - Faster development
   - No auth debugging
   - Perfect for single-user deployment

3. **Why Supabase?**
   - PostgreSQL (mature, reliable)
   - Built-in auth (if needed later)
   - Storage for images
   - Real-time capabilities (future)
   - Generous free tier

4. **Why Next.js App Router?**
   - Server Components = faster
   - File-based routing
   - Built-in optimization
   - Vercel integration

### Future Enhancements (Beyond Phase 4)

- Recipe ratings and favorites
- Recipe categories and collections
- Print-friendly recipe view
- Recipe sharing via link
- Export recipes to PDF
- Nutritional information
- Recipe notes and modifications
- Recipe photos from phone
- Voice-controlled cooking mode
- Integration with smart displays

---

## Conclusion

The Recipe Book has a solid foundation with a modular architecture that makes future enhancements straightforward. The adapter pattern is the key architectural decision that enables clean separation of concerns and easy extensibility.

Phases 2-4 build incrementally on this foundation, adding value without increasing complexity. Each phase is independently useful and can be deployed separately.

The focus should remain on personal use, mobile-first design, and simplicity. Feature creep is the biggest risk - stick to the plan and defer "nice-to-have" features.

**Status**: Phase 1 Complete ✅
**Next**: Begin Phase 2 when ready
