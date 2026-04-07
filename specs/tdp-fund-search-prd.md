# Feature: TDP Fund Search & Selection

**Epic:** Fund Search & Selection (issue #1)
**Vision Brief:** specs/apra-member-performance-vision.md

## Summary

Feature 1b adds a "Choice (TDP)" tab to Page 1, enabling members in employer-sponsored
or platform super arrangements to search their Trustee-Directed Product (TDP) investment
option across 1,706 records. Each TDP has a three-level name hierarchy:
section (product_name) → menu (investment_menu_name) → option (investment_option_name).
Search returns results showing all three fields; selection confirms the fund and navigates
to Page 2.

## Page Model

| Page | Purpose | Feature |
|------|---------|---------|
| **Page 1** | Search & select your fund | Feature 1a (MySuper tab) ✅, Feature 1b (TDP tab) |
| **Page 2** | View Pass/Fail status, history, and metrics | Epic 2 |
| **Page 3** | Compare and explore similar funds | Future |

## Motivation

1,706 TDP investment options are included in APRA's annual performance test but are
significantly harder to find than MySuper products. TDP members must know their option
name, which may differ from their employer's plan branding. Multi-field fuzzy search
across option name, menu name, and section label minimises lookup friction.

## User Stories & Acceptance Criteria

### Story 1: TDP preemptive fund search
**As a** superannuation member in an employer or platform super arrangement,
**I want** to type part of my investment option name and see matching TDP options appear
**so that** I can find my specific option without knowing its exact registered name.

**Acceptance Criteria:**
1. `[MUST]` A "Choice (TDP)" tab on Page 1 shows a search input with placeholder
   "Start typing your investment option or fund name…"
2. `[MUST]` Dropdown appears after 2 characters; fewer than 2 shows no dropdown
3. `[MUST]` Search matches across all three name fields: investment_option_name
   (highest weight), investment_menu_name (medium weight), product_name (lowest weight)
4. `[MUST]` Matching is case-insensitive and supports partial strings
5. `[MUST]` Each dropdown result shows three lines:
   - Line 1: investment_option_name (primary, medium weight, matched chars highlighted)
   - Line 2: investment_menu_name (secondary, smaller, matched chars highlighted)
   - Line 3: product_name (tertiary, slate-400, no highlight)
6. `[MUST]` Results are capped at 15 per search to avoid overwhelming the dropdown
7. `[MUST]` Dropdown shows "Showing N of 1,706 TDP options" at the bottom
8. `[MUST]` No-results message: "No TDP options matched your search. Try a shorter or
   different term."
9. `[SHOULD]` Fuzzy matching handles minor typos and abbreviations

### Story 2: TDP selection and confirmation
**As a** superannuation member, **I want** to select a TDP option from the dropdown
**so that** I can proceed to view its APRA performance data.

**Acceptance Criteria:**
1. `[MUST]` Clicking or tapping a result selects it and closes the dropdown
2. `[MUST]` Confirmed selection shows all three name fields:
   - investment_option_name (heading)
   - investment_menu_name (sub-heading)
   - product_name (section label)
3. `[MUST]` "Change" button returns to search input
4. `[MUST]` "View performance →" button navigates to TDP dashboard (Page 2)
5. `[MUST]` If current_metrics_available is false, shows notice:
   "Current year metrics are not available for this product. Pass/Fail status and
   history are still shown."
6. `[MUST]` Keyboard: Enter selects focused item; Escape dismisses dropdown
7. `[SHOULD]` Arrow keys navigate the dropdown

### Story 3: Data loading and tab state
**As a** superannuation member, **I want** to see the TDP tab is available once data loads
**so that** I know the search is ready to use.

**Acceptance Criteria:**
1. `[MUST]` TDP search input is disabled while data loads; shows "Loading fund data…"
2. `[MUST]` Tab switching does not reset the other tab's state (if I searched MySuper
   and switch to TDP, my MySuper search is still there when I switch back)
3. `[MUST]` Data freshness label (shared) is visible on both tabs

### Global Acceptance Criteria
1. `[MUST]` All interactive elements meet 44×44px minimum touch target (WCAG 2.5.5)
2. `[MUST]` ARIA combobox/listbox/option pattern with aria-activedescendant
3. `[MUST]` No hover-only interactions
4. `[MUST]` Keyboard accessible — Tab, arrow keys, Enter, Escape

## Error States

| Scenario | Expected Behavior |
|----------|-------------------|
| performance-data.json fails to load | TDP search disabled; same error banner as MySuper tab |
| User types 2+ characters with no match | "No TDP options matched your search. Try a shorter or different term." |
| User types fewer than 2 characters | No dropdown shown |
| Selected fund has current_metrics_available: false | Amber notice in confirmation card |

## Scope

### In Scope
- TDP search tab with real-time fuzzy search across three name fields
- Three-line dropdown item display (option, menu, section)
- Selection confirmation card with three-field display
- Navigation to TDP Page 2 dashboard
- Keyboard and touch accessibility

### Out of Scope
- Unified single-input search across MySuper + TDP (future consideration)
- Filtering by product_type ('Platform TDP' vs 'Non-platform TDP')
- Backend search or server-side rendering

## Approach

`performance-data.json` is already fetched at startup. `tdp_products` (1,706 records) is
added to the context alongside `mysuper_products`. A new Fuse.js instance is configured
with three weighted keys. Search is limited to 15 results. Each dropdown item renders
all three name fields, with per-field match highlighting derived from Fuse's
`includeMatches` output.

## Non-Functional Requirements

- **Performance:** Dropdown updates within 100ms; 1,706 records is within Fuse.js
  in-memory performance limits
- **Accessibility:** WCAG 2.1 AA; unique ARIA IDs per tab to avoid conflicts
- **Scalability:** Fixed record count; no scalability concern for MVP

## UI/UX Requirements

- **Tab labels:** "MySuper" | "Choice (TDP)"
- **Search placeholder:** "Start typing your investment option or fund name…"
- **No results:** "No TDP options matched your search. Try a shorter or different term."
- **Footer:** "Showing {n} of 1,706 TDP options"
- **Confirmed label:** "Selected:"
- **Navigate action:** "View performance →"
- **Change action:** "Change"
- **Metrics unavailable:** "Current year metrics are not available for this product.
  Pass/Fail status and history are still shown."

## Verification

1. Open app; confirm "MySuper" and "Choice (TDP)" tabs visible
2. Click "Choice (TDP)" tab; confirm search input has correct placeholder
3. Type "balanced" — confirm dropdown shows up to 15 results, each with 3 lines
4. Type "zzzzz" — confirm no-results message
5. Click a result — confirm selection card shows all 3 fields
6. Click "View performance →" — confirm navigation to /fund/tdp/... route
7. Click "Change" — confirm search resets
8. Switch back to "MySuper" tab — confirm MySuper state is intact
9. Test keyboard: arrow down into dropdown, Enter to select, Escape to dismiss
10. If selected fund has current_metrics_available: false — confirm amber notice appears

## Dependencies & Prerequisites

- Feature 1a (MySuper search) must be complete — Feature 1b builds on the same SearchPage
- `performance-data.json` must contain `tdp_products` array (it does — 1,706 records)
- All existing components (MetricsCard, HistoryTimeline, RiskSignalBanner, StatusBadge)
  must be refactored to accept shared interfaces before TdpDashboardPage is built

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 2026-04-08 | Initial draft | Alpesh Shah |
