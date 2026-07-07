import { google, type sheets_v4 } from "googleapis";
import {
  BALANCE_SHEET_TAB,
  BUDGET_CELLS,
  DEBT_SCHEDULE_TAB,
  METRIC_CELLS,
  SUMMARY_CELLS,
  TABLES,
  type TableSection,
} from "./sheet-map.js";

type CellValue = string | number | boolean | null | undefined;

function useMock(): boolean {
  return (
    process.env.SHEETS_MOCK === "true" ||
    !process.env.SPREADSHEET_ID ||
    !process.env.GOOGLE_CLIENT_EMAIL ||
    !process.env.GOOGLE_PRIVATE_KEY
  );
}

function privateKey(): string {
  return (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
}

let sheetsClient: sheets_v4.Sheets | null = null;

function getClient(): sheets_v4.Sheets {
  if (sheetsClient) return sheetsClient;
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey(),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

function spreadsheetId(): string {
  const id = process.env.SPREADSHEET_ID;
  if (!id) throw new Error("SPREADSHEET_ID is not configured");
  return id;
}

/** In-memory mock matching the user's Balance Sheet layout */
const mockStore: Record<string, CellValue[][]> = {
  [BALANCE_SHEET_TAB]: createMockBalanceSheet(),
  [DEBT_SCHEDULE_TAB]: [
    ["Account", "Balance", "Rate", "Min Payment", "Payoff Date"],
    ["Example Balance Transfer", "1800.00", "0%", "100", "2027-01-01"],
    ["Sample Card A", "2500.00", "18.9%", "250", "2027-06-01"],
  ],
};

/** Entirely fictional placeholder data for local dev/evals — not based on any real person. */
function createMockBalanceSheet(): CellValue[][] {
  const rows: CellValue[][] = Array.from({ length: 50 }, () =>
    Array.from({ length: 12 }, () => ""),
  );

  rows[3] = ["", "67500.00", "", "", "0", "", "", "", "4300.00"];
  rows[9] = ["Income Statement", "Expense", "Type", "", "Account", "Type", "Current Balance", "To Pay", "Status", "Limit"];

  const overheads: CellValue[][] = [
    ["Example Rent", "950.00", "LIABILITY"],
    ["Example Loan Payment", "200.00", "LIABILITY"],
    ["Example Utilities", "120.00", "EXPENSE"],
    ["Example Gym", "25.00", "EXPENSE"],
    ["Example Streaming", "14.99", "EXPENSE"],
    ["Example Cloud Storage", "2.99", "EXPENSE"],
  ];
  overheads.forEach((row, i) => {
    rows[10 + i] = [...row, "", "", "", "", "", "", "", "", "", "", ""];
  });
  rows[28] = ["Total Overheads", "1312.98", "", "", "Sample Card A", "Spending", "2500.00", "250", "UNPAID", "5000"];

  rows[30] = ["", "", "", "", "", "Days till next payday", "14"];
  rows[31] = ["Salary", "4000.00", "", "", "", "Budget per day", "50.00"];
  rows[32] = ["Bills", "1312.98"];
  rows[33] = ["Savings", "1000.00", "", "", "", "Expected left today", "800.00"];
  rows[34] = ["Disposable", "800.00", "", "", "", "Cash Available To Pay This Month", "800.00"];
  rows[36] = ["Account", "Funds", "Type"];
  rows[40] = ["", "", "", "", "", "", "", "", "", "Actual Spent", "", "2100.00"];

  const assets: CellValue[][] = [
    ["Example Workplace Pension", "42000.00", "Retirement"],
    ["Demo LISA", "15000.00", "Long Cash"],
    ["Sample Broker SIPP", "5000.00", "Retirement"],
    ["Sample Broker ISA", "8000.00", "Investments"],
    ["Test Emergency Fund", "2500.00", "Short Cash"],
  ];
  assets.forEach((row, i) => {
    rows[37 + i] = [...row, "", "", "", "", "", "", "", "", ""];
  });
  rows[47] = ["Total Assets", "67500.00"];

  const liabilities: CellValue[][] = [
    ["Sample Card A", "Spending", "2500.00", "250", "UNPAID", "5000"],
    ["Sample Card B", "Spending", "0", "0", "PAID", "3000"],
    ["Example Balance Transfer", "0% Balance Transfer", "1800.00", "100", "UNPAID", "6000"],
    ["Unused Credit Line", "Not Used", "0", "0", "PAID", "2000"],
  ];
  liabilities.forEach((row, i) => {
    const target = rows[11 + i]!;
    target[4] = row[0];
    target[5] = row[1];
    target[6] = row[2];
    target[7] = row[3];
    target[8] = row[4];
    target[9] = row[5];
  });

  return rows;
}

function columnLettersToIndex(letters: string): number {
  let col = 0;
  for (const ch of letters) {
    col = col * 26 + (ch.charCodeAt(0) - 64);
  }
  return col - 1;
}

function parseCellRef(ref: string): { col: number; row: number | null } {
  const match = /^([A-Z]+)(\d+)?$/.exec(ref);
  if (!match) throw new Error(`Invalid cell reference: ${ref}`);
  return {
    col: columnLettersToIndex(match[1]!),
    row: match[2] ? Number.parseInt(match[2], 10) - 1 : null,
  };
}

function parseRange(range: string): {
  tab: string;
  startCol: number;
  startRow: number;
  endCol: number;
  endRow: number;
} {
  const bang = range.lastIndexOf("!");
  const tab =
    bang >= 0
      ? range.slice(0, bang).replace(/^'|'$/g, "")
      : BALANCE_SHEET_TAB;
  const cellPart = bang >= 0 ? range.slice(bang + 1) : range;
  const [startRef, endRef = startRef] = cellPart.split(":");

  const start = parseCellRef(startRef!);
  const end = parseCellRef(endRef!);

  return {
    tab,
    startCol: start.col,
    startRow: start.row ?? 0,
    endCol: end.col,
    endRow: end.row ?? 999,
  };
}

function parseA1(a1: string): { tab: string; col: number; row: number } {
  const parsed = parseRange(a1);
  if (parsed.endRow === 999 && !a1.match(/\d/)) {
    throw new Error(`Invalid A1 notation: ${a1}`);
  }
  return { tab: parsed.tab, col: parsed.startCol, row: parsed.startRow };
}

function mockGetRange(range: string): CellValue[][] {
  const { tab, startCol, startRow, endCol, endRow } = parseRange(range);
  const sheet = mockStore[tab] ?? [];
  const result: CellValue[][] = [];
  const lastRow = Math.min(endRow, sheet.length - 1);

  for (let r = startRow; r <= lastRow; r++) {
    const line: CellValue[] = [];
    for (let c = startCol; c <= endCol; c++) {
      line.push(sheet[r]?.[c] ?? "");
    }
    if (line.some((cell) => cell !== "")) {
      result.push(line);
    } else if (r === startRow) {
      result.push(line);
    }
  }
  return result;
}

function mockSetCell(a1: string, value: CellValue): void {
  const { tab, col, row } = parseA1(a1);
  if (!mockStore[tab]) mockStore[tab] = [];
  if (!mockStore[tab]![row]) mockStore[tab]![row] = [];
  mockStore[tab]![row]![col] = value;
}

export async function getRange(range: string): Promise<CellValue[][]> {
  if (useMock()) return mockGetRange(range);
  const res = await getClient().spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range,
  });
  return (res.data.values ?? []) as CellValue[][];
}

export async function batchGet(ranges: string[]): Promise<CellValue[][][]> {
  if (useMock()) return Promise.all(ranges.map((r) => mockGetRange(r)));
  const res = await getClient().spreadsheets.values.batchGet({
    spreadsheetId: spreadsheetId(),
    ranges,
  });
  return (res.data.valueRanges ?? []).map((vr) => (vr.values ?? []) as CellValue[][]);
}

export async function getCell(a1: string): Promise<CellValue> {
  const values = await getRange(a1);
  return values[0]?.[0] ?? "";
}

export async function updateCell(a1: string, value: CellValue): Promise<void> {
  if (useMock()) {
    mockSetCell(a1, value);
    return;
  }
  await getClient().spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range: a1,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[value ?? ""]] },
  });
}

export async function updateRange(
  range: string,
  values: CellValue[][],
): Promise<void> {
  if (useMock()) {
    const start = parseA1(range.split(":")[0]!);
    values.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        const colLetter = String.fromCharCode(65 + start.col + ci);
        mockSetCell(`${start.tab}!${colLetter}${start.row + ri + 1}`, cell);
      });
    });
    return;
  }
  await getClient().spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

export async function listSheetTabs(): Promise<string[]> {
  if (useMock()) return Object.keys(mockStore);
  const res = await getClient().spreadsheets.get({
    spreadsheetId: spreadsheetId(),
  });
  return (res.data.sheets ?? [])
    .map((s) => s.properties?.title)
    .filter((t): t is string => Boolean(t));
}

export async function insertRow(
  tab: string,
  rowIndex: number,
  values: CellValue[],
): Promise<void> {
  if (useMock()) {
    const sheet = mockStore[tab] ?? [];
    sheet.splice(rowIndex, 0, values);
    mockStore[tab] = sheet;
    return;
  }
  const sheetMeta = await getClient().spreadsheets.get({
    spreadsheetId: spreadsheetId(),
  });
  const sheet = sheetMeta.data.sheets?.find((s) => s.properties?.title === tab);
  const sheetId = sheet?.properties?.sheetId;
  if (sheetId === undefined) throw new Error(`Sheet not found: ${tab}`);

  await getClient().spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId(),
    requestBody: {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });

  const colEnd = String.fromCharCode(64 + values.length);
  await updateRange(`${tab}!A${rowIndex + 1}:${colEnd}${rowIndex + 1}`, [values]);
}

export async function deleteRow(tab: string, rowIndex: number): Promise<void> {
  if (useMock()) {
    const sheet = mockStore[tab] ?? [];
    sheet.splice(rowIndex, 1);
    mockStore[tab] = sheet;
    return;
  }
  const sheetMeta = await getClient().spreadsheets.get({
    spreadsheetId: spreadsheetId(),
  });
  const sheet = sheetMeta.data.sheets?.find((s) => s.properties?.title === tab);
  const sheetId = sheet?.properties?.sheetId;
  if (sheetId === undefined) throw new Error(`Sheet not found: ${tab}`);

  await getClient().spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId(),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });
}

export async function readTable(section: TableSection): Promise<CellValue[][]> {
  const table = TABLES[section];
  return getRange(table.range);
}

export async function readSummaryAndBudget() {
  const ranges = [
    ...Object.values(SUMMARY_CELLS),
    ...Object.values(BUDGET_CELLS),
    ...Object.values(METRIC_CELLS),
  ];
  const values = await batchGet(ranges);
  const map: Record<string, CellValue> = {};
  ranges.forEach((key, i) => {
    const name = key.split("!")[1] ?? key;
    map[name] = values[i]?.[0]?.[0] ?? "";
  });
  return map;
}

export { SUMMARY_CELLS, BUDGET_CELLS, METRIC_CELLS, TABLES, DEBT_SCHEDULE_TAB };
