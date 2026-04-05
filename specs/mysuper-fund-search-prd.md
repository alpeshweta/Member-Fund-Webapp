# Feature: MySuper Fund Search & Selection

**Epic:** Fund Search & Selection (issue #1)
**Vision Brief:** specs/apra-member-performance-vision.md

## Summary

Page 1 of a 3-page app. A preemptive autocomplete search interface that lets a superannuation member begin typing their fund name and immediately see a prompted dropdown of matching MySuper products — selecting from the dropdown confirms their fund and navigates them to the performance dashboard on Page 2.

## Page Model

| Page | Purpose | Feature |
|------|---------|---------|
| **Page 1** | Search & select your fund | Feature 1a (MySuper), Feature 1b (TDP) |
| **Page 2** | View Pass/Fail status, history, and metrics | Epic 2 |
| **Page 3** | Compare and explore similar funds | Future (Capability 5) |

## Motivation

23.3 million Australians hold superannuation accounts, yet there is no tool that lets a member look up their fund's APRA Pass/Fail status without navigating APRA's Excel-based website. Before a member can view performance data, they must first be able to find their fund quickly and with confidence.

MySuper products are the simpler search case — 127 products, single-level naming — and form the foundation for the more complex TDP search that follows (Feature 1b). Proving this pattern works here reduces risk for the rest of the build.

The APRA 2025 results were released in June 2025 and are already captured in `performance-data.json`. The search interface is the last step between that data and the members who need it.

## User Stories & Acceptance Criteria

### Story 1: Preemptive fund search
**As a** superannuation member (or financial adviser acting on their behalf), **I want** to start typing my fund name and immediately see prompted matching options appear **so that** I can find my fund in seconds without knowing its exact registered name.

**Acceptance Criteria:**
1. `[MUST]` A prominently placed text input is displayed with a visible placeholder (e.g., "Start typing your super fund name…")
2. `[MUST]` As the user types, a dropdown of matching MySuper product names appears beneath the input in real time — no submit action required
3. `[MUST]` The dropdown begins appearing after 2 characters are entered; fewer than 2 characters shows no dropdown
4. `[MUST]` Matching is case-insensitive and supports partial strings (e.g., "australian" matches "AustralianSuper MySuper")
5. `[MUST]` Fuzzy matching handles common abbreviations and minor typos (e.g., "Aus Super" returns "AustralianSuper MySuper"; "hostpluss" returns "Hostplus")
6. `[MUST]` Results in the dropdown are ordered by match relevance — closest matches appear first
7. `[MUST]` The matched portion of each fund name is visually highlighted in the dropdown (e.g., bold text on the matched characters)
8. `[MUST]` If no products match, the dropdown shows: "No MySuper funds matched your search. Try a shorter or different term."
9. `[MUST]` The dropdown shows all matching results — no cap on result count; the dropdown list is scrollable when results exceed the visible area
10. `[SHOULD]` A subtle count (e.g., "Showing 3 of 127 MySuper products") appears at the bottom of the dropdown so the member knows how many options matched

### Story 2: Fund selection and confirmation
**As a** superannuation member, **I want** to tap or click a fund from the dropdown to confirm my selection **so that** I can proceed to see its APRA performance data.

**Acceptance Criteria:**
1. `[MUST]` Tapping or clicking a dropdown result selects the fund and closes the dropdown
2. `[MUST]` The confirmed selection is displayed below the search input: fund name in a clearly labelled confirmed state (e.g., "Selected: AustralianSuper MySuper")
3. `[MUST]` A "Change" link or button is shown alongside the confirmed selection so the user can return to the search input
4. `[MUST]` Pressing Enter while a dropdown item is focused selects it (keyboard)
5. `[MUST]` The dropdown can be dismissed without selecting by pressing Escape or clicking outside it, returning focus to the search input
6. `[MUST]` After selection, a "View performance →" button or equivalent call-to-action becomes available to navigate to Page 2
7. `[MUST]` If the selected fund's `current_metrics_available` is `false`, a notice is shown beneath the confirmed selection: "Current year metrics are not available for this product. Pass/Fail status and history are still shown."
8. `[SHOULD]` The dropdown is navigable with arrow keys — Up/Down moves between results, Enter selects

### Story 3: Data loading and freshness
**As a** superannuation member, **I want** to know the data is loaded and current **so that** I can trust what I'm seeing.

**Acceptance Criteria:**
1. `[MUST]` The app loads `performance-data.json` at startup; the search input is active only after data loads successfully
2. `[MUST]` While loading, the search input is disabled and a loading indicator is shown (e.g., a spinner or "Loading fund data…" message)
3. `[MUST]` The `last_updated` value from `performance-data.json` is displayed as a data freshness label (e.g., "Data last updated: June 2025"); this value must not be hard-coded

### Global Acceptance Criteria
1. `[MUST]` The search interface is fully usable on mobile and desktop (responsive layout)
2. `[MUST]` All interactive elements — search input, dropdown items, "Change" link, "View performance" button — meet a minimum touch target size of 44×44px (WCAG 2.5.5)
3. `[MUST]` No interaction relies on hover alone; all interactions are accessible via tap or click
4. `[MUST]` The search input and dropdown are keyboard accessible — focusable via Tab, navigable via arrow keys, selectable via Enter
5. `[MUST]` The dropdown uses correct ARIA roles (`role="combobox"` on input, `role="listbox"` on dropdown, `role="option"` on each item) and `aria-expanded` state
6. `[MUST]` Search results are updated within 100ms of each keystroke (client-side, no network call)
7. `[MUST]` The page is functional in current versions of Chrome, Firefox, Safari, Edge, iOS Safari, and Android Chrome

## Scope

### In Scope
- Preemptive autocomplete search input with real-time fuzzy/partial matching dropdown
- Dropdown result highlighting and relevance ordering
- Fund selection confirmation with `current_metrics_available` notice where applicable
- "View performance →" navigation trigger to Page 2
- Data freshness label from `performance-data.json`
- Loading and error states for the data file
- Responsive layout — mobile and desktop
- Full keyboard and touch accessibility

### Out of Scope
- TDP fund search (Feature 1b — different hierarchy, handled separately)
- Display of Pass/Fail status, metrics, history, or risk signal (Epic 2 — Page 2)
- Comparable funds view (Future — Page 3)
- Backend server, API, or database — all data is loaded client-side
- User accounts, authentication, or saved searches
- Search analytics logging to a backend service
- Auto-refresh of data after APRA annual release

## Approach

`performance-data.json` is fetched client-side at app startup. The `mysuper_products` array (127 records) is loaded into memory. A fuzzy search library (e.g., Fuse.js) is configured to search against `product_name` values, returning ranked matches on each keystroke. Matched characters are highlighted in the rendered dropdown items.

On selection, the full matched record object (all fields from `mysuper_products`) is stored in app state and passed to Page 2 when the member navigates forward. If `current_metrics_available` is `false` on the selected record, the notice is rendered immediately in the confirmed-selection state.

127 records is well within client-side performance limits — no server-side search is needed.

Frontend framework and fuzzy search library are open questions to be resolved in plan mode.

## Non-Functional Requirements

- **Performance:** Dropdown appears and updates within 100ms of each keystroke; `performance-data.json` loads within 3 seconds on a standard broadband connection
- **Accessibility:** WCAG 2.1 AA — visible label on search input, correct ARIA combobox/listbox/option roles, `aria-expanded` toggled on dropdown, minimum 44×44px touch targets, no hover-only interactions
- **Compatibility:** Chrome, Firefox, Safari, Edge (current versions); iOS Safari 16+, Android Chrome (current)
- **Scalability:** 127 fixed records — no scalability concern for this feature
- **Security:** User input is never executed or injected into any system; all processing is client-side and the search query is not persisted

## Error States

| Scenario | Expected Behavior |
|----------|-------------------|
| `performance-data.json` fails to load | Search input disabled; message: "Unable to load fund data. Please refresh the page." with a Refresh button |
| `performance-data.json` loads but `mysuper_products` is missing or empty | Message: "Fund data is currently unavailable. Please try again later." |
| User types 2+ characters with no matching results | Dropdown shows: "No MySuper funds matched your search. Try a shorter or different term." |
| User types fewer than 2 characters | Dropdown does not appear; no error shown |
| Selected fund has `current_metrics_available: false` | Confirmation notice: "Current year metrics are not available for this product. Pass/Fail status and history are still shown." |
| User attempts to navigate to Page 2 without a fund selected | "View performance →" button is disabled or not rendered until a fund is confirmed |

## Success Metrics & Instrumentation

- **Primary metric:** % of sessions where a fund is successfully selected within 60 seconds of the search input becoming active
- **Secondary metrics:**
  - Zero-results rate — % of search queries that return no dropdown matches (signals naming mismatch issues)
  - Search-to-selection conversion — % of users who type 2+ characters and successfully select a fund
- **Events to track:**
  - `search_initiated` — user types first character
  - `search_results_shown` — fires on each dropdown update, with `result_count` and `query_length`
  - `search_no_results` — fires when dropdown is empty, with `query` (captures failed search terms)
  - `fund_selected` — fires on selection, with `product_name` and `current_metrics_available`
  - `fund_selection_cleared` — fires when user clicks "Change"
  - `page2_navigated` — fires when user clicks "View performance →"
  - `data_load_error` — fires if `performance-data.json` fails to load
- **Evaluation timeline:** Review zero-results rate and search-to-selection conversion 1–2 weeks post-launch; adjust Fuse.js thresholds if zero-results rate exceeds 10%

## Dependencies & Prerequisites

- `performance-data.json` must be present and accessible at a known path; `mysuper_products` array must be populated with at least 1 record
- Frontend framework decision must be made before implementation planning (React, Vue, or plain HTML/JS — see Open Questions)
- Hosting environment must support static file serving (Epic 3); app must be locally testable before deployment

## UI/UX Requirements

- **Key interactions:**
  1. Member lands on Page 1 → sees a prominent search input, data freshness label, and "127 MySuper products" context
  2. Member types 2+ characters → autocomplete dropdown appears beneath the input, results highlighted in real time
  3. Member taps or clicks (or arrow-key navigates and presses Enter) a result → dropdown closes, confirmed selection displayed with fund name
  4. If `current_metrics_available` is `false` → notice appears beneath confirmation
  5. Member taps "View performance →" → navigates to Page 2 (Epic 2)
  6. Member taps "Change" → search input reappears, cleared and focused, ready to search again
- **Copy & messaging:**
  - Search placeholder: "Start typing your super fund name…"
  - Dropdown header (optional): "Matching funds"
  - No results: "No MySuper funds matched your search. Try a shorter or different term."
  - Confirmed selection label: "Selected:"
  - Metrics unavailable notice: "Current year metrics are not available for this product. Pass/Fail status and history are still shown."
  - Change action: "Change"
  - Navigate action: "View performance →"
  - Freshness label: "Data last updated: [Month] [Year]"
  - Loading state: "Loading fund data…"
  - Load error: "Unable to load fund data. Please refresh the page."
- **Responsive behavior:**
  - Mobile: Full-width single-column layout; dropdown takes full viewport width; large tap targets throughout
  - Desktop: Constrained to a max-width container (e.g., 640px); dropdown width matches input width
- **Touch behaviour:**
  - Dropdown items are tappable with a minimum 44×44px touch target
  - Dropdown list is scrollable by swipe on mobile when results exceed the visible area
  - No tooltips or hover states used for primary interactions — all content visible on tap or in static state
- **Design references:** Sober, mature colour palette — no bright consumer-app colours. Professional financial dashboard aesthetic. Think clean government/financial services UI. Traffic-light green/amber/red are reserved for RAG indicators on Page 2 and must not appear on Page 1.

## Design Constraints

- Data loaded client-side from `performance-data.json` — no backend API or server-side search in MVP
- No new runtime infrastructure dependencies beyond the chosen frontend framework and a fuzzy search library
- The full selected record object (all fields from `mysuper_products`) must be passed to Page 2 — not just the product name string; Epic 2 depends on all fields
- The `last_updated` field must be read from `performance-data.json` at runtime and not hard-coded
- No hover-only interactions — every interaction must be accessible via tap or click for mobile users
- The 3-page navigation model (Page 1 → Page 2 → Page 3) must be established in this feature even though Pages 2 and 3 are not yet built; routing architecture must accommodate this

## Verification

**Happy path (desktop):**
1. Open the app in a browser
2. Confirm the data freshness label is visible (e.g., "Data last updated: June 2025")
3. Click the search input; confirm the placeholder text is visible
4. Type "aus" — confirm the autocomplete dropdown appears within 100ms with "AustralianSuper MySuper" visible and "aus" highlighted
5. Type "AustSuper" — confirm fuzzy matching still surfaces "AustralianSuper MySuper"
6. Click "AustralianSuper MySuper" — confirm dropdown closes and confirmed state reads "Selected: AustralianSuper MySuper"
7. Confirm "View performance →" button is now active
8. Click "Change" — confirm search input reappears, cleared and focused

**Keyboard path:**
1. Tab to the search input, type "rest"
2. Press Down arrow — confirm focus moves into the dropdown
3. Press Down again to reach "REST Super MySuper"; press Enter — confirm selection registers
4. Press Tab to reach "Change"; press Enter — confirm search resets and input is focused

**Touch / mobile path:**
1. Open the app on a mobile device (or browser device emulator — iOS Safari or Android Chrome)
2. Tap the search input — confirm keyboard opens and input receives focus
3. Type "host" — confirm the autocomplete dropdown appears and is scrollable by swipe
4. Tap "Hostplus" — confirm selection and confirmed-state card appear
5. Confirm "View performance →" tap target is easily tappable without zooming
6. Tap "Change" — confirm search resets

**Metrics unavailable path:**
1. Identify a record in `performance-data.json` where `current_metrics_available` is `false`
2. Search for and select that fund
3. Confirm the metrics unavailable notice appears beneath the confirmed selection

**Error path:**
1. Rename or remove `performance-data.json` temporarily
2. Reload the app — confirm the search input is disabled and the load error message with Refresh button is shown
3. Restore the file and reload — confirm normal behaviour resumes

**No results path:**
1. Type "zzzzz" — confirm the no-results message appears and the dropdown shows no fund names

## Open Questions

- **Frontend framework:** React, Vue, or plain HTML/JS? React is recommended for component reusability across Pages 1–3, but plain HTML/JS minimises build tooling. Decision needed before implementation planning.
- **Fuzzy search library:** Fuse.js is the most common lightweight option. Any preference or constraint on adding a dependency?
- **Routing:** Should Page 1 → Page 2 navigation use URL routing (e.g., `/fund/australiansuper-mysuper`) to support bookmarking and browser back, or is in-page state navigation sufficient for MVP?
- **`performance-data.json` serving location:** Bundled into static assets, or fetched from a CDN/storage URL? Affects load error handling and caching strategy.
- **Analytics platform:** Which tool will receive instrumentation events (Google Analytics, Mixpanel, Plausible, none for MVP)?

## Future Considerations

- **Unified search across product types:** Once Feature 1b is built, Page 1 should offer a single search input that returns both MySuper and TDP results, labelled by type, in one dropdown
- **Adviser multi-fund view:** A future adviser mode could allow selecting and pinning multiple funds to compare on behalf of different clients
- **Saved / recent searches:** Remember the last selected fund in local storage so returning members don't need to search again each visit
- **Search analytics feedback loop:** Use zero-results queries to identify naming mismatches and improve the pipeline's fuzzy matching or add product name aliases to the data

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 2026-04-02 | Initial draft | Alpesh Shah |
| 2026-04-03 | Updated to preemptive autocomplete dropdown; added 3-page navigation model; added `current_metrics_available` notice; added touch accessibility requirements | Alpesh Shah |
