# CLAUDE.md — Member Fund Webapp

## Project Overview

A greenfield web application that lets Australian superannuation members look up their fund's APRA annual performance test status (Pass/Fail), history, and risk level — without navigating APRA's Excel-based website.

- **Vision Brief:** `specs/apra-member-performance-vision.md`
- **Feature PRD (current):** `specs/mysuper-fund-search-prd.md`
- **GitHub repo:** alpeshweta/Member-Fund-Webapp

## Tech Stack

| Concern | Choice | Version |
|---------|--------|---------|
| Framework | React | 18 |
| Build tool | Vite | 6 |
| Language | TypeScript | 5 (strict mode) |
| Styling | Tailwind CSS | **v3** (not v4 — different config) |
| Search | Fuse.js | 7 |
| Routing | React Router | 6 (HashRouter for MVP) |

## Page Model

| Page | Route | Feature | Status |
|------|-------|---------|--------|
| Page 1 | `/#/` | MySuper + TDP search & selection | Feature 1a (MySuper) ✅ planned |
| Page 2 | `/#/fund/:productId` | Performance dashboard | Epic 2 — pending |
| Page 3 | `/#/compare` | Comparable funds | Future (Capability 5) |

## Data Source

- **File:** `public/performance-data.json`
- **Origin:** APRA data pipeline output at `C:\Users\alpes\.claude\Member Performance Data\outputs\apra-skills\apra_work\performance-data.json`
- **Committed to git:** Yes — must be present for all clones and deployments
- **Refresh cadence:** Annually after APRA releases results in June. Process: re-run pipeline → copy updated file → commit → redeploy
- **Key stats:** 127 MySuper products, 1,706 TDP options; 80/127 MySuper have `current_metrics_available: false`

## Architecture

- Data is loaded **once** at the app level via `DataProvider` (in `App.tsx`) and shared via React Context
- `usePerformanceData()` hook consumes the context — never fetch directly in components
- Selected fund record (full `MySuperProduct` object) is passed to Page 2 via React Router `state`
- All search is **client-side** — no backend, no API calls beyond the initial JSON fetch

## Design System

- **Palette:** Sober slate tones (`slate-50` background, `slate-800` text, `slate-200` borders)
- **RAG colours** (green/amber/red): **reserved for Page 2 only** — do not use on Page 1
- **Amber** (`amber-50/700/200`): used only for the `current_metrics_available: false` notice on SelectedFund
- **Touch targets:** minimum 44×44px on all interactive elements (WCAG 2.5.5)
- **No hover-only interactions** — all content must be accessible on tap

## Routing

Using `HashRouter` for MVP to avoid 404s on static hosting without server-side redirect config. URLs are `/#/fund/...` format. Upgrade to `BrowserRouter` + redirect config when hosting platform is confirmed.

## Key Constraints

- No backend server — static site only
- `performance-data.json` is the sole data source for MVP (no live APRA API)
- TypeScript strict mode — all nullable fields must be explicitly handled (`nir_10yr: number | null`, etc.)
- Tailwind v3 config syntax (`tailwind.config.js` with `content` array) — do not upgrade to v4

## Fuzzy Search (Fuse.js)

- Configured on `product_name` field of `mysuper_products`
- Starting threshold: `0.5` — tune during testing (increase toward 0.6 if abbreviations miss; decrease toward 0.45 if too many false positives)
- The **2-character minimum** for showing the dropdown is enforced in UI logic (`query.trim().length < 2`), not in Fuse config
- `minMatchCharLength` in Fuse options is NOT the query minimum — do not confuse these

## File Structure

```
src/
├── main.tsx                         App entry point
├── App.tsx                          DataProvider + HashRouter + Routes
├── context/
│   └── PerformanceDataContext.tsx   Loads data once; provides via context
├── types/
│   └── performance.ts              All TypeScript types for the data schema
├── hooks/
│   └── usePerformanceData.ts       Thin hook — consumes PerformanceDataContext
├── utils/
│   └── search.ts                   Fuse.js instance factory + highlightMatches()
├── pages/
│   ├── SearchPage.tsx              Page 1 — owns query/results/selectedFund state
│   └── DashboardPage.tsx           Page 2 stub (Epic 2)
└── components/
    ├── DataFreshnessLabel.tsx
    ├── FundSearchInput.tsx          ARIA combobox
    ├── FundDropdownItem.tsx         ARIA option; unique id for aria-activedescendant
    ├── FundDropdown.tsx             ARIA listbox; scrollable
    └── SelectedFund.tsx             Confirmed state + metrics notice + navigation
```

## ARIA Combobox Pattern

Using ARIA 1.2 combobox pattern:
- `FundSearchInput`: `role="combobox"`, `aria-expanded`, `aria-controls={listboxId}`, `aria-autocomplete="list"`, `aria-activedescendant={activeItemId}`
- `FundDropdown`: `role="listbox"`, unique `id`
- `FundDropdownItem`: `role="option"`, `aria-selected`, unique `id` (`"option-{index}"`)

## GitHub

- Issues tracked at: https://github.com/alpeshweta/Member-Fund-Webapp/issues
- Epic 1 (Fund Search & Selection): issue #1
- Feature 1a (MySuper search): issue #4
- Label conventions: `type:epic`, `type:feature`
