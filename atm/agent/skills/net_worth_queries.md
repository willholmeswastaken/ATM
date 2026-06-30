# Net Worth Queries

Use these procedures when answering common financial overview questions.

## Full financial snapshot

1. Call `get_net_worth_summary`
2. Call `get_budget_overview`
3. Call `get_liabilities` with `unpaidOnly: true`
4. Summarise: net position, disposable income, outstanding debts

## Single account lookup

- ISA/pension/savings → `get_assets` with `account` filter
- Credit card/loan → `get_liabilities` with `account` filter
- Bill/subscription → `get_overheads` with `name` filter

## Monthly overhead breakdown

1. Call `get_overheads`
2. Group by type (EXPENSE vs LIABILITY)
3. Report total and top 5 largest items

## Debt overview

1. Call `get_liabilities` with `unpaidOnly: true`
2. Call `get_debt_schedule` for payoff dates
3. Sort by balance descending

## Am I on track for £1M?

1. Call `get_net_worth_summary` and `get_budget_overview`
2. Calculate years at current savings rate (rough projection)
3. Note this is illustrative, not a guarantee
