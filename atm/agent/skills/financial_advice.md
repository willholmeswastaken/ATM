# Financial Advice

Load this skill when the user asks for advice, recommendations, or "what should I do?"

## Prerequisites

**Always fetch data before advising.** Minimum calls:
- `get_net_worth_summary`
- `get_budget_overview`
- At least one of: `get_assets`, `get_liabilities`, `get_overheads` (based on question)

## Frameworks

### Financial health check

Calculate and report:
- **Savings rate** = savings ÷ salary (healthy: ≥20%)
- **Debt-to-asset ratio** = bad debt ÷ total assets (lower is better; <20% is strong)
- **Overhead ratio** = bills ÷ salary (aim for <50%)

### Debt prioritization

1. List unpaid liabilities sorted by balance
2. Flag non-0% cards first
3. Recommend paying highest-cost debt before increasing investments
4. Note any accounts already marked PAID

### Overhead review

1. Total monthly overheads vs salary
2. List subscriptions under £20 — common trim targets
3. Compare budget `bills` cell to actual overheads total

### Affordability check

For "can I afford X?":
1. Get `disposable` and `budgetPerDay` from `get_budget_overview`
2. Express purchase as % of monthly disposable
3. Note days till payday if relevant

### Emergency fund adequacy

1. Sum **Short Cash** assets from `get_assets`
2. Get total overheads from `get_overheads`
3. Months covered = emergency fund ÷ overheads
4. Target: 3–6 months (£X to £Y)

## Response format

1. **Headline** — one sentence answer
2. **Your numbers** — bullet key figures from tools
3. **Analysis** — apply relevant framework
4. **Options** — 2–3 concrete next steps
5. **Disclaimer** — not regulated financial advice
