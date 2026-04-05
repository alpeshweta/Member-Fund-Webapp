# Feature: Performance Status Dashboard

**Epic:** Performance Status Dashboard (issue #2)
**Vision Brief:** specs/apra-member-performance-vision.md
**Depends on:** Feature 1a (MySuper search, issue #4) — fund record passed via router state

## Summary

Page 2 of a 3-page app. A read-only dashboard that displays the APRA performance test results for a selected superannuation fund: the current year's Pass/Fail result with supporting metrics (NIR, fees, RAG indicators), a year-by-year Pass/Fail history timeline, and an explicit risk signal computed at runtime that tells a member whether they are safe, at risk, or facing imminent fund closure.

This page covers **Features 2a, 2b, and 2c** from the Epic 2 breakdown. These three features form a single, indivisible page — each one is meaningless without the others.

## Motivation

A member who has found their fund on Page 1 (Search) arrives here to answer one question: **"Should I be worried?"**

Today, answering that question requires downloading two or more Excel files from APRA's website, navigating to the right row, and mentally tracking the trend across years. Most members never do this. The consequences are real: a fund that fails the APRA test in two consecutive years is legally required to close to new members under the Treasury Laws Amendment (Your Future, Your Super) Act 2021. Members in a failing fund who don't act face being closed out without warning.

This dashboard makes the answer immediate: a clear visual that reads at a glance, for every member across all 127 MySuper and 1,706 TDP options.

## Data Schema Reference

All dashboard data comes from the fund record passed via React Router `location.state.fund`. No additional fetches are needed.

### MySuper record fields used on this page

| Field | Type | Notes |
|-------|------|-------|
| `product_name` | `string` | Fund heading |
| `current_metrics_available` | `boolean` | If false, all metric fields are null |
| `pass_fail_current` | `"Pass" \| "Fail" \| "Unknown" \| null` | **Three real values** — not just Pass/Fail |
| `nir_10yr` | `number \| null` | 10-year net investment return (decimal, e.g. 0.0675 = 6.75%) |
| `nir_rag` | `"Green" \| "Red" \| null` | Only Green and Red appear in real data |
| `fees_50k` | `number \| null` | Fee rate at $50K balance (decimal) |
| `fees_50k_rag` | `"Green" \| "Red" \| null` | |
| `fees_100k` | `number \| null` | Fee rate at $100K balance (decimal) |
| `fees_100k_rag` | `"Green" \| "Red" \| null` | |
| `history` | `Record<string, "Pass" \| "Fail" \| "Unknown" \| null>` | Keys are year strings e.g. `"2025"` |

### TypeScript type correction required

The existing `PassFail` type in `src/types/performance.ts` must be updated:
```ts
// Before (incomplete)
export type PassFail = 'Pass' | 'Fail' | null
// After (correct)
export type PassFail = 'Pass' | 'Fail' | 'Unknown' | null
```

## User Stories & Acceptance Criteria

### Story 1: View the current Pass/Fail result (Feature 2a)
**As a** superannuation member, **I want** to see clearly whether my fund passed or failed the most recent APRA test **so that** I immediately know where I stand this year.

**Acceptance Criteria:**
1. `[MUST]` The page displays the fund name as a prominent heading
2. `[MUST]` The current Pass/Fail result (`pass_fail_current`) is shown as a large, clearly styled badge:
   - `"Pass"` → green badge (e.g., green text on green-tinted background)
   - `"Fail"` → red badge (red text on red-tinted background)
   - `"Unknown"` → slate badge labelled "Result Unknown" with a tooltip or note: "APRA has not published a result for this product"
   - `null` (when `current_metrics_available` is false) → not shown; covered by the metrics notice
3. `[MUST]` The APRA test year is shown alongside the badge (e.g., "2025 APRA Performance Test")
4. `[MUST]` The data freshness label is shown (e.g., "Data last updated: June 2025") — sourced from `last_updated` in context
5. `[MUST]` A "← Search again" link is visible at all times, allowing navigation back to Page 1 without losing the context of what was searched

### Story 2: View supporting metrics with RAG indicators (Feature 2a)
**As a** superannuation member, **I want** to see the fund's 10-year net investment return and fees alongside colour-coded indicators **so that** I understand the underlying drivers of the Pass/Fail result.

**Acceptance Criteria:**
1. `[MUST]` The 10-year NIR (`nir_10yr`) is displayed formatted as a percentage to 2 decimal places (e.g., `0.0675` → `"6.75% p.a."`)
2. `[MUST]` Fees at $50K balance (`fees_50k`) are displayed formatted as a percentage to 2 decimal places (e.g., `0.0016` → `"0.16% p.a."`)
3. `[MUST]` Fees at $100K balance (`fees_100k`) are displayed formatted as a percentage to 2 decimal places
4. `[MUST]` Each metric is shown alongside its RAG indicator:
   - `"Green"` → green dot or label
   - `"Red"` → red dot or label
   - `null` → indicator not shown
5. `[MUST]` When a metric value is `null` (but `current_metrics_available` is `true`), the value cell displays "Not available" in muted text — the RAG indicator is not shown
6. `[MUST]` When `current_metrics_available` is `false`, the entire metrics section displays an amber notice: "Current year metrics are not published for this product by APRA. Pass/Fail result and history are shown where available."
7. `[MUST]` A brief label explains each metric in plain language: "10-year net investment return", "Annual fee (on $50K balance)", "Annual fee (on $100K balance)"
8. `[SHOULD]` A plain-language explanation of what RAG colours mean is available (e.g., a footnote: "Green = above benchmark, Red = below benchmark")

### Story 3: View year-by-year Pass/Fail history (Feature 2b)
**As a** superannuation member, **I want** to see my fund's full Pass/Fail history year by year **so that** I can understand whether this is a recent issue or a pattern of underperformance.

**Acceptance Criteria:**
1. `[MUST]` The history section displays one row or tile per year in the `history` object, sorted in descending order (most recent year first)
2. `[MUST]` Each year entry shows: the year label and the result badge (`"Pass"`, `"Fail"`, `"Unknown"`, or a placeholder if null)
3. `[MUST]` Pass/Fail/Unknown badges in the history use the same colour coding as the current result (Story 1, AC 2)
4. `[MUST]` MySuper products show up to 5 years of history (2021–2025). TDP products show up to 3 years (2023–2025)
5. `[MUST]` If the history object contains fewer years than the maximum for the product type, a note is shown: "History available from [earliest year] only"
6. `[MUST]` If the history object is empty or missing, the message "No history available for this product" is displayed
7. `[SHOULD]` The current year (2025) row is visually distinguished from prior years (e.g., "Latest" label or slightly bolder styling)
8. `[COULD]` A horizontal timeline visualisation is shown in addition to (or instead of) the list view, with Pass/Fail colour-coded across years

### Story 4: See an explicit risk signal (Feature 2c)
**As a** superannuation member, **I want** to see a clear risk signal computed from my fund's history **so that** I know whether I need to act — without having to interpret the history myself.

**Acceptance Criteria:**
1. `[MUST]` A prominently positioned risk signal banner is displayed above the history section, computed at runtime using the following logic:

   | Condition | Signal | Display |
   |-----------|--------|---------|
   | Most recent 2 years are both `"Fail"` | **Critical** | Red banner: "⚠ Critical — This fund has failed 2 consecutive APRA tests. Under APRA rules, it must close to new members. Consider switching." |
   | Most recent year is `"Fail"`, previous year is not `"Fail"` | **Warning** | Amber banner: "⚠ At Risk — This fund failed the 2025 APRA test. A second consecutive fail would trigger mandatory closure. Monitor closely." |
   | Most recent year is `"Pass"` | **Clear** | Green banner: "✓ Clear — This fund passed the most recent APRA performance test." |
   | Most recent year is `"Unknown"` | **Unknown** | Slate banner: "— Result Unknown — APRA has not published a result for this fund's most recent test." |
   | Only 1 year of history available | **Insufficient data** | Slate banner: "— Insufficient history — Only one year of data is available. The consecutive-fail risk signal requires at least 2 years." |
   | No history available | **No data** | Slate banner: "— No history available — Risk cannot be assessed for this product." |

2. `[MUST]` The risk signal is computed entirely in the browser from the `history` object — it is not read from any pre-computed field in the data
3. `[MUST]` The computation uses the two most recent years (by descending sort of year keys) to determine consecutive fails — it does not rely on the position of entries in the JSON
4. `[MUST]` An "Unknown" result for a year does **not** count as a "Fail" for the purposes of consecutive fail detection
5. `[MUST]` For TDP products with only 1 year of history (2025 only), the signal shows "Insufficient data" — it must not show "Clear" or imply safety
6. `[SHOULD]` The Critical banner includes a call-to-action link to APRA's website or a general guidance note ("Consider seeking financial advice")

### Story 5: Navigate back to search
**As a** superannuation member, **I want** to return to the search page without losing my place **so that** I can look up another fund.

**Acceptance Criteria:**
1. `[MUST]` A "← Search again" link is visible at the top of the page and navigates to Page 1 (`/#/`)
2. `[MUST]` If the member navigates directly to a Page 2 URL (e.g., bookmarked `/#/fund/...`) with no `location.state.fund`, they are redirected to Page 1 with no error shown

### Global Acceptance Criteria
1. `[MUST]` All interactive elements meet a minimum touch target of 44×44px (WCAG 2.5.5)
2. `[MUST]` The page is fully readable and usable on mobile (320px+) and desktop
3. `[MUST]` No colour is the sole indicator of meaning — every RAG colour is accompanied by a text label or value (WCAG 1.4.1)
4. `[MUST]` The page renders correctly when all metric fields are `null`
5. `[MUST]` The page renders correctly when `history` is empty or contains only 1 entry
6. `[MUST]` Page renders within 500ms of navigation from Page 1 (data already in memory — no fetch needed)

## Scope

### In Scope
- Current Pass/Fail result badge (Pass / Fail / Unknown / not available)
- Supporting metrics: NIR 10yr, fees at $50K, fees at $100K — each with RAG indicator
- `current_metrics_available: false` notice (amber)
- Data freshness label
- Year-by-year Pass/Fail history (sorted descending, with depth note for limited history)
- Risk signal banner (Critical / Warning / Clear / Unknown / Insufficient / No data)
- "← Search again" navigation
- Responsive layout (mobile + desktop)
- Accessible colour coding (text + colour, never colour alone)

### Out of Scope
- Comparison with other funds (Page 3 — Future)
- TDP-specific UI differences (TDP product type label and 3-year history cap are in scope; the TDP search that gets here is Feature 1b)
- Any live data fetching — all data comes from `location.state.fund`
- Exporting or sharing the dashboard
- Member accounts, personalisation, or saving results

## Approach

The fund record is already in memory — passed from `SearchPage` via React Router `location.state`. `DashboardPage` reads it directly:

```ts
const fund = (location.state as { fund?: MySuperProduct } | null)?.fund
if (!fund) return <Navigate to="/" replace />
```

The data context (`usePerformanceData`) provides `meta.last_updated` for the freshness label. No additional fetch is triggered.

**Risk signal computation** (`src/utils/riskSignal.ts`):
```ts
type RiskLevel = 'critical' | 'warning' | 'clear' | 'unknown' | 'insufficient' | 'no-data'

function computeRiskSignal(history: Record<string, PassFail>): RiskLevel {
  const years = Object.keys(history).sort((a, b) => Number(b) - Number(a)) // descending
  if (years.length === 0) return 'no-data'
  if (years.length === 1) return 'insufficient'
  const [latest, previous] = [history[years[0]], history[years[1]]]
  if (latest === 'Fail' && previous === 'Fail') return 'critical'
  if (latest === 'Fail') return 'warning'
  if (latest === 'Unknown') return 'unknown'
  return 'clear'
}
```

**Metric formatting** (`src/utils/formatters.ts`):
```ts
// Decimal to percentage: 0.0675 → "6.75%"
function formatPercent(value: number | null): string {
  if (value === null) return 'Not available'
  return (value * 100).toFixed(2) + '% p.a.'
}
```

**New component file structure:**
```
src/
├── utils/
│   ├── search.ts              (existing)
│   ├── riskSignal.ts          (new — risk level computation)
│   └── formatters.ts          (new — formatPercent)
└── components/
    ├── RiskSignalBanner.tsx   (new — banner with level-specific copy and colour)
    ├── StatusBadge.tsx        (new — Pass/Fail/Unknown badge, reused in card + history)
    ├── MetricsCard.tsx        (new — NIR + fees + RAG indicators)
    ├── HistoryTimeline.tsx    (new — year-by-year list)
    └── RagIndicator.tsx       (new — coloured dot + label for Green/Red/null)
```

## Non-Functional Requirements

- **Performance:** Page renders within 500ms of navigation — all data is already in memory
- **Accessibility:** WCAG 2.1 AA — colour never the sole indicator of meaning; all badges have text labels; risk banner uses both colour and icon; touch targets ≥ 44px
- **Compatibility:** Chrome, Firefox, Safari, Edge (current); iOS Safari 16+, Android Chrome (current)
- **Resilience:** Every field must degrade gracefully when null — no runtime crashes from missing data

## Error States

| Scenario | Expected Behaviour |
|----------|--------------------|
| `location.state.fund` is missing (direct URL access, bookmark) | Redirect to `/#/` silently — no error shown to user |
| `current_metrics_available` is `false` | Amber notice replaces metrics section; Pass/Fail badge and history still shown where available |
| `pass_fail_current` is `null` | No Pass/Fail badge shown; history and risk signal still shown |
| `pass_fail_current` is `"Unknown"` | Slate "Result Unknown" badge shown with explanatory note |
| All metric values are `null` (but `current_metrics_available` is `true`) | Each metric shows "Not available" in muted text; RAG indicator not shown |
| `history` is empty `{}` | History section: "No history available for this product"; risk signal: "No data" slate banner |
| `history` has only 1 entry | History shows that 1 entry; risk signal: "Insufficient data" slate banner |
| `nir_rag` or fee RAG is `null` | RAG indicator not rendered for that metric; value still shown if not null |

## Success Metrics & Instrumentation

- **Primary metric:** % of members who reach Page 2 and view the risk signal banner (signals the full flow is completing)
- **Secondary metrics:**
  - Time spent on Page 2 (proxy for comprehension — too short = not read; too long = confused)
  - "← Search again" click rate (signals members looking up multiple funds)
- **Events to track:**
  - `dashboard_viewed` — fires on mount, with `product_name`, `pass_fail_current`, `risk_level` (computed)
  - `dashboard_metrics_unavailable` — fires when `current_metrics_available` is `false`
  - `dashboard_search_again_clicked` — fires on "← Search again" link click
  - `dashboard_critical_cta_clicked` — fires if Critical banner CTA is clicked (APRA link)
- **Evaluation timeline:** 1–2 weeks post-launch — check `dashboard_viewed` event rate vs `fund_selected` rate to confirm Page 2 is being reached

## Dependencies & Prerequisites

- **Feature 1a must be complete** — `SearchPage` must pass the full `MySuperProduct` record to `DashboardPage` via `location.state.fund`; without this, Page 2 has no data
- **`src/types/performance.ts` must be updated** — `PassFail` type must include `'Unknown'` (currently missing)
- **`usePerformanceData()` hook** — already built; provides `meta.last_updated` for the freshness label

## UI/UX Requirements

- **Page layout (top to bottom):**
  1. Navigation row: "← Search again"
  2. Fund name heading + product type label (e.g., "MySuper product")
  3. Data freshness label (right-aligned or below heading)
  4. **Risk signal banner** — full width, coloured, immediately visible without scrolling
  5. **Current status card** — Pass/Fail badge + APRA test year
  6. **Metrics card** — NIR and fees in a 3-column or stacked layout with RAG dots
  7. **History timeline** — year rows descending, Pass/Fail badges, depth note
  8. Footer note: brief explanation of APRA test and RAG methodology

- **Colour system for this page (RAG is allowed here — reserved from Page 1):**

  | Element | Tailwind classes |
  |---------|-----------------|
  | Pass badge | `bg-green-100 text-green-800 border border-green-300` |
  | Fail badge | `bg-red-100 text-red-800 border border-red-300` |
  | Unknown badge | `bg-slate-100 text-slate-600 border border-slate-300` |
  | RAG Green dot | `bg-green-500` |
  | RAG Red dot | `bg-red-500` |
  | Critical banner | `bg-red-50 border border-red-200 text-red-800` |
  | Warning banner | `bg-amber-50 border border-amber-200 text-amber-800` |
  | Clear banner | `bg-green-50 border border-green-200 text-green-800` |
  | Unknown / Insufficient banner | `bg-slate-50 border border-slate-200 text-slate-600` |
  | Metrics unavailable notice | `bg-amber-50 border border-amber-200 text-amber-700` |

- **Copy:**
  - Page heading: `"{product_name}"`
  - Product type: `"MySuper product"` or `"Trustee Directed Product ({product_type})"`
  - Current result label: `"2025 APRA Performance Test"`
  - Metrics section heading: `"Performance Metrics"`
  - NIR label: `"10-year net investment return"`
  - Fee labels: `"Annual fee — $50K balance"` / `"Annual fee — $100K balance"`
  - RAG footnote: `"Green = above benchmark | Red = below benchmark"`
  - History heading: `"Pass/Fail History"`
  - Latest year marker: `"Latest"`
  - History depth note: `"History available from [year] only"`
  - Search again: `"← Search again"`

- **Mobile layout:** Single-column; risk banner appears immediately below the heading and above the status card; all tap targets ≥ 44px
- **Desktop layout:** Max-width container (e.g., 640px centred); metrics card may use a 3-column grid for NIR + 2 fee rows

## Design Constraints

- All data is read from `location.state.fund` and `usePerformanceData()` context — no additional fetch
- `PassFail` type must include `'Unknown'` — the existing type definition must be corrected before implementation
- Risk signal must be computed at runtime — it must not be read from a pre-computed field
- RAG colour is allowed on Page 2 (this is where it is reserved for); it must NOT be used on Page 1 (Search)
- Every colour-coded element must also have a text label — colour alone is not sufficient (WCAG 1.4.1)
- The dashboard must render safely when any field is null — no optional chaining shortcuts that mask a render crash

## Verification

**Happy path — full data available:**
1. From Page 1, search for "AustralianSuper MySuper" and select it
2. Click "View performance →"
3. Confirm: fund name heading visible; "2025 APRA Performance Test" label; green "Pass" badge
4. Confirm: NIR shown as percentage (e.g., "7.95% p.a.") with green dot; fees shown with green dots
5. Confirm: history section shows 5 years descending (2025 → 2021); 2025 marked "Latest"
6. Confirm: risk signal banner shows green "Clear" message
7. Confirm: data freshness label reads "Data last updated: June 2025"

**Fail fund — TDP:**
1. From Page 1, navigate to a TDP fund where `pass_fail_current` is `"Fail"` (e.g., Bendigo Balanced Wholesale Fund)
2. Confirm: red "Fail" badge shown
3. Confirm: risk signal shows "Warning" (amber) since only 1 year of history available
4. Confirm: history shows 1 year only (2025: Fail); depth note shown

**Critical path — 2 consecutive fails:**
1. Construct a test record in browser devtools with `history: { "2025": "Fail", "2024": "Fail" }` via `location.state`
2. Confirm: risk signal shows "Critical" (red) with closure warning

**Metrics unavailable:**
1. Select a fund where `current_metrics_available` is `false` (e.g., GSJBW MySuper, which has history but no current metrics)
2. Confirm: amber metrics notice replaces the metrics card
3. Confirm: history section still shows available years; risk signal still computed from history

**Unknown result:**
1. Select a fund where `pass_fail_current` is `"Unknown"` (e.g., Mercer Tailored (CRG) MySuper)
2. Confirm: slate "Result Unknown" badge shown; explanatory note visible
3. Confirm: risk signal shows "Unknown" banner

**Direct URL access (no state):**
1. Open `/#/fund/AustralianSuper%20MySuper` directly in a new tab (no prior navigation)
2. Confirm: redirected to `/#/` (Page 1) immediately, no error

**Mobile:**
1. Open in Chrome DevTools iPhone emulator
2. Confirm: risk banner visible without scrolling; all buttons ≥ 44px tap target; metrics readable

**No-colour accessibility check:**
1. Enable browser greyscale filter or use a colour blindness simulator
2. Confirm: Pass/Fail badges readable by text alone; RAG indicators have "Green" / "Red" text label

## Open Questions

- **"Unknown" in history:** Should "Unknown" years be shown in the history timeline with a slate badge, or omitted? Currently in scope to show them — confirm before implementation
- **Critical banner CTA:** Should the red Critical banner link to APRA's website directly, or to a general "seek financial advice" message? (APRA URL: https://www.apra.gov.au/annual-superannuation-performance-test)
- **Amber RAG:** The actual dataset contains only Green and Red RAG values. Should the UI design defensively include Amber (in case future APRA results introduce it), or only render Green and Red?
- **TDP product type label:** Should `product_type` ("Platform TDP" / "Non-platform TDP") be shown on Page 2? It helps members understand what they're looking at

## Future Considerations

- **Comparison view (Page 3):** Once Page 3 is built, a "Compare with similar funds →" button on this page will link forward
- **Print / export:** A "Download as PDF" option for members to share with their adviser
- **APRA link:** "View official APRA result →" deep-link to the APRA website entry for this fund and year
- **Fail count in banner:** Critical banner could show "This fund has failed X of the last Y tests" for additional context
- **History chart:** A sparkline or bar chart visualisation of the history in addition to the list

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 2026-04-04 | Initial draft | Alpesh Shah |
