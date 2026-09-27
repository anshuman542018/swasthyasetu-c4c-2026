# SwasthyaSetu

**Anticipate shortages. Connect districts. Keep care moving.**

Original prototype built September 27, 2026 for **Build with AI: Code for Communities - Second Edition**, Track 3: Smart Health & Supply Chain Resilience.

## Run

Node 22.12+ or 24 recommended.

```sh
npm ci
npm test
npm run build
npm run dev
```

## Judge walkthrough

1. Open Overview. Inspect 12 PHCs in Odisha, Andhra Pradesh and West Bengal. All data is synthetic.
2. Increase the outbreak demand multiplier. Shortage alerts and feasible transfer quantities recalculate.
3. Open Redistribution. Inspect recipient cover, donor protection, distances and estimated arrival. Approve one demo dispatch. Inventory reconciles and the ledger updates.
4. Open Health centres, update stock, bed occupancy and staff presence, and export the interoperable snapshot.
5. Open Federated intelligence. Inspect state-level sufficient statistics and the shared trend. Review the chronological 21-day training / 7-day holdout metrics.
6. Open Gemini briefing. Connect a restricted Gemini API key for this browser session or use the Vercel server-side configuration. Generate a grounded operations brief in English, Hindi, Odia, Telugu or Bengali.

## Meaningful Google AI integration

Gemini explains the actual computed shortage and feasible-transfer evidence to district coordinators in five languages. It cannot change inventory or approve dispatches. No fake or pre-recorded AI reply is substituted when a key is absent.

GitHub Pages is static: the session key is held only in memory and sent directly to `generativelanguage.googleapis.com` in the `x-goog-api-key` header. It is never persisted, exported or logged. **A valid key is required to demonstrate Google AI and satisfy event eligibility.**

For Vercel, deploy this repository with `GEMINI_API_KEY` and optionally `GEMINI_MODEL` (default `gemini-2.5-flash`). `api/brief.ts` keeps the key server-side. Set per-project Google API quota limits and add operator authentication/rate limiting before exposing a funded key to a public production service. The endpoint is a demo, not an authenticated clinical deployment.

## Forecast and redistribution methods

Each PHC fits a linear least-squares demand trend over 28 daily observations. Forecast horizon is 14 days. Planning consumption is the horizon average plus 1.64 times training residual RMSE, scaled by the outbreak multiplier. This is a conservative heuristic, not a calibrated probability interval. Stock cover equals stock / planning consumption.

Recipients below seven days are ranked by urgency. Candidate donors in the same state are sorted by approximate distance. Allocation retains **14 days of donor stock** and aims for **seven days at the recipient**. Straight-line distance is multiplied by 1.3 as a road approximation. Arrival assumes 35 km/h plus two hours handling. Routes arriving after predicted runout are excluded and need escalation. Expiry, batch quality, roads, vehicles and staff authority are not modeled.

Federation is an **executable simulation**: state nodes compute n, sum(x), sum(y), sum(x²), sum(x*y), which yield the exact pooled linear-regression coefficients. Raw histories are excluded from the exported model payload. All nodes run in one browser; no secure aggregation, differential privacy or independent state deployment is claimed. Transfers use facility forecasts, not the shared baseline.

Backtest trains on the first 21 days and evaluates the last seven, totaling 84 held-out observations. WAPE and MAE measure synthetic fixtures only. No real-world performance or prevented patient harm is claimed.

## Data and privacy

### Verified real public data and feed connections

Open **Public data & feeds**, now the default entry page. It displays eight historical national infrastructure/workforce counts from the Ministry of Health and Family Welfare's September 9, 2024 PIB release, reporting March 31, 2023. Publisher, reference date and source link are shown in the app. These are actual reported counts, not facility-level live stock or occupancy.

The page can fetch current model-based weather context for Bhubaneswar, Visakhapatnam and Kolkata from Open-Meteo, with provider validity times and fetch time. Weather data is CC BY 4.0 with attribution. This feed is separate from medicine demand and cannot establish PHC inventory or emergency alerts.

An authorized operational JSON export can replace the synthetic workspace. The app validates 1-500 facility records, unique IDs, India coordinates, capacities, timestamps and 28 daily consumption counts. Source and reporting date are required. Imported values are labelled user-reported, not independently verified; approvals still simulate stock movements. Download the blank schema at `public/data/operational-schema.json`. No PHC inventory API or live staff feed is currently connected; those need separately authorized access. A Gemini key does not provide those feeds.

`src/data.ts` contains original synthetic stock, consumption, beds and workforce fixtures; approximate coordinates represent eastern India. No patient data, real staff identities or official PHC stock records. Operations persist in localStorage in the current browser. Reset restores the initial fixture. This is a one-user demonstration; there is no real-time multi-user synchronization.

## Pilot plan

Begin with one district's consented, de-identified consumption data. Shadow-test forecasting and alerts. Add batch/expiry accounting, district approvals and separate dispatch/receipt confirmations. Measure stockout days, donor reserve violations, WAPE and alert precision against warehouse-only allocation. Deploy independent state nodes with Firebase Auth, Cloud Run and BigQuery aggregates after validation and privacy review. Extend standardized facility/medicine schemas across Indian states and, after regulatory/localization work, BRICS contexts.

## Submission requirements

Verified on the official dashboard: deadline **September 30, 2026, 11:59 PM IST**; public GitHub repository, live deployed prototype, public 3-5 minute demo video, 10-12 slide deck converted to PDF (under 5 MB), and brief 2-3 line description (form limit 1,024 characters). Google AI integration is mandatory. See `submission/` for prepared materials and compliance status.

## References and licenses

- [Official rules and evaluation](https://hack2skill.com/event/codeforcommunities2)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [National Health Mission](https://www.nhm.gov.in/)
- [Open Government Data India](https://www.data.gov.in/)
- Vite (MIT), TypeScript (Apache-2.0), tsx (MIT), DM Sans / Manrope fonts (SIL Open Font License via Google Fonts).
- Original project code: MIT. No official government or Google endorsement is claimed.

## Structure

`src/engine.ts`: forecast, constraints, federation, backtest; `src/main.ts`: accessible responsive workflow; `api/brief.ts`: Vercel Gemini handler; `tests/engine.test.ts`: invariants and chronological validation; `.github/workflows/pages.yml`: tested GitHub Pages deployment.
