# Vision Brief: APRA Member Fund Performance Web App

**Date:** 2026-04-02
**Author:** Alpesh Shah
**Status:** Draft

## The Problem

23.3 million Australian superannuation member accounts have no easy way to check whether their fund's investment option has passed or failed the annual APRA performance test — or whether it is trending toward failure. The data exists but is buried in Excel spreadsheets across multiple pages on APRA's regulator website, requiring members to manually locate the right file, find their fund, identify their specific investment option, and then repeat the process for each prior year to understand historical trend. This is impractical for the average member. The stakes are high: a fund that fails the APRA test in two consecutive years is legally required to close that investment option to new members — early awareness is the difference between a member making a proactive switch versus being caught in a failing fund.

## Who Feels It

**Primary:** Superannuation members — everyday Australians invested in either a MySuper option or a Trustee-Directed Product (TDP). They check this once a year, typically following APRA's June results release, but currently have no accessible tool to do so.

**Secondary:** Financial advisers acting on behalf of clients — they need the same Pass/Fail history to provide informed advice on whether a client should switch funds.

## Stakeholders

- **Decision maker:** Project owner (personal project; designed for adoption by an individual investor website)
- **Reviewers:** Tech team, compliance team, marketing team (at point of integration into an investor platform)
- **Affected parties:** Super funds (their performance is being surfaced), APRA (whose data is being visualised), and the 23.3M members whose financial outcomes depend on this information being accessible

## Current State

A member who wants to check their APRA test status today must:
1. Navigate to the APRA website
2. Find and download the current year's performance test Excel file
3. Locate their fund and investment option within the spreadsheet
4. Navigate to a separate page for previous years' results
5. Repeat steps 2–4 for each historical year to understand trend

An agentic data pipeline has already been built to extract, clean, and structure this data into a single output file (`performance-data.json`), stored locally. The gap is a visual interface that makes this data accessible to members.

## Alternatives Considered

- **ATO YourSuper comparison tool:** Shows current performance metrics but no APRA Pass/Fail history or risk trend
- **Chant West:** Uses a proprietary Apple rating system (5-star scale); does not surface APRA Pass/Fail status or historical trend
- **SuperRatings / Morningstar:** Report on test results as news articles; no interactive per-fund Pass/Fail lookup
- **RateCity / Stockspot:** No dedicated APRA Pass/Fail status tool found
- **Why build:** No existing tool provides a member-facing visual showing year-by-year APRA Pass/Fail history per investment option, with a risk signal indicating proximity to the two-consecutive-fails closure threshold

## Strategic Context

Three factors converge now: (1) APRA's 2025 results were just released — 7 platform TDPs failed, and members in those funds need to act; (2) the hard work is done — the data pipeline already extracts and structures the APRA data, making this the last-mile delivery problem; (3) APRA test history now spans 5 years (2021–2025) for MySuper products, which is enough to show meaningful trends. Delaying means members face another year without a tool during the most important window — immediately after the June results drop.

## The Vision

A superannuation member can search for their fund and investment option in under a minute and immediately see whether they are at risk — without downloading a single file or navigating to multiple pages. A clear visual tells them their current Pass/Fail status, their fund's full test history, supporting performance metrics, and whether they are approaching the two-consecutive-fails threshold that triggers closure. For the first time, risk awareness is accessible to every Australian member, not just those who know how to navigate a regulator's website.

## Key Capabilities

*Note: Capabilities 1–4 form a single end-to-end flow and only deliver value together. Capability 5 is a future enhancement.*

1. **Must have:** A member can search for their super fund using partial/fuzzy matching across 127 MySuper products and 1,706 TDP options, then navigate a 3-level dropdown hierarchy (product → investment menu → investment option) to locate their specific option
2. **Must have:** A member can see the current year's APRA Pass/Fail result alongside supporting metrics — 10-year net investment return (NIR), fees at $50K and $100K balances, and Green/Amber/Red RAG indicators for each — with a data freshness indicator showing when the data was last updated (e.g., "Last updated: June 2025")
3. **Must have:** A member can see the full year-by-year Pass/Fail history for their selected option — up to 5 years for MySuper (2021–2025) and up to 3 years for TDPs (2023–2025) — displayed in a clear visual timeline format
4. **Must have:** A member sees an explicit risk signal computed from their history: no fails = clear, 1 fail = warning, 2 consecutive fails = critical (fund closure imminent under APRA rules)
5. **Nice to have:** A member can compare their option's Pass/Fail history and metrics against other options to understand relative risk

## Inspiration

No direct reference product identified. Design direction: clean financial dashboard aesthetic, dropdown-driven filtering with prompting, sober and mature colour palette (no consumer fintech vibes). Think Bloomberg terminal readability with modern web usability. Traffic-light colours (green/amber/red) are appropriate for RAG indicators and risk signals given they are already embedded in the source data.

## What Success Looks Like

- **Early signal (1–2 weeks):** A member can find their fund's risk status in under 60 seconds without any guidance
- **Real outcome (1–3 months):** The tool is integrated into APRA's website, Chant West, or SuperRatings as a visual representation layer — validating the approach at institutional scale

## Risks & Assumptions

- **Risk 1 — Option name changes:** Super funds periodically rename investment options. A name change between years breaks historical continuity in the dataset — a "Balanced" option in 2023 may not match "Balanced Growth" in 2025. Mitigation: the pipeline's fuzzy matching flags are already captured in `apra_fuzzy_flags.json`; the UI must handle ambiguous matches gracefully.
- **Risk 2 — Uneven history depth:** TDPs have only 3 years of history (2023–2025) vs MySuper's 5 years (2021–2025). The UI must communicate this clearly and not imply a complete history exists for all product types.
- **Risk 3 — Data structure drift:** APRA's Excel format may change between annual releases, breaking the pipeline. The app should degrade gracefully when data is missing rather than showing incorrect results.
- **Risk 4 — Consecutive fail computation:** The two-consecutive-fails risk signal is not pre-computed in the pipeline output. The app must calculate it at runtime from the history object. For TDPs with only 1 year of history (2025 only), this signal cannot yet be triggered — the UI must not imply false safety.
- **Risk 5 — Null metrics:** Some records have null values for `nir_10yr`, `fees_50k`, and `fees_100k`. The UI must display these gracefully (e.g., "Not available") without breaking the layout or implying a Pass/Fail meaning.
- **Key assumption:** Members can correctly identify which investment option they hold. Fund and option naming is notoriously inconsistent across member statements — search must use fuzzy/partial matching and surface close alternatives when an exact match isn't found.

## Dependencies

- `performance-data.json` — the pipeline output file; primary and sole data source for MVP. Schema includes:
  - **MySuper:** `product_name`, `pass_fail_current`, `nir_10yr`, `nir_rag`, `fees_50k`, `fees_50k_rag`, `fees_100k`, `fees_100k_rag`, `history` (2021–2025), `current_metrics_available`
  - **TDP:** `product_name`, `investment_menu_name`, `investment_option_name`, `product_type` (Platform TDP / Non-platform TDP), plus the same metrics and history fields as MySuper (2023–2025 only)
  - **Top-level:** `last_updated` (e.g., `"2025-06"`), `source_years_mysuper`, `source_years_tdp`, `total_mysuper_products` (127), `total_tdp_options` (1,706)
- The existing APRA data pipeline (skills + data loader workflows) — must remain operational for the annual June refresh
- A publicly accessible hosting environment (greenfield deployment)

## Constraints & Context

- **Tech stack:** Greenfield — no existing codebase to extend
- **Data source:** Pipeline output file only (`performance-data.json`) — no live APRA API calls or fallback in MVP
- **Hosting:** Publicly accessible (not local-only)
- **Data freshness:** Manual refresh after each annual APRA release (June); no auto-refresh in MVP
- **Scale:** 127 MySuper products + 1,706 TDP options = 1,833 searchable records; search must be performant client-side

## Open Questions

- What hosting platform is preferred (Vercel, Netlify, Azure Static Web Apps, etc.)?
- Should NIR and fee metrics be shown for all records, or only when `current_metrics_available` is true?
- How should the UI handle TDP records with only 1 year of history (2025 only) — show a "limited history" label?
- Should the risk signal for TDPs with 1 year of history show "insufficient data" rather than "clear"?
- What is the preferred frontend framework (React, Vue, plain HTML/JS)?

## Feature Breakdown

### Epic 1: Fund Search & Selection (issue #1)
- [ ] Feature 1a: MySuper fund search and selection — fuzzy search across 127 MySuper product names with dropdown selection
- [ ] Feature 1b: TDP fund search and selection — 3-level dropdown hierarchy (product → investment menu → investment option) across 1,706 TDP options with fuzzy/partial matching

### Epic 2: Performance Status Dashboard (issue #2)
- [ ] Feature 2a: Current APRA Pass/Fail status card with NIR, fees, RAG indicators, and data freshness label
- [ ] Feature 2b: Year-by-year Pass/Fail history timeline adjusted for history depth per product type
- [ ] Feature 2c: Risk signal indicator — consecutive fail computation and clear/warning/critical alert

### Epic 3: Public Deployment (issue #3)
- [ ] Feature 3a: Build, bundle, and deploy the app to a publicly accessible hosting environment

**Recommended starting feature:** Feature 1a (MySuper search) — quickest win, proves the search UX pattern before tackling TDP's 3-level complexity

## Future Considerations

- **Fallback to APRA source data:** When gaps exist in the pipeline output, trigger the data loader to fill from APRA's website
- **Comparison view (Capability 5):** Let members compare their option's trend against other options to assess relative risk
- **Member alerts:** Notify members when their fund's status changes after each June release
- **Adviser view:** Multi-client dashboard for financial advisers tracking multiple members' fund risk
- **Integration API:** Expose the data as an API so APRA, Chant West, or SuperRatings can embed it
- **Auto-refresh pipeline:** Trigger the APRA data pipeline automatically each June after APRA publishes results
