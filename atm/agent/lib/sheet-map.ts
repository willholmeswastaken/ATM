export const BALANCE_SHEET_TAB = "Balance Sheet";
export const DEBT_SCHEDULE_TAB = "Debt Schedule";

/** Summary KPI cells on Balance Sheet */
export const SUMMARY_CELLS = {
  totalSavings: `${BALANCE_SHEET_TAB}!B4`,
  totalSpentThisMonth: `${BALANCE_SHEET_TAB}!E4`,
  totalBadDebt: `${BALANCE_SHEET_TAB}!I4`,
} as const;

/** Budget block cells */
export const BUDGET_CELLS = {
  salary: `${BALANCE_SHEET_TAB}!B32`,
  bills: `${BALANCE_SHEET_TAB}!B33`,
  savings: `${BALANCE_SHEET_TAB}!B34`,
  disposable: `${BALANCE_SHEET_TAB}!B35`,
} as const;

/** Daily metrics cells */
export const METRIC_CELLS = {
  daysTillPayday: `${BALANCE_SHEET_TAB}!G30`,
  budgetPerDay: `${BALANCE_SHEET_TAB}!G31`,
  expectedLeftToday: `${BALANCE_SHEET_TAB}!G33`,
  cashAvailable: `${BALANCE_SHEET_TAB}!G35`,
  actualSpent: `${BALANCE_SHEET_TAB}!I41`,
  actualBillsSpent: `${BALANCE_SHEET_TAB}!I42`,
} as const;

export type TableSection = "assets" | "liabilities" | "overheads";

export interface TableDef {
  section: TableSection;
  tab: string;
  range: string;
  headerRow: number;
  firstDataRow: number;
  lastDataRow: number;
  totalRow?: number;
  keyColumn: number;
  columns: Record<string, number>;
}

export const TABLES: Record<TableSection, TableDef> = {
  overheads: {
    section: "overheads",
    tab: BALANCE_SHEET_TAB,
    range: `${BALANCE_SHEET_TAB}!A11:C29`,
    headerRow: 10,
    firstDataRow: 11,
    lastDataRow: 28,
    totalRow: 29,
    keyColumn: 0,
    columns: { name: 0, expense: 1, type: 2 },
  },
  liabilities: {
    section: "liabilities",
    tab: BALANCE_SHEET_TAB,
    range: `${BALANCE_SHEET_TAB}!E11:J26`,
    headerRow: 10,
    firstDataRow: 11,
    lastDataRow: 25,
    keyColumn: 0,
    columns: {
      account: 0,
      type: 1,
      currentBalance: 2,
      toPay: 3,
      status: 4,
      limit: 5,
    },
  },
  assets: {
    section: "assets",
    tab: BALANCE_SHEET_TAB,
    range: `${BALANCE_SHEET_TAB}!A38:C48`,
    headerRow: 37,
    firstDataRow: 38,
    lastDataRow: 47,
    totalRow: 48,
    keyColumn: 0,
    columns: { account: 0, funds: 1, type: 2 },
  },
};

export const PROTECTED_ROW_LABELS = [
  "total overheads",
  "total income left",
  "total assets",
  "total",
  "salary",
  "bills",
  "savings",
  "disposable",
];

export function isProtectedRow(name: string): boolean {
  const lower = name.trim().toLowerCase();
  return PROTECTED_ROW_LABELS.some((label) => lower.includes(label));
}
