# MySuper Fund Search — Feature 1a Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Page 1 of the APRA Member Fund Webapp — a preemptive fuzzy-search interface that lets members find and select their MySuper fund, with a confirmed selection card and navigation to Page 2.

**Architecture:** Client-side only React 18 app; `performance-data.json` is fetched once at startup via a `DataProvider` context and shared app-wide via `usePerformanceData()`. Fuse.js performs fuzzy search in-memory. React Router v6 with HashRouter handles navigation between pages. Page 1 owns all search state locally in `SearchPage`.

**Tech Stack:** React 18, Vite 6, TypeScript 5 (strict), Tailwind CSS v3, Fuse.js 7, React Router DOM 6, Vitest + Testing Library (added by this plan)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/types/performance.ts` | All TS types: MySuperProduct, PerformanceData, RagColour, PassFail |
| Create | `src/utils/search.ts` | Fuse.js instance factory + `highlightMatches()` |
| Create | `src/utils/formatters.ts` | `formatPercent()` |
| Create | `src/context/PerformanceDataContext.tsx` | Fetches JSON once; provides mysuper[], meta, loading, error |
| Create | `src/hooks/usePerformanceData.ts` | Thin wrapper consuming the context |
| Create | `src/main.tsx` | App entry point |
| Create | `src/App.tsx` | DataProvider + HashRouter + Routes |
| Create | `src/index.css` | Tailwind directives |
| Create | `src/components/DataFreshnessLabel.tsx` | Renders "Data last updated: June 2025" |
| Create | `src/components/FundDropdownItem.tsx` | ARIA option with highlighted text |
| Create | `src/components/FundDropdown.tsx` | ARIA listbox; scrollable; result count footer |
| Create | `src/components/FundSearchInput.tsx` | ARIA combobox text input |
| Create | `src/components/SelectedFund.tsx` | Confirmed selection card + metrics notice + nav button |
| Create | `src/pages/SearchPage.tsx` | Page 1 — owns all search/selection state |
| Create | `src/pages/DashboardPage.tsx` | Page 2 stub — receives fund via router state |
| Create | `src/tests/search.test.ts` | Unit tests: highlightMatches, Fuse results |
| Modify | `index.html` | Set title and description meta |
| Modify | `package.json` | Add vitest + @testing-library deps |
| Modify | `vite.config.ts` | Add test config block |

---

## Task 1: Bootstrap the Vite project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- Create: `tailwind.config.js`, `postcss.config.js`
- Create: `index.html`
- Create: `src/index.css`

- [ ] **Step 1: Scaffold new Vite React-TS project**

```bash
npm create vite@latest member-fund-webapp -- --template react-ts
cd member-fund-webapp
```

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install react-router-dom fuse.js
```

- [ ] **Step 3: Install Tailwind CSS v3**

```bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 4: Install Vitest and Testing Library**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 5: Configure tailwind.config.js**

Replace the generated file with:
```javascript
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 6: Configure vite.config.ts with test block**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
  },
})
```

- [ ] **Step 7: Create test setup file**

Create `src/tests/setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 8: Add test script to package.json**

Add to the `scripts` block:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 9: Update tsconfig.app.json to include tests**

Ensure `"include"` covers `src` (tests live under `src/tests/`). The default scaffold includes `src` so this is usually fine. Confirm `tsconfig.app.json` has:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

- [ ] **Step 10: Add Tailwind directives to src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 11: Update index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>APRA Member Fund Performance</title>
    <meta name="description" content="Check your superannuation fund's APRA performance test status and history" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 12: Copy performance-data.json into public/**

```bash
cp "C:\Users\alpes\.claude\Member Performance Data\outputs\apra-skills\apra_work\performance-data.json" public/
```

- [ ] **Step 13: Verify dev server starts**

```bash
npm run dev
```
Expected: Vite serves the app at http://localhost:5173. Browser shows the default scaffold page. No console errors.

- [ ] **Step 14: Commit**

```bash
git add .
git commit -m "feat: bootstrap Vite + React + TS + Tailwind v3 + Fuse.js + Vitest"
```

---

## Task 2: TypeScript types

**Files:**
- Create: `src/types/performance.ts`

- [ ] **Step 1: Create the types file**

```typescript
// src/types/performance.ts
export type RagColour = 'Green' | 'Amber' | 'Red' | null
export type PassFail = 'Pass' | 'Fail' | 'Unknown' | null

export interface MySuperProduct {
  product_name: string
  current_metrics_available: boolean
  pass_fail_current: PassFail
  nir_10yr: number | null
  nir_rag: RagColour
  fees_50k: number | null
  fees_50k_rag: RagColour
  fees_100k: number | null
  fees_100k_rag: RagColour
  history: Record<string, PassFail>
}

export interface PerformanceMeta {
  last_updated: string
  source_years_mysuper: string[]
  source_years_tdp: string[]
  total_mysuper_products: number
  total_tdp_options: number
}

export interface PerformanceData extends PerformanceMeta {
  mysuper_products: MySuperProduct[]
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/performance.ts
git commit -m "feat: add TypeScript types for performance data schema"
```

---

## Task 3: Utility functions — search.ts and formatters.ts

**Files:**
- Create: `src/utils/search.ts`
- Create: `src/utils/formatters.ts`
- Create: `src/tests/search.test.ts`

- [ ] **Step 1: Write failing tests for highlightMatches**

Create `src/tests/search.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { highlightMatches } from '../utils/search'

describe('highlightMatches', () => {
  it('returns whole string as non-highlighted when no indices', () => {
    expect(highlightMatches('AustralianSuper', [])).toEqual([
      { text: 'AustralianSuper', highlight: false },
    ])
  })

  it('highlights a single range at the start', () => {
    expect(highlightMatches('AustralianSuper', [[0, 2]])).toEqual([
      { text: 'Aus', highlight: true },
      { text: 'tralianSuper', highlight: false },
    ])
  })

  it('highlights a range in the middle', () => {
    expect(highlightMatches('AustralianSuper', [[10, 13]])).toEqual([
      { text: 'Australian', highlight: false },
      { text: 'Supe', highlight: true },
      { text: 'r', highlight: false },
    ])
  })

  it('highlights a range at the end', () => {
    expect(highlightMatches('MySuper', [[2, 6]])).toEqual([
      { text: 'My', highlight: false },
      { text: 'Super', highlight: true },
    ])
  })

  it('merges overlapping ranges', () => {
    expect(highlightMatches('AustralianSuper', [[0, 3], [2, 5]])).toEqual([
      { text: 'Australi', highlight: true },
      { text: 'anSuper', highlight: false },
    ])
  })

  it('merges adjacent ranges', () => {
    expect(highlightMatches('AustralianSuper', [[0, 2], [3, 5]])).toEqual([
      { text: 'Australi', highlight: true },
      { text: 'anSuper', highlight: false },
    ])
  })

  it('handles a full-string match', () => {
    expect(highlightMatches('Super', [[0, 4]])).toEqual([
      { text: 'Super', highlight: true },
    ])
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test
```
Expected: FAIL — "Cannot find module '../utils/search'"

- [ ] **Step 3: Create src/utils/search.ts**

```typescript
import Fuse from 'fuse.js'
import type { MySuperProduct } from '../types/performance'

const FUSE_OPTIONS: Fuse.IFuseOptions<MySuperProduct> = {
  keys: ['product_name'],
  threshold: 0.5,
  includeMatches: true,
  // NOTE: minMatchCharLength is about match length within results, NOT query length.
  // The 2-char minimum for showing the dropdown is enforced in SearchPage UI logic.
}

export function createFuseInstance(products: MySuperProduct[]) {
  return new Fuse(products, FUSE_OPTIONS)
}

export type HighlightSegment = { text: string; highlight: boolean }

/**
 * Converts Fuse.js match indices into segments for highlighted rendering.
 * Handles overlapping and adjacent ranges by merging them before splitting.
 */
export function highlightMatches(
  text: string,
  indices: readonly [number, number][],
): HighlightSegment[] {
  if (!indices.length) return [{ text, highlight: false }]

  // Sort by start index, then merge overlapping/adjacent ranges
  const sorted = [...indices].sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1]
    if (last && start <= last[1] + 1) {
      last[1] = Math.max(last[1], end)
    } else {
      merged.push([start, end])
    }
  }

  const segments: HighlightSegment[] = []
  let lastIndex = 0
  for (const [start, end] of merged) {
    if (start > lastIndex) {
      segments.push({ text: text.slice(lastIndex, start), highlight: false })
    }
    segments.push({ text: text.slice(start, end + 1), highlight: true })
    lastIndex = end + 1
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), highlight: false })
  }

  return segments
}
```

- [ ] **Step 4: Create src/utils/formatters.ts**

```typescript
export function formatPercent(value: number | null): string {
  if (value === null) return 'Not available'
  return (value * 100).toFixed(2) + '% p.a.'
}
```

- [ ] **Step 5: Run tests — expect pass**

```bash
npm test
```
Expected: All 7 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/utils/search.ts src/utils/formatters.ts src/tests/search.test.ts src/tests/setup.ts
git commit -m "feat: add Fuse.js search utility and highlightMatches with tests"
```

---

## Task 4: Data context and hook

**Files:**
- Create: `src/context/PerformanceDataContext.tsx`
- Create: `src/hooks/usePerformanceData.ts`

- [ ] **Step 1: Create PerformanceDataContext.tsx**

```typescript
// src/context/PerformanceDataContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import type { MySuperProduct, PerformanceMeta, PerformanceData } from '../types/performance'

interface PerformanceDataContextValue {
  mysuper: MySuperProduct[]
  meta: PerformanceMeta | null
  loading: boolean
  error: string | null
}

const PerformanceDataContext = createContext<PerformanceDataContextValue>({
  mysuper: [],
  meta: null,
  loading: true,
  error: null,
})

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [mysuper, setMysuper] = useState<MySuperProduct[]>([])
  const [meta, setMeta] = useState<PerformanceMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/performance-data.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<PerformanceData>
      })
      .then((data) => {
        if (!Array.isArray(data.mysuper_products) || data.mysuper_products.length === 0) {
          throw new Error('Fund data is currently unavailable.')
        }
        setMysuper(data.mysuper_products)
        setMeta({
          last_updated: data.last_updated,
          source_years_mysuper: data.source_years_mysuper,
          source_years_tdp: data.source_years_tdp,
          total_mysuper_products: data.total_mysuper_products,
          total_tdp_options: data.total_tdp_options,
        })
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <PerformanceDataContext.Provider value={{ mysuper, meta, loading, error }}>
      {children}
    </PerformanceDataContext.Provider>
  )
}

export function usePerformanceDataContext() {
  return useContext(PerformanceDataContext)
}
```

- [ ] **Step 2: Create usePerformanceData.ts**

```typescript
// src/hooks/usePerformanceData.ts
import { usePerformanceDataContext } from '../context/PerformanceDataContext'

export function usePerformanceData() {
  return usePerformanceDataContext()
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/context/PerformanceDataContext.tsx src/hooks/usePerformanceData.ts
git commit -m "feat: add DataProvider context and usePerformanceData hook"
```

---

## Task 5: App shell — main.tsx and App.tsx

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`

Note: `DashboardPage` will be a stub created in Task 12 — create it as a placeholder here so routing compiles.

- [ ] **Step 1: Create src/main.tsx**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 2: Create a placeholder DashboardPage for routing to compile**

Create `src/pages/DashboardPage.tsx` (will be replaced in Task 12):
```typescript
export function DashboardPage() {
  return <div>Dashboard — coming soon</div>
}
```

- [ ] **Step 3: Create a placeholder SearchPage for routing to compile**

Create `src/pages/SearchPage.tsx` (will be replaced in Task 11):
```typescript
export function SearchPage() {
  return <div>Search — coming soon</div>
}
```

- [ ] **Step 4: Create src/App.tsx**

```typescript
import { HashRouter, Route, Routes } from 'react-router-dom'
import { DataProvider } from './context/PerformanceDataContext'
import { SearchPage } from './pages/SearchPage'
import { DashboardPage } from './pages/DashboardPage'

export function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/fund/:productId" element={<DashboardPage />} />
        </Routes>
      </HashRouter>
    </DataProvider>
  )
}
```

- [ ] **Step 5: Verify dev server and routing**

```bash
npm run dev
```
Expected: App renders at http://localhost:5173/#/. Console shows the JSON fetch in Network tab. No TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/main.tsx src/App.tsx src/pages/SearchPage.tsx src/pages/DashboardPage.tsx
git commit -m "feat: add app shell with HashRouter routing and DataProvider"
```

---

## Task 6: DataFreshnessLabel component

**Files:**
- Create: `src/components/DataFreshnessLabel.tsx`

The `last_updated` field in the JSON is `"2025-06"` (YYYY-MM format). This component parses that into "June 2025".

- [ ] **Step 1: Create DataFreshnessLabel.tsx**

```typescript
// src/components/DataFreshnessLabel.tsx
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface Props {
  lastUpdated: string  // "YYYY-MM" format
}

export function DataFreshnessLabel({ lastUpdated }: Props) {
  const [year, monthStr] = lastUpdated.split('-')
  const monthIndex = parseInt(monthStr, 10) - 1
  const monthName = MONTH_NAMES[monthIndex] ?? monthStr

  return (
    <p className="text-sm text-slate-500">
      Data last updated: {monthName} {year}
    </p>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/DataFreshnessLabel.tsx
git commit -m "feat: add DataFreshnessLabel component"
```

---

## Task 7: FundDropdownItem component

**Files:**
- Create: `src/components/FundDropdownItem.tsx`

This renders a single fund name in the dropdown. It uses `highlightMatches` to bold the matched characters. It must have `role="option"`, a unique `id`, `aria-selected`, and a 44px minimum height.

- [ ] **Step 1: Create FundDropdownItem.tsx**

```typescript
// src/components/FundDropdownItem.tsx
import type { FuseResultMatch } from 'fuse.js'
import { highlightMatches } from '../utils/search'

interface Props {
  id: string
  productName: string
  matches: readonly FuseResultMatch[] | undefined
  isActive: boolean
  onSelect: () => void
}

export function FundDropdownItem({ id, productName, matches, isActive, onSelect }: Props) {
  const nameMatch = matches?.find((m) => m.key === 'product_name')
  const segments = highlightMatches(productName, nameMatch?.indices ?? [])

  return (
    <li
      id={id}
      role="option"
      aria-selected={isActive}
      // mousedown fires before blur, preventing the input from losing focus before selection
      onMouseDown={(e) => {
        e.preventDefault()
        onSelect()
      }}
      className={`flex items-center px-4 min-h-[44px] cursor-pointer text-slate-800 text-sm ${
        isActive ? 'bg-slate-100' : 'hover:bg-slate-50'
      }`}
    >
      {segments.map((seg, i) =>
        seg.highlight ? (
          <strong key={i} className="font-semibold">
            {seg.text}
          </strong>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </li>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/FundDropdownItem.tsx
git commit -m "feat: add FundDropdownItem with match highlighting and ARIA option role"
```

---

## Task 8: FundDropdown component

**Files:**
- Create: `src/components/FundDropdown.tsx`

The dropdown wraps results in a scrollable `<ul>` with `role="listbox"`. It shows a "no results" message when the results array is empty, and a count footer at the bottom.

- [ ] **Step 1: Create FundDropdown.tsx**

```typescript
// src/components/FundDropdown.tsx
import type { FuseResult } from 'fuse.js'
import type { MySuperProduct } from '../types/performance'
import { FundDropdownItem } from './FundDropdownItem'

interface Props {
  id: string
  results: FuseResult<MySuperProduct>[]
  activeIndex: number
  totalProducts: number
  onSelect: (product: MySuperProduct) => void
}

export function FundDropdown({ id, results, activeIndex, totalProducts, onSelect }: Props) {
  return (
    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg">
      <ul
        id={id}
        role="listbox"
        aria-label="Matching MySuper funds"
        className="max-h-72 overflow-y-auto py-1"
      >
        {results.length === 0 ? (
          <li className="px-4 py-3 text-sm text-slate-500 italic">
            No MySuper funds matched your search. Try a shorter or different term.
          </li>
        ) : (
          results.map((result, index) => (
            <FundDropdownItem
              key={result.item.product_name}
              id={`option-${index}`}
              productName={result.item.product_name}
              matches={result.matches}
              isActive={index === activeIndex}
              onSelect={() => onSelect(result.item)}
            />
          ))
        )}
      </ul>
      <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400">
        Showing {results.length} of {totalProducts} MySuper products
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/FundDropdown.tsx
git commit -m "feat: add FundDropdown with scrollable listbox and result count footer"
```

---

## Task 9: FundSearchInput component

**Files:**
- Create: `src/components/FundSearchInput.tsx`

The text input is the ARIA combobox. It must carry `role="combobox"`, `aria-expanded`, `aria-controls` (pointing to the listbox id), `aria-autocomplete="list"`, and `aria-activedescendant` (pointing to the active option id when the dropdown is open and a result is highlighted).

- [ ] **Step 1: Create FundSearchInput.tsx**

```typescript
// src/components/FundSearchInput.tsx
interface Props {
  value: string
  isOpen: boolean
  activeIndex: number
  listboxId: string
  disabled: boolean
  onChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onFocus: () => void
}

export function FundSearchInput({
  value,
  isOpen,
  activeIndex,
  listboxId,
  disabled,
  onChange,
  onKeyDown,
  onFocus,
}: Props) {
  const activeDescendant = isOpen && activeIndex >= 0 ? `option-${activeIndex}` : undefined

  return (
    <div>
      <label htmlFor="fund-search" className="block text-sm font-medium text-slate-700 mb-1">
        Search for your super fund
      </label>
      <input
        id="fund-search"
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeDescendant}
        autoComplete="off"
        disabled={disabled}
        value={value}
        placeholder="Start typing your super fund name…"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        className="w-full px-4 py-3 min-h-[44px] border border-slate-300 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed text-base"
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/FundSearchInput.tsx
git commit -m "feat: add FundSearchInput ARIA combobox component"
```

---

## Task 10: SelectedFund component

**Files:**
- Create: `src/components/SelectedFund.tsx`

Shown after the user picks a fund. Displays the fund name, a "Change" button to go back to search, an amber notice if `current_metrics_available` is false, and a "View performance →" button that navigates to Page 2.

The navigate call passes the full product record as router state so `DashboardPage` can access it without a second data fetch.

- [ ] **Step 1: Create SelectedFund.tsx**

```typescript
// src/components/SelectedFund.tsx
import { useNavigate } from 'react-router-dom'
import type { MySuperProduct } from '../types/performance'

interface Props {
  fund: MySuperProduct
  onClear: () => void
}

export function SelectedFund({ fund, onClear }: Props) {
  const navigate = useNavigate()

  function handleViewPerformance() {
    // Slug the product name for the URL; pass full record as state for Page 2
    const slug = fund.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    navigate(`/fund/${slug}`, { state: { fund } })
  }

  return (
    <div className="mt-4 p-4 border border-slate-200 rounded-md bg-slate-50">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          Selected:{' '}
          <span className="font-semibold text-slate-800">{fund.product_name}</span>
        </p>
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-slate-500 underline min-h-[44px] min-w-[44px] flex items-center"
        >
          Change
        </button>
      </div>

      {!fund.current_metrics_available && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
          Current year metrics are not available for this product. Pass/Fail status and history are
          still shown.
        </div>
      )}

      <button
        type="button"
        onClick={handleViewPerformance}
        className="mt-4 w-full py-3 min-h-[44px] bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 active:bg-slate-900 transition-colors"
      >
        View performance →
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/SelectedFund.tsx
git commit -m "feat: add SelectedFund confirmation card with metrics notice and navigation"
```

---

## Task 11: SearchPage — wire everything together

**Files:**
- Modify: `src/pages/SearchPage.tsx` (replace the placeholder from Task 5)

SearchPage owns all state: `query`, `results`, `activeIndex`, `isOpen`, `selectedFund`. It creates a Fuse instance when data loads and re-runs search on every keystroke.

- [ ] **Step 1: Replace the placeholder SearchPage.tsx**

```typescript
// src/pages/SearchPage.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FuseResult } from 'fuse.js'
import { usePerformanceData } from '../hooks/usePerformanceData'
import { createFuseInstance } from '../utils/search'
import type { MySuperProduct } from '../types/performance'
import { DataFreshnessLabel } from '../components/DataFreshnessLabel'
import { FundSearchInput } from '../components/FundSearchInput'
import { FundDropdown } from '../components/FundDropdown'
import { SelectedFund } from '../components/SelectedFund'

const LISTBOX_ID = 'fund-listbox'

export function SearchPage() {
  const { mysuper, meta, loading, error } = usePerformanceData()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FuseResult<MySuperProduct>[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFund, setSelectedFund] = useState<MySuperProduct | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const fuse = useMemo(() => createFuseInstance(mysuper), [mysuper])

  // Re-run search when query changes
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      setActiveIndex(-1)
      return
    }
    const hits = fuse.search(query)
    setResults(hits)
    setIsOpen(true)
    setActiveIndex(-1)
  }, [query, fuse])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = useCallback((product: MySuperProduct) => {
    setSelectedFund(product)
    setQuery('')
    setIsOpen(false)
    setActiveIndex(-1)
  }, [])

  const handleClear = useCallback(() => {
    setSelectedFund(null)
    setQuery('')
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && results[activeIndex]) {
        handleSelect(results[activeIndex].item)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  // --- Render states ---

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Loading fund data…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-700 text-sm mb-4">
            {error === 'Fund data is currently unavailable.'
              ? 'Fund data is currently unavailable. Please try again later.'
              : 'Unable to load fund data. Please refresh the page.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2 min-h-[44px] bg-slate-800 text-white text-sm rounded-md hover:bg-slate-700"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-2xl mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-800 mb-1">
            APRA Fund Performance
          </h1>
          <p className="text-sm text-slate-500 mb-2">
            Check your MySuper fund's APRA annual performance test result.
          </p>
          {meta && <DataFreshnessLabel lastUpdated={meta.last_updated} />}
        </header>

        {selectedFund ? (
          <SelectedFund fund={selectedFund} onClear={handleClear} />
        ) : (
          <div ref={containerRef} className="relative">
            <FundSearchInput
              value={query}
              isOpen={isOpen}
              activeIndex={activeIndex}
              listboxId={LISTBOX_ID}
              disabled={false}
              onChange={setQuery}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (query.trim().length >= 2) setIsOpen(true)
              }}
            />
            {isOpen && (
              <FundDropdown
                id={LISTBOX_ID}
                results={results}
                activeIndex={activeIndex}
                totalProducts={mysuper.length}
                onSelect={handleSelect}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Smoke test in browser**

```bash
npm run dev
```

1. Open http://localhost:5173/#/
2. Confirm "Data last updated: June 2025" appears
3. Type "aus" — confirm dropdown appears with AustralianSuper MySuper visible and "aus" in bold
4. Press ArrowDown — confirm first item gets highlighted background
5. Press Enter — confirm dropdown closes and SelectedFund card appears
6. Confirm "View performance →" button is visible
7. Click "Change" — confirm search input reappears cleared
8. Type "zzzzz" — confirm "No MySuper funds matched" message
9. Press Escape — confirm dropdown closes

- [ ] **Step 4: Commit**

```bash
git add src/pages/SearchPage.tsx
git commit -m "feat: implement SearchPage with fuzzy search, keyboard nav, and ARIA combobox"
```

---

## Task 12: DashboardPage stub (Page 2)

**Files:**
- Modify: `src/pages/DashboardPage.tsx` (replace placeholder from Task 5)

The stub receives the selected fund via `useLocation().state` and renders the fund name and pass/fail status. Full Epic 2 is a separate build; this stub is needed so the "View performance →" button navigates somewhere useful.

- [ ] **Step 1: Replace the DashboardPage placeholder**

```typescript
// src/pages/DashboardPage.tsx
import { useLocation, useNavigate } from 'react-router-dom'
import type { MySuperProduct } from '../types/performance'

interface LocationState {
  fund: MySuperProduct
}

export function DashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null

  if (!state?.fund) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-600 text-sm mb-4">No fund selected.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 min-h-[44px] bg-slate-800 text-white text-sm rounded-md hover:bg-slate-700"
          >
            ← Back to search
          </button>
        </div>
      </div>
    )
  }

  const { fund } = state

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-2xl mx-auto px-4 py-12">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm text-slate-500 underline mb-6 min-h-[44px] flex items-center"
        >
          ← Back to search
        </button>
        <h1 className="text-xl font-semibold text-slate-800 mb-2">{fund.product_name}</h1>
        <p className="text-sm text-slate-500 mb-6">
          APRA result: <span className="font-medium text-slate-800">{fund.pass_fail_current ?? 'Unknown'}</span>
        </p>
        <p className="text-xs text-slate-400">
          Full performance dashboard — Epic 2 (coming soon)
        </p>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: End-to-end navigation test**

```bash
npm run dev
```

1. Open http://localhost:5173/#/
2. Search for and select "AustralianSuper MySuper"
3. Click "View performance →"
4. Confirm URL changes to `/#/fund/australiansuper-mysuper`
5. Confirm Page 2 shows "AustralianSuper MySuper" and "Pass"
6. Click "← Back to search" — confirm returns to Page 1

- [ ] **Step 4: Commit**

```bash
git add src/pages/DashboardPage.tsx
git commit -m "feat: add DashboardPage stub receiving fund via router state"
```

---

## Task 13: Accessibility and responsive verification

This task has no code changes — it's a manual verification pass against the PRD's acceptance criteria and WCAG requirements.

- [ ] **Step 1: Keyboard-only path**

1. Open the app; press Tab to reach the search input
2. Type "rest" — dropdown appears
3. Press ArrowDown — first item highlights (`bg-slate-100`)
4. Press ArrowDown again to reach "REST Super MySuper"; press Enter — selection registers
5. Press Tab to reach "Change"; press Enter — search resets and input receives focus

Expected: All steps work without mouse.

- [ ] **Step 2: Touch target verification**

Open DevTools → Elements. Inspect:
- Search input: height ≥ 44px (has `min-h-[44px]`)
- Each dropdown item: height ≥ 44px (has `min-h-[44px]`)
- "Change" button: min-height ≥ 44px
- "View performance →" button: min-height ≥ 44px

Expected: All elements meet the 44px minimum.

- [ ] **Step 3: ARIA roles check**

Open DevTools → Accessibility panel. Inspect:
- Search input: `role="combobox"`, `aria-expanded="false"` (closed) / `"true"` (open)
- Dropdown `<ul>`: `role="listbox"`
- Each `<li>`: `role="option"`, `aria-selected="true"` on active item

Expected: All roles correct.

- [ ] **Step 4: Mobile layout check**

DevTools → Device toolbar → iPhone 14 Pro (390×844).
1. Confirm layout is single-column, full-width
2. Confirm dropdown takes full width
3. Tap the search input — keyboard opens (simulated)
4. Type "host" — Hostplus appears in dropdown
5. Tap to select — SelectedFund card appears

Expected: Layout and interactions work on mobile viewport.

- [ ] **Step 5: No-results path**

Type "zzzzz". Expected: "No MySuper funds matched your search. Try a shorter or different term." message appears. No fund names shown.

- [ ] **Step 6: Metrics unavailable notice**

Find a fund with `current_metrics_available: false` in `performance-data.json`. A quick search: 80 of 127 products have `current_metrics_available: false`.

Search for "ANZ Smart Choice" (check the JSON — look for a record with `false`). Select it.

Expected: Amber notice "Current year metrics are not available for this product. Pass/Fail status and history are still shown." appears beneath the selection.

- [ ] **Step 7: Error state**

1. Temporarily rename `public/performance-data.json` to `performance-data.json.bak`
2. Reload the app
3. Confirm: search input disabled; error message "Unable to load fund data. Please refresh the page." with Refresh button
4. Restore the file and reload — confirm normal behaviour resumes

- [ ] **Step 8: 100ms keystroke performance**

Open DevTools → Performance. Start recording. Type a character in the search box. Stop recording. Confirm the Fuse search + React re-render completes within 100ms.

Expected: Client-side search is near-instant for 127 records.

---

## Task 14: Production build and final commit

- [ ] **Step 1: Run full test suite**

```bash
npm test
```
Expected: All tests pass.

- [ ] **Step 2: Run TypeScript strict check**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Build for production**

```bash
npm run build
```
Expected: `dist/` folder created. No build errors. Check `dist/assets/` for hashed JS and CSS bundles.

- [ ] **Step 4: Preview production build**

```bash
npm run preview
```
Open http://localhost:4173/#/. Repeat the happy-path verification from Task 11 Step 3.

Expected: App functions identically to dev build. Hash routing works (navigate directly to `/#/fund/...` and "Back to search" returns to `/#/`).

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete Feature 1a — MySuper fund search and selection (issue #4)"
```

---

## Verification Summary

| PRD Criterion | Verified in |
|---------------|-------------|
| 2-char minimum to show dropdown | Task 11 Step 3 |
| Fuzzy/partial matching (Fuse.js) | Task 3 (tests) + Task 11 Step 3 |
| Match highlighting in bold | Task 7 (FundDropdownItem) |
| No-results message | Task 11 Step 3 + Task 13 Step 5 |
| Result count footer | Task 8 (FundDropdown) |
| Selection confirmation card | Task 10 (SelectedFund) |
| "Change" link resets search | Task 11 Step 3 |
| current_metrics_available notice | Task 13 Step 6 |
| "View performance →" navigation | Task 12 Step 3 |
| Data freshness label | Task 6 (DataFreshnessLabel) |
| Loading state | Task 11 (SearchPage loading render) |
| Load error + Refresh button | Task 13 Step 7 |
| Keyboard navigation (arrows/Enter/Escape) | Task 11 Step 3 + Task 13 Step 1 |
| ARIA combobox/listbox/option roles | Task 13 Step 3 |
| 44px touch targets | Task 13 Step 2 |
| Responsive mobile layout | Task 13 Step 4 |
| 100ms keystroke performance | Task 13 Step 8 |
| HashRouter for static hosting | Task 5 (App.tsx) |
