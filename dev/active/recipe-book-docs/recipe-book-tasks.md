# Recipe Book - Task Checklist

**Last Updated: 2026-02-11**

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
- [x] Button component
- [x] Card component
- [x] Input component
- [x] Textarea component
- [x] Modal component
- [x] Spinner component
- [x] Badge component

### Recipe Features
- [x] Recipe listing page
- [x] Recipe detail page
- [x] Recipe create form
- [x] Recipe edit form
- [x] Recipe delete function
- [x] RecipeCard component
- [x] RecipeForm component (complex)
- [x] IngredientList component
- [x] InstructionSteps component

### Layout
- [x] Header component
- [x] Bottom navigation
- [x] Mobile-responsive design
- [x] Authenticated layout

### Deployment
- [x] Push to GitHub
- [x] Deploy to Vercel
- [x] Configure environment variables
- [x] Test live deployment

---

## Phase 2: Multi-Source Recipes 🎯 NEXT

### Section 1: TheMealDB API Integration

#### Implementation
- [ ] Study TheMealDB API documentation
- [ ] Test API endpoints in browser/Postman
- [ ] Implement `ApiRecipeAdapter.getRecipeById()`
- [ ] Implement `ApiRecipeAdapter.searchRecipes()`
- [ ] Create format transformation functions
- [ ] Handle API errors and edge cases
- [ ] Test adapter in isolation

#### Caching
- [ ] Add API recipe caching logic
- [ ] Save fetched recipes to Supabase
- [ ] Implement cache check before API call
- [ ] Add cache expiration logic
- [ ] Test cache hit/miss scenarios

#### UI Updates
- [ ] Add search bar to recipes page
- [ ] Implement source type filter
- [ ] Add category filter (from API)
- [ ] Update RecipeCard for API recipes
- [ ] Test multi-source display

### Section 2: AI Recipe Generation

#### Anthropic SDK Setup
- [ ] Install `@anthropic-ai/sdk` package
- [ ] Set up API key in environment
- [ ] Create Anthropic client wrapper
- [ ] Test basic API connection

#### Adapter Implementation
- [ ] Design recipe generation prompt template
- [ ] Implement `AiRecipeAdapter.generateRecipe()`
- [ ] Create Zod schema for AI response
- [ ] Validate AI output format
- [ ] Handle API errors and retries
- [ ] Add token usage tracking
- [ ] Test generation with various prompts

#### Generation UI
- [ ] Create `/recipes/generate` page
- [ ] Build prompt input form
- [ ] Add example prompts/templates
- [ ] Show loading state with spinner
- [ ] Display generated recipe preview
- [ ] Add "Save" button
- [ ] Add "Regenerate" button
- [ ] Handle errors gracefully

#### Storage
- [ ] Save AI recipes to database
- [ ] Link to generation prompt
- [ ] Add metadata (tokens used, model, etc)
- [ ] Test saving and retrieval

### Section 3: Multi-Source Integration

#### Service Updates
- [ ] Update `RecipeService.searchAllSources()`
- [ ] Implement parallel source querying
- [ ] Add error handling per source
- [ ] Aggregate results properly
- [ ] Test with all sources enabled

#### Factory Updates
- [ ] Enable API adapter in factory
- [ ] Enable AI adapter in factory
- [ ] Update `getEnabledSources()`
- [ ] Test factory returns all adapters

#### UI Enhancement
- [ ] Add source tabs to recipes page
- [ ] Implement tab filtering
- [ ] Add "All" / "My Recipes" / "Discover" / "AI" tabs
- [ ] Maintain search state across tabs
- [ ] Style active tab indicator

#### Discovery Page (Optional)
- [ ] Create `/recipes/discover` page
- [ ] Show only API and AI recipes
- [ ] Prominent search and filters
- [ ] "Save to My Recipes" functionality
- [ ] Test discovery flow

### Testing & Polish
- [ ] Test all adapters independently
- [ ] Test multi-source search
- [ ] Verify source badges display correctly
- [ ] Check mobile responsiveness
- [ ] Test on multiple browsers
- [ ] Verify no performance degradation

### Deployment
- [ ] Update environment variables in Vercel
- [ ] Add `ANTHROPIC_API_KEY`
- [ ] Deploy Phase 2 changes
- [ ] Test live deployment
- [ ] Monitor API usage and costs

---

## Phase 3: Shopping List Management 📋 PLANNED

### Section 1: Data Layer

#### Service Creation
- [ ] Create `shopping-list-service.ts`
- [ ] Implement CRUD operations
- [ ] Create shopping list
- [ ] Read shopping lists
- [ ] Update shopping list
- [ ] Delete shopping list
- [ ] Test service functions

#### Recipe Import Function
- [ ] Extract ingredients from recipe
- [ ] Map to shopping list items
- [ ] Adjust quantities based on servings
- [ ] Group by category (optional)
- [ ] Test import logic

#### Consolidation Algorithm
- [ ] Detect duplicate ingredients
- [ ] Sum quantities with unit conversion
- [ ] Handle partial matches
- [ ] Test consolidation edge cases

### Section 2: UI Components

#### List Management
- [ ] Create shopping list page
- [ ] List all shopping lists
- [ ] "New List" button
- [ ] Delete list with confirmation
- [ ] Test list CRUD

#### List Detail View
- [ ] Show all items with checkboxes
- [ ] Group items by category
- [ ] Add manual item form
- [ ] Delete individual items
- [ ] Show recipe source per item
- [ ] Test checking items on/off

#### Recipe Integration
- [ ] Add "Add to Shopping List" button to recipe page
- [ ] Create list selection modal
- [ ] Option to create new list
- [ ] Confirm ingredient import
- [ ] Test adding from recipe

#### Mobile Optimization
- [ ] Large checkboxes (easy to tap)
- [ ] Swipe to delete (optional)
- [ ] Bottom sheet for adding items
- [ ] Test on mobile device

### Testing & Polish
- [ ] Test consolidation algorithm
- [ ] Verify quantities sum correctly
- [ ] Check mobile UX
- [ ] Test edge cases (empty list, etc)

### Deployment
- [ ] Deploy Phase 3 changes
- [ ] Test live deployment
- [ ] Verify shopping list functionality

---

## Phase 4: Meal Planning Calendar 📅 PLANNED

### Section 1: Data Layer

#### Service Creation
- [ ] Create `meal-plan-service.ts`
- [ ] Implement CRUD for meal plans
- [ ] Get week's meals by date range
- [ ] Assign recipe to date/meal-type
- [ ] Update servings per meal
- [ ] Test service functions

#### Shopping List Integration
- [ ] Collect all recipes for week
- [ ] Extract all ingredients
- [ ] Apply consolidation algorithm
- [ ] Adjust for servings
- [ ] Generate shopping list
- [ ] Test batch generation

### Section 2: Calendar UI

#### Calendar Page
- [ ] Create `/meal-plan` page
- [ ] Build weekly grid component
- [ ] Show days of week
- [ ] Show meal slots (breakfast/lunch/dinner)
- [ ] Handle empty states
- [ ] Add week navigation (prev/next)
- [ ] Test calendar display

#### Recipe Picker Modal
- [ ] Create recipe picker component
- [ ] Search/filter recipes
- [ ] Show recipe preview
- [ ] Adjust servings before adding
- [ ] Confirm selection
- [ ] Test picker flow

#### Meal Slot Component
- [ ] Create meal slot component
- [ ] Show assigned recipe with image
- [ ] Click to change/remove
- [ ] Show servings
- [ ] Edit servings inline
- [ ] Test slot interactions

#### Shopping List Generation
- [ ] Add "Generate Shopping List" button
- [ ] Show preview of items
- [ ] Option to name the list
- [ ] Confirm and create
- [ ] Test generation from week

### Mobile Optimization
- [ ] Vertical scroll for mobile
- [ ] Grid view for desktop
- [ ] Touch-friendly interactions
- [ ] Test responsiveness

### Testing & Polish
- [ ] Test calendar navigation
- [ ] Verify recipe assignment
- [ ] Check serving adjustments
- [ ] Test shopping list generation
- [ ] Mobile testing

### Deployment
- [ ] Deploy Phase 4 changes
- [ ] Test live deployment
- [ ] Full end-to-end testing

---

## Future Enhancements 🚀 BACKLOG

### Recipe Features
- [ ] Recipe ratings and favorites
- [ ] Recipe categories/collections
- [ ] Recipe tags autocomplete
- [ ] Duplicate recipe function
- [ ] Recipe import from URL
- [ ] Recipe export to PDF
- [ ] Print-friendly recipe view

### Shopping List Enhancements
- [ ] Reorder items by drag-drop
- [ ] Price tracking
- [ ] Store locations
- [ ] Share shopping list
- [ ] Voice input for items

### Meal Planning Enhancements
- [ ] Monthly calendar view
- [ ] Meal templates (e.g., "Italian Week")
- [ ] Nutritional tracking
- [ ] Calorie counting
- [ ] Dietary restrictions filter

### Social Features (if multi-user added)
- [ ] Share recipes publicly
- [ ] Recipe comments and reviews
- [ ] Follow other users
- [ ] Recipe collections
- [ ] Social feed

### Advanced Features
- [ ] Recipe notes and modifications
- [ ] Cooking timer integration
- [ ] Voice-controlled cooking mode
- [ ] Smart display integration
- [ ] Barcode scanner for ingredients
- [ ] Nutritional information API
- [ ] Recipe recommendations (ML)
- [ ] Seasonal ingredient suggestions

### Technical Improvements
- [ ] Add automated testing
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics (optional)
- [ ] PWA support (offline mode)
- [ ] Dark mode
- [ ] i18n (internationalization)

---

## Maintenance Tasks 🔧 ONGOING

### Regular Checks
- [ ] Monitor Vercel deployments
- [ ] Check Supabase usage
- [ ] Review API costs (Phase 2+)
- [ ] Update dependencies monthly
- [ ] Backup database weekly
- [ ] Review error logs

### Documentation
- [ ] Keep README updated
- [ ] Document new features
- [ ] Update API documentation
- [ ] Maintain changelog

### Security
- [ ] Rotate API keys quarterly
- [ ] Review RLS policies
- [ ] Check for dependency vulnerabilities
- [ ] Update Node.js version

---

## Notes

### Priority Levels
- 🎯 **NEXT**: Current focus
- ✅ **COMPLETE**: Finished
- 📋 **PLANNED**: Designed, ready to implement
- 🚀 **BACKLOG**: Future ideas

### Effort Estimates
- **S** (Small): < 2 hours
- **M** (Medium): 2-4 hours
- **L** (Large): 4-8 hours
- **XL** (Extra Large): > 8 hours

### Dependencies
Tasks marked with arrows (→) depend on completion of previous tasks in the same section.

---

**Track your progress by checking off tasks as you complete them!**

**Current Phase**: Phase 1 Complete ✅
**Next Phase**: Phase 2 - Multi-Source Recipes 🎯
