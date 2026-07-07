import { fuzzyMatchName } from "./finance.js";
import {
  deleteRow,
  DEBT_SCHEDULE_TAB,
  getRange,
  insertRow,
  readTable,
  updateRange,
} from "./google-sheets.js";
import {
  isProtectedRow,
  TABLES,
  type TableDef,
  type TableSection,
} from "./sheet-map.js";

export type RowData = Record<string, string | number>;

export interface TableRow {
  rowIndex: number;
  name: string;
  data: RowData;
}

function colIndexToLetter(index: number): string {
  let n = index + 1;
  let result = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

function rowToObject(table: TableDef, row: (string | number)[]): RowData {
  const data: RowData = {};
  for (const [field, colIdx] of Object.entries(table.columns)) {
    data[field] = row[colIdx] ?? "";
  }
  return data;
}

function getNameFromRow(table: TableDef, row: (string | number)[]): string {
  const key = table.keyColumn;
  return String(row[key] ?? "").trim();
}

export async function listRows(section: TableSection): Promise<TableRow[]> {
  const table = TABLES[section];
  const values = await readTable(section);
  const rows: TableRow[] = [];

  values.forEach((row, offset) => {
    const rowIndex = table.firstDataRow + offset;
    if (rowIndex > table.lastDataRow) return;
    const name = getNameFromRow(table, row as (string | number)[]);
    if (!name || isProtectedRow(name)) return;
    rows.push({
      rowIndex,
      name,
      data: rowToObject(table, row as (string | number)[]),
    });
  });

  return rows;
}

export async function findRow(
  section: TableSection,
  name: string,
): Promise<{ row: TableRow | null; ambiguous: string[] }> {
  const rows = await listRows(section);
  const names = rows.map((r) => r.name);
  const { match, candidates } = fuzzyMatchName(name, names);
  if (!match) return { row: null, ambiguous: candidates };
  const row = rows.find((r) => r.name === match) ?? null;
  return { row, ambiguous: [] };
}

export async function createRow(
  section: TableSection,
  data: RowData,
): Promise<TableRow> {
  const table = TABLES[section];
  const rows = await listRows(section);
  const insertAt = table.lastDataRow - table.firstDataRow - rows.length >= 0
    ? table.firstDataRow + rows.length
    : table.lastDataRow;

  const values: (string | number)[] = [];
  const maxCol = Math.max(...Object.values(table.columns));
  for (let c = 0; c <= maxCol; c++) values.push("");

  for (const [field, colIdx] of Object.entries(table.columns)) {
    if (data[field] !== undefined) values[colIdx] = data[field] as string | number;
  }

  const name = getNameFromRow(table, values);
  if (!name) throw new Error("Row name is required");
  if (isProtectedRow(name)) throw new Error(`Cannot create protected row: ${name}`);

  await insertRow(table.tab, insertAt, values);

  return {
    rowIndex: insertAt,
    name,
    data: rowToObject(table, values),
  };
}

export async function updateRow(
  section: TableSection,
  name: string,
  updates: RowData,
): Promise<TableRow> {
  const { row, ambiguous } = await findRow(section, name);
  if (ambiguous.length > 1) {
    throw new Error(
      `Multiple matches for "${name}": ${ambiguous.join(", ")}. Please be more specific.`,
    );
  }
  if (!row) throw new Error(`No ${section} row found matching "${name}"`);

  const table = TABLES[section];
  const merged = { ...row.data, ...updates };

  const values: (string | number)[] = [];
  const maxCol = Math.max(...Object.values(table.columns));
  for (let c = 0; c <= maxCol; c++) values.push("");

  for (const [field, colIdx] of Object.entries(table.columns)) {
    values[colIdx] = merged[field] ?? "";
  }

  const startCol = colIndexToLetter(0);
  const endCol = colIndexToLetter(maxCol);
  const range = `${table.tab}!${startCol}${row.rowIndex + 1}:${endCol}${row.rowIndex + 1}`;
  await updateRange(range, [values]);

  return {
    rowIndex: row.rowIndex,
    name: row.name,
    data: rowToObject(table, values),
  };
}

export async function removeRow(
  section: TableSection,
  name: string,
): Promise<{ deleted: string }> {
  const { row, ambiguous } = await findRow(section, name);
  if (ambiguous.length > 1) {
    throw new Error(
      `Multiple matches for "${name}": ${ambiguous.join(", ")}. Please be more specific.`,
    );
  }
  if (!row) throw new Error(`No ${section} row found matching "${name}"`);
  if (isProtectedRow(row.name)) {
    throw new Error(`Cannot delete protected row: ${row.name}`);
  }

  const table = TABLES[section];
  await deleteRow(table.tab, row.rowIndex);
  return { deleted: row.name };
}

export async function readDebtSchedule(): Promise<RowData[]> {
  const values = await getRange(`'${DEBT_SCHEDULE_TAB}'!A1:E50`);
  if (values.length <= 1) return [];
  const headers = values[0]!.map((h) => String(h).toLowerCase().replace(/\s+/g, ""));
  return values.slice(1).map((row) => {
    const obj: RowData = {};
    headers.forEach((h, i) => {
      const val = row[i];
      obj[h] =
        typeof val === "boolean" ? String(val) : (val ?? "");
    });
    return obj;
  });
}
