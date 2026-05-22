# Epic 2 — Performance Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Epic 2 by adding Vitest tests for the already-implemented dashboard utilities and components, and fixing one PRD compliance gap in `DashboardPage`.

**Architecture:** The full dashboard implementation already exists (`riskSignal.ts`, `StatusBadge`, `RagIndicator`, `MetricsCard`, `HistoryTimeline`, `RiskSignalBanner`, `DashboardPage`). This plan adds test coverage and fixes the no-fund redirect. `riskSignal.ts` has no React dependencies — pure Vitest unit tests. `DashboardPage` is tested via React Testing Library with `createMemoryRouter` providing `location.state`. The `usePerformanceData` hook is mocked with `vi.mock` to avoid the live fetch in tests.

**Tech Stack:** React 18, Vite 6, TypeScript 5 (strict), Tailwind CSS v3, React Router DOM 6, Vitest, @testing-library/react, @testing-library/jest-dom

---

## What Is Already Built

All Epic 2 implementation is complete — no new source files needed:

| File | Status |
|------|--------|
| `src/utils/riskSignal.ts` | ✅ Done |
| `src/utils/formatters.ts` | ✅ Done |
| `src/components/StatusBadge.tsx` | ✅ Done |
| `src/components/RagIndicator.tsx` | ✅ Done |
| `src/components/MetricsCard.tsx` | ✅ Done |
| `src/components/HistoryTimeline.tsx` | ✅ Done |
| `src/components/RiskSignalBanner.tsx` | ✅ Done |
| `src/pages/DashboardPage.tsx` | ✅ Done |

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/tests/riskSignal.test.ts` | Unit tests for `computeRiskSignal` — all 6 risk levels + edge cases |
| Create | `src/tests/dashboard.test.tsx` | Integration tests for `DashboardPage` — PRD acceptance criteria scenarios |
| Modify | `src/pages/DashboardPage.tsx` | Fix no-fund case to auto-redirect (PRD Story 5 AC2) |

---

## Task 1: Fix DashboardPage — auto-redirect when no fund in state

**Files:**
- Modify: `src/pages/DashboardPage.tsx`

The PRD (Story 5, AC2) requires: *"If the member navigates directly to a Page 2 URL with no `location.state.fund`, they are redirected to Page 1 with no error shown."* The current implementation shows a "No fund selected" message with a button — this must be a silent redirect.

- [ ] **Step 1: Write the failing test first**

Create `src/tests/dashboard.test.tsx` with just the redirect test to establish the failure:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { DashboardPage } from '../pages/DashboardPage'

vi.mock('../hooks/usePerformanceData', () => ({
  usePerformanceData: () => ({
    mysuper: [],
    meta: {
      last_updated: '2025-06',
      source_years_mysuper: ['2021', '2022', '2023', '2024', '2025'],
      source_years_tdp: ['2023', '2024', '2025'],
      total_mysuper_products: 127,
      total_tdp_options: 1706,
    },
    loading: false,
    error: null,
  }),
}))

function renderDashboard(fund?: object) {
  const router = createMemoryRouter(
    [
      { path: '/', element: <div data-testid="page1">Page 1</div> },
      { path: '/fund/:productId', element: <DashboardPage /> },
    ],
    {
      initialEntries: [{ pathname: '/fund/test-fund', state: fund ? { fund } : null }],
      initialIndex: 0,
    },
  )
  return render(<RouterProvider router={router} />)
}

describe('DashboardPage — no fund state', () => {
  it('redirects silently to Page 1 when no fund is in router state', () => {
    renderDashboard()
    expect(screen.getByTestId('page1')).toBeInTheDocument()
    expect(screen.queryByText(/no fund selected/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test — expect FAIL**

```bash
npm test -- src/tests/dashboard.test.tsx
```
Expected: FAIL — "no fund selected" text found (current implementation shows it)

- [ ] **Step 3: Fix DashboardPage to use `<Navigate>`**

Replace the no-fund branch in `src/pages/DashboardPage.tsx`. Find this block (lines 17–32):

```typescript
  if (!fund) {
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
```

Replace it with:

```typescript
  if (!fund) return <Navigate to="/" replace />
```

Also update the imports at the top of `DashboardPage.tsx` — replace `Link, useLocation, useNavigate` with `Navigate, Link, useLocation`:

```typescript
import { Navigate, Link, useLocation } from 'react-router-dom'
```

And remove the `const navigate = useNavigate()` line (line 13).

- [ ] **Step 4: Run the test — expect PASS**

```bash
npm test -- src/tests/dashboard.test.tsx
```
Expected: PASS

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/DashboardPage.tsx src/tests/dashboard.test.tsx
git commit -m "fix: redirect silently to Page 1 when DashboardPage has no fund state (PRD Story 5 AC2)"
```

---

## Task 2: `computeRiskSignal` unit tests

**Files:**
- Create: `src/tests/riskSignal.test.ts`

These are pure unit tests — no React, no router, no mocks. Tests cover all 6 `RiskLevel` values and the critical edge cases: key insertion order, `Unknown` not counting as `Fail`, and using only the 2 most recent years from a longer history.

- [ ] **Step 1: Write the failing tests**

Create `src/tests/riskSignal.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { computeRiskSignal } from '../utils/riskSignal'

describe('computeRiskSignal', () => {
  it('returns no-data for empty history', () => {
    expect(computeRiskSignal({})).toBe('no-data')
  })

  it('returns insufficient for 1-year history — Pass', () => {
    expect(computeRiskSignal({ '2025': 'Pass' })).toBe('insufficient')
  })

  it('returns insufficient for 1-year history — Fail', () => {
    expect(computeRiskSignal({ '2025': 'Fail' })).toBe('insufficient')
  })

  it('returns insufficient for 1-year history — Unknown', () => {
    expect(computeRiskSignal({ '2025': 'Unknown' })).toBe('insufficient')
  })

  it('returns critical when the 2 most recent years are both Fail', () => {
    expect(computeRiskSignal({ '2025': 'Fail', '2024': 'Fail' })).toBe('critical')
  })

  it('returns critical for 2 consecutive Fail years even with older Pass history', () => {
    expect(
      computeRiskSignal({ '2023': 'Pass', '2024': 'Fail', '2025': 'Fail' }),
    ).toBe('critical')
  })

  it('returns warning when latest is Fail and previous is Pass', () => {
    expect(computeRiskSignal({ '2025': 'Fail', '2024': 'Pass' })).toBe('warning')
  })

  it('returns warning when latest is Fail and previous is Unknown (Unknown is not Fail)', () => {
    expect(computeRiskSignal({ '2025': 'Fail', '2024': 'Unknown' })).toBe('warning')
  })

  it('returns clear when latest is Pass, regardless of prior years', () => {
    expect(computeRiskSignal({ '2025': 'Pass', '2024': 'Fail' })).toBe('clear')
    expect(computeRiskSignal({ '2025': 'Pass', '2024': 'Pass' })).toBe('clear')
  })

  it('returns clear for 5 years of history where latest is Pass', () => {
    expect(
      computeRiskSignal({
        '2021': 'Fail',
        '2022': 'Fail',
        '2023': 'Fail',
        '2024': 'Fail',
        '2025': 'Pass',
      }),
    ).toBe('clear')
  })

  it('returns unknown when latest is Unknown', () => {
    expect(computeRiskSignal({ '2025': 'Unknown', '2024': 'Pass' })).toBe('unknown')
  })

  it('returns unknown when latest is null', () => {
    expect(computeRiskSignal({ '2025': null, '2024': 'Pass' })).toBe('unknown')
  })

  it('sorts by year descending regardless of key insertion order in the object', () => {
    // Keys inserted in ascending order — must still treat 2025 as latest
    expect(computeRiskSignal({ '2024': 'Pass', '2025': 'Fail' })).toBe('warning')
  })

  it('does not treat Unknown previous year as Fail for critical detection', () => {
    // Fail + Unknown → warning, not critical
    expect(computeRiskSignal({ '2025': 'Fail', '2024': 'Unknown' })).toBe('warning')
  })

  it('handles null values in previous year without crashing', () => {
    expect(computeRiskSignal({ '2025': 'Pass', '2024': null })).toBe('clear')
  })
})
```

- [ ] **Step 2: Run the test — expect PASS**

```bash
npm test -- src/tests/riskSignal.test.ts
```
Expected: All 15 tests PASS.

If any test fails, read `src/utils/riskSignal.ts` carefully and fix the logic — do not change the tests to match broken behaviour.

- [ ] **Step 3: Commit**

```bash
git add src/tests/riskSignal.test.ts
git commit -m "test: add unit tests for computeRiskSignal — all 6 risk levels and edge cases"
```

---

## Task 3: `DashboardPage` integration tests

**Files:**
- Modify: `src/tests/dashboard.test.tsx` (expand from Task 1)

These tests render `DashboardPage` via `createMemoryRouter` with pre-set `location.state`. The `usePerformanceData` hook is mocked once at the top of the file. Each test covers a distinct PRD scenario from the Verification section.

- [ ] **Step 1: Define the shared test fund factory**

Add a fund factory at the top of `src/tests/dashboard.test.tsx` (after the existing mock and imports) so tests don't repeat boilerplate:

```typescript
import type { MySuperProduct } from '../types/performance'

function makeFund(overrides: Partial<MySuperProduct> = {}): MySuperProduct {
  return {
    product_name: 'AustralianSuper MySuper',
    current_metrics_available: true,
    pass_fail_current: 'Pass',
    nir_10yr: 0.0795,
    nir_rag: 'Green',
    fees_50k: 0.0063,
    fees_50k_rag: 'Green',
    fees_100k: 0.0052,
    fees_100k_rag: 'Green',
    history: {
      '2025': 'Pass',
      '2024': 'Pass',
      '2023': 'Pass',
      '2022': 'Pass',
      '2021': 'Pass',
    },
    ...overrides,
  }
}
```

- [ ] **Step 2: Write all remaining integration tests**

Append these test suites to `src/tests/dashboard.test.tsx`:

```typescript
describe('DashboardPage — happy path (full data)', () => {
  it('shows the fund name as a heading', () => {
    renderDashboard(makeFund())
    expect(screen.getByRole('heading', { name: 'AustralianSuper MySuper' })).toBeInTheDocument()
  })

  it('shows a green Pass badge for a passing fund', () => {
    renderDashboard(makeFund())
    expect(screen.getByText('Pass')).toBeInTheDocument()
  })

  it('shows the Clear risk signal banner for an all-Pass fund', () => {
    renderDashboard(makeFund())
    expect(screen.getByText('Clear')).toBeInTheDocument()
    expect(screen.getByText(/passed the most recent APRA performance test/i)).toBeInTheDocument()
  })

  it('shows the data freshness label', () => {
    renderDashboard(makeFund())
    expect(screen.getByText(/data last updated/i)).toBeInTheDocument()
    expect(screen.getByText(/june 2025/i)).toBeInTheDocument()
  })

  it('shows history years in descending order', () => {
    renderDashboard(makeFund())
    const years = screen.getAllByText(/^202[0-9]$/)
    const yearNumbers = years.map((el) => Number(el.textContent))
    const sorted = [...yearNumbers].sort((a, b) => b - a)
    expect(yearNumbers).toEqual(sorted)
  })

  it('marks the most recent year as Latest', () => {
    renderDashboard(makeFund())
    expect(screen.getByText('Latest')).toBeInTheDocument()
  })

  it('shows the NIR metric formatted as a percentage', () => {
    renderDashboard(makeFund())
    expect(screen.getByText('7.95% p.a.')).toBeInTheDocument()
  })

  it('shows fee at $50K formatted as a percentage', () => {
    renderDashboard(makeFund())
    expect(screen.getByText('0.63% p.a.')).toBeInTheDocument()
  })

  it('shows a Search again link back to Page 1', () => {
    renderDashboard(makeFund())
    expect(screen.getByRole('link', { name: /search again/i })).toBeInTheDocument()
  })
})

describe('DashboardPage — Fail fund (single year)', () => {
  it('shows a red Fail badge', () => {
    renderDashboard(
      makeFund({ pass_fail_current: 'Fail', history: { '2025': 'Fail' } }),
    )
    expect(screen.getByText('Fail')).toBeInTheDocument()
  })

  it('shows Insufficient History banner when only 1 year of history', () => {
    renderDashboard(
      makeFund({ pass_fail_current: 'Fail', history: { '2025': 'Fail' } }),
    )
    expect(screen.getByText('Insufficient History')).toBeInTheDocument()
  })
})

describe('DashboardPage — Critical (2 consecutive Fail)', () => {
  it('shows a red Fail badge and Critical banner', () => {
    renderDashboard(
      makeFund({
        pass_fail_current: 'Fail',
        history: { '2025': 'Fail', '2024': 'Fail' },
      }),
    )
    expect(screen.getByText('Fail')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toBeInTheDocument()
    expect(screen.getByText(/must close to new members/i)).toBeInTheDocument()
  })

  it('shows the APRA link in the Critical banner', () => {
    renderDashboard(
      makeFund({
        pass_fail_current: 'Fail',
        history: { '2025': 'Fail', '2024': 'Fail' },
      }),
    )
    expect(screen.getByRole('link', { name: /view apra/i })).toBeInTheDocument()
  })
})

describe('DashboardPage — metrics unavailable', () => {
  it('shows amber notice and hides the metrics card when current_metrics_available is false', () => {
    renderDashboard(
      makeFund({
        current_metrics_available: false,
        pass_fail_current: null,
        nir_10yr: null,
        nir_rag: null,
        fees_50k: null,
        fees_50k_rag: null,
        fees_100k: null,
        fees_100k_rag: null,
      }),
    )
    expect(screen.getByText(/not published for this product by APRA/i)).toBeInTheDocument()
    expect(screen.queryByText('Performance Metrics')).not.toBeInTheDocument()
  })
})

describe('DashboardPage — Unknown result', () => {
  it('shows a slate Result Unknown badge', () => {
    renderDashboard(
      makeFund({
        pass_fail_current: 'Unknown',
        history: { '2025': 'Unknown', '2024': 'Pass' },
      }),
    )
    expect(screen.getByText('Result Unknown')).toBeInTheDocument()
  })

  it('shows the Unknown explanatory note', () => {
    renderDashboard(
      makeFund({
        pass_fail_current: 'Unknown',
        history: { '2025': 'Unknown', '2024': 'Pass' },
      }),
    )
    expect(screen.getByText(/has not published a result/i)).toBeInTheDocument()
  })
})

describe('DashboardPage — empty history', () => {
  it('shows No history available message', () => {
    renderDashboard(makeFund({ history: {} }))
    expect(screen.getByText(/no history available/i)).toBeInTheDocument()
  })

  it('shows No History Available risk banner', () => {
    renderDashboard(makeFund({ history: {} }))
    expect(screen.getByText('No History Available')).toBeInTheDocument()
  })
})

describe('DashboardPage — null pass_fail_current', () => {
  it('does not render a Pass/Fail badge when pass_fail_current is null', () => {
    renderDashboard(makeFund({ pass_fail_current: null }))
    expect(screen.queryByText('Pass')).not.toBeInTheDocument()
    expect(screen.queryByText('Fail')).not.toBeInTheDocument()
  })

  it('shows Result not available message', () => {
    renderDashboard(makeFund({ pass_fail_current: null }))
    expect(screen.getByText(/result not available/i)).toBeInTheDocument()
  })
})

describe('DashboardPage — limited history depth note', () => {
  it('shows the history depth note when history has fewer years than expected', () => {
    renderDashboard(
      makeFund({ history: { '2024': 'Pass', '2025': 'Pass' } }),
    )
    // expectedYears from mock = ['2021','2022','2023','2024','2025'] (5 years)
    // fund has 2 years — should show depth note
    expect(screen.getByText(/history available from 2024 only/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run all dashboard tests — expect PASS**

```bash
npm test -- src/tests/dashboard.test.tsx
```
Expected: All tests PASS.

If a test fails:
1. Read the component source carefully — do not modify tests to match broken behaviour
2. Fix the component or match the exact copy in the PRD
3. Re-run until all pass

- [ ] **Step 4: Run the full test suite**

```bash
npm test
```
Expected: All tests across `search.test.ts`, `riskSignal.test.ts`, `dashboard.test.tsx`, and `tdp-search.test.ts` PASS.

- [ ] **Step 5: Commit**

```bash
git add src/tests/dashboard.test.tsx
git commit -m "test: add DashboardPage integration tests covering all PRD acceptance criteria"
```

---

## Task 4: Production build and final verification

- [ ] **Step 1: TypeScript strict check**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 2: Production build**

```bash
npm run build
```
Expected: `dist/` folder created, no build errors.

- [ ] **Step 3: Browser smoke test — happy path**

```bash
npm run preview
```

1. Open http://localhost:4173/#/
2. Search for "AustralianSuper MySuper" → select
3. Click "View performance →"
4. Confirm: fund name heading, "2025 APRA Performance Test" label, green "Pass" badge
5. Confirm: NIR shows "7.95% p.a." with green dot; fees show with green dots
6. Confirm: history shows 5 years descending (2025 → 2021); 2025 marked "Latest"
7. Confirm: green "Clear" risk signal banner
8. Confirm: "Data last updated: June 2025" label visible
9. Click "← Search again" → confirm return to Page 1

- [ ] **Step 4: Browser smoke test — no-fund redirect**

Open http://localhost:4173/#/fund/anything directly in a new tab (bypassing Page 1 navigation).

Expected: redirected silently to `/#/` (Page 1 search UI). No "No fund selected" message.

- [ ] **Step 5: Browser smoke test — metrics unavailable**

Search for a fund with `current_metrics_available: false` (80 of 127 MySuper products qualify — search "Media Super" or "Vision Super" to find one quickly).

Expected: amber notice replaces the metrics card; history and risk signal still shown.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete Epic 2 — Performance Dashboard with tests (issue #2)"
```

---

## Verification Summary

| PRD Criterion | Covered In |
|---------------|------------|
| Fund name heading | Task 3 — happy path test |
| Pass/Fail/Unknown badge with colour | Task 3 — happy path, Fail, Unknown tests |
| APRA test year label | Task 3 — happy path test |
| Data freshness label | Task 3 — happy path test |
| NIR + fees formatted as % | Task 3 — happy path test |
| RAG indicators (not sole indicator) | MetricsCard implementation (Green/Red text labels) |
| Metrics unavailable amber notice | Task 3 — metrics unavailable test |
| History sorted descending | Task 3 — happy path test |
| "Latest" marker on most recent year | Task 3 — happy path test |
| History depth note | Task 3 — limited history test |
| Empty history message | Task 3 — empty history test |
| Risk signal — Critical | Task 3 — critical test |
| Risk signal — Warning | riskSignal tests (Task 2) |
| Risk signal — Clear | Task 3 — happy path test |
| Risk signal — Unknown | Task 3 — Unknown test |
| Risk signal — Insufficient | Task 3 — Fail 1-year test |
| Risk signal — No data | Task 3 — empty history test |
| Risk computed from history, not pre-computed | riskSignal.ts (runtime only) |
| Unknown not counted as Fail | Task 2 — riskSignal tests |
| APRA link on Critical banner | Task 3 — critical test |
| Silent redirect when no fund state | Task 1 + Task 4 Step 4 |
| "← Search again" navigation | Task 3 — happy path test |
| 44px touch targets | Implementation (min-h-[44px] on all buttons) |
| Page renders within 500ms | All data in memory — no fetch on Page 2 |
