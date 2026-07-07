export const BALANCE_SHEET_TAB = "Balance Sheet";
export const DEBT_SCHEDULE_TAB = "Debt Schedule";

/** Quote tab names for Google Sheets A1 notation (required when names contain spaces). */
export function quoteSheetTab(tab: string): string {
  return `'${tab.replace(/'/g, "''")}'`;
}

const BS = quoteSheetTab(BALANCE_SHEET_TAB);

/** Summary KPI cells on Balance Sheet */
export const SUMMARY_CELLS = {
  totalSavings: `${BS}!B4`,
  totalSpentThisMonth: `${BS}!E4`,
  totalBadDebt: `${BS}!I4`,
} as const;

/** Budget block cells */
export const BUDGET_CELLS = {
  salary: `${BS}!B32`,
  bills: `${BS}!B33`,
  savings: `${BS}!B34`,
  disposable: `${BS}!B35`,
} as const;

/** Daily metrics cells */
export const METRIC_CELLS = {
  daysTillPayday: `${BS}!G31`,
  budgetPerDay: `${BS}!G32`,
  expectedLeftToday: `${BS}!G34`,
  cashAvailable: `${BS}!G35`,
  actualSpent: `${BS}!L41`,
  actualBillsSpent: `${BS}!L42`,
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
    range: `${BS}!A11:C29`,
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
    range: `${BS}!E11:J26`,
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
    range: `${BS}!A38:C48`,
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
