# Cometest Portal - Development Guidelines

## Project Overview
Cometest Portal is an interactive 3D web platform for educational simulations and games built with React, Three.js, and Vite. The portal provides users with immersive learning experiences through 3D visualizations.

## Architecture

### Data Structure
- **Games**: Located in `src/config/gamesData.ts` - Web games with specific IDs
- **Simulations**: Located in `src/config/simulationsData.ts` - Educational 3D simulations with category assignments

### Routing Structure
```
/                           → Home/Index page
/game                       → Generic games/labs list (Web Games tab only)
/game/:gameId              → Specific game renderer
/simulation/:simulationId  → Specific simulation renderer
/chemistry                 → Dedicated Chemistry category page
/category/:categoryId      → Other category pages
```

### Category Organization
Categories are STRICTLY divided:
- **Web Games**: Only games appear on `/game` route
- **Category Pages**: Each specialized category gets a dedicated route:
  - `/chemistry` → Physics & Chemistry simulations (physics_chemistry category)
  - Future: Biology, Earth Science, etc.

## CATEGORY & ROUTING STRICT RULE 🚨

### MANDATORY REQUIREMENTS FOR ALL SIMULATIONS:
1. **EVERY simulation MUST have a `category` property** in `simulationsData.ts`
   - Example: `category: 'physics_chemistry'` for chemistry simulations
   
2. **NEVER append simulations to generic lists**
   - Physics & Chemistry simulations MUST ONLY appear on `/chemistry` page
   - MUST be removed from the generic `/game` Educational Labs tab
   
3. **Strict User Flow**:
   ```
   Home → Click Category (Chemistry) → See filtered simulations → Click simulation card → Enter 3D canvas
   ```

4. **No Hardcoded Dummy Data**
   - NEVER hardcode "Sample Simulation 1", "Sample 2", etc.
   - ALWAYS use `.filter()` on the central SIMULATIONS_DATA array
   - ALWAYS use the `getSimulationsByCategory()` helper function

5. **Back Button Navigation**
   - Chemistry simulations MUST have smart back button that returns to `/chemistry`
   - Implemented in `Simulation.tsx` with category-aware logic

### Implementation Checklist for New Simulations:
- [ ] Add simulation object to `SIMULATIONS_DATA` with proper `category` field
- [ ] Create component in `src/components/simulations/`
- [ ] Add lazy import to `Simulation.tsx`
- [ ] Add case to renderSimulation switch statement
- [ ] Update `Simulation.tsx` handleBackClick to recognize new category
- [ ] Test routing: click category → see simulation in list → click card → load simulation → click back → return to category page
- [ ] Do NOT add to generic `/game` route

## Key Files & Responsibilities

| File | Purpose | Strict Rule |
|------|---------|------------|
| `src/config/simulationsData.ts` | Central simulation registry | MUST have category for every sim |
| `src/pages/ChemistryPage.tsx` | Chemistry category page | ONLY shows physics_chemistry sims via filter |
| `src/pages/GameList.tsx` | Generic game/lab list | MUST NOT show physics_chemistry sims |
| `src/pages/Simulation.tsx` | Universal sim renderer | MUST have smart back button logic |
| `src/components/SimulationCard.tsx` | Card UI component | Reusable, no hardcoded data |

## Common Pitfalls to Avoid

❌ **DO NOT:**
- Mix simulations into the generic `/game` route
- Hardcode simulation cards in category pages
- Create simulations without a category assignment
- Show same simulation in multiple category pages

✅ **DO:**
- Use `.filter()` and `getSimulationsByCategory()` for filtering
- Assign ONE category per simulation
- Use dedicated category pages for grouped simulations
- Test the full routing flow before committing

## Testing Checklist
Before deploying any simulation or category changes:
1. [ ] Navigate to `/chemistry` - verify only physics_chemistry sims appear
2. [ ] Navigate to `/game` Educational Labs - verify NO physics_chemistry sims
3. [ ] Click chemistry simulation card - verify it loads
4. [ ] Click back button - verify returns to `/chemistry` (not `/game`)
5. [ ] Inspect browser console - no routing errors
6. [ ] Test TypeScript build: `npm run build`
7. [ ] Test dev server: `npm run dev`
