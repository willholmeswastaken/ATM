# ATM — Eve Finance Agent

A personal net worth and budget agent built with [Vercel Eve](https://vercel.com/docs/eve). It reads and updates your Google Sheets finance dashboard via natural language — query net worth, manage assets/debts/overheads, and get data-grounded financial advice.

## Features

- **Query** — net worth, savings, debts, overheads, budget, debt schedule
- **CRUD** — create, update, delete assets, liabilities, and overheads
- **Advice** — savings rate, debt prioritization, affordability checks (always data-grounded)
- **Mock mode** — run locally without Google credentials (`SHEETS_MOCK=true`)

## Quick start

Requires **Node.js 24+**.

```bash
cd atm
cp .env.example .env
npm install
npm exec -- eve dev
```

Open the Eve REPL or HTTP chat UI. With `SHEETS_MOCK=true`, the agent uses sample data matching a typical Balance Sheet layout.

## Google Sheets setup

1. Create a GCP project and enable the **Google Sheets API**
2. Create a **service account** and download the JSON key
3. Share your spreadsheet with the service account email (Editor)
4. Set environment variables:

```env
GOOGLE_CLIENT_EMAIL=your-sa@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SPREADSHEET_ID=your-spreadsheet-id
SHEETS_MOCK=false
```

On Vercel, paste the private key as a single line with `\n` characters; the client handles newline conversion.

## Sheet layout

The agent expects a **Balance Sheet** tab with these regions (cell addresses configurable in `agent/lib/sheet-map.ts`):

| Region | Content |
|--------|---------|
| Summary KPIs | Total Savings, Total Spent, Total Bad Debt |
| Income Statement | Recurring bills (name, expense, type) |
| Liabilities | Credit accounts (balance, status, limit) |
| Assets | Savings/investments (account, funds, type) |
| Budget block | Salary, bills, savings, disposable |
| Debt Schedule tab | Payoff tracking |

Calibrate row numbers in `sheet-map.ts` against your live sheet if layout differs.

## Example queries

```
What's my net worth?
Which credit cards still owe money?
What are my monthly overheads?
How much disposable income do I have?
Am I saving enough?
Update my Demo LISA to £16,000
Mark Sample Card B as PAID
Add Example Streaming at £14.99/month
```

## Tools

| Read | Write |
|------|-------|
| `get_net_worth_summary` | `create_asset` / `update_asset` / `delete_asset` |
| `get_assets` | `create_liability` / `update_liability` / `delete_liability` |
| `get_liabilities` | `create_overhead` / `update_overhead` / `delete_overhead` |
| `get_overheads` | `update_budget` |
| `get_budget_overview` | |
| `get_debt_schedule` | |
| `list_sheet_tabs` | |

All writes require human approval in the Eve UI.

## Deploy to Vercel

```bash
vercel link
vercel env add GOOGLE_CLIENT_EMAIL
vercel env add GOOGLE_PRIVATE_KEY
vercel env add SPREADSHEET_ID
vercel deploy
```

Eve uses Vercel Functions with Fluid Compute and Workflows for durable sessions.

## Evals

```bash
SHEETS_MOCK=true npm exec -- eve eval
```

## Roadmap

- **Phase 2** — Financial board of advisor personas (Eve subagents)
- **Phase 3** — Trading212 / Revolut balance sync via provider adapters

## License

Apache-2.0 (via Eve framework)
