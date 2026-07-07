import { fuzzyMatchName } from "./finance.js";
import {
  DEBT_SCHEDULE_TAB,
  getRange,
  parseRange,
  columnIndexToLetter,
  readTable,
  updateRange,
} from "./google-sheets.js";
import {
  isProtectedRow,
  quoteSheetTab,
  TABLES,
  type TableDef,
  type TableSection,
} from "./sheet-map.js";

export type RowData = Record<string, string | number>;

export interface TableRow {
  /** 1-based sheet row number (matches A1 notation). */
  rowIndex: number;
  name: string;
  data: RowData;
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

function tableRowValues(
  table: TableDef,
  data: RowData,
): (string | number)[] {
  const { startCol, endCol } = parseRange(table.range);
  const width = endCol - startCol + 1;
  const values: (string | number)[] = Array.from({ length: width }, () => "");
  for (const [field, colIdx] of Object.entries(table.columns)) {
    if (data[field] !== undefined) values[colIdx] = data[field] as string | number;
  }
  return values;
}

function buildTableRowRange(table: TableDef, sheetRow: number): string {
  const { startCol, endCol } = parseRange(table.range);
  const startColLetter = columnIndexToLetter(startCol);
  const endColLetter = columnIndexToLetter(endCol);
  return `${quoteSheetTab(table.tab)}!${startColLetter}${sheetRow}:${endColLetter}${sheetRow}`;
}

async function writeTableRow(
  table: TableDef,
  sheetRow: number,
  data: RowData,
): Promise<void> {
  await updateRange(buildTableRowRange(table, sheetRow), [tableRowValues(table, data)]);
}

async function clearTableRow(table: TableDef, sheetRow: number): Promise<void> {
  const { startCol, endCol } = parseRange(table.range);
  const width = endCol - startCol + 1;
  await updateRange(buildTableRowRange(table, sheetRow), [
    Array.from({ length: width }, () => ""),
  ]);
}

async function findNextEmptySheetRow(table: TableDef): Promise<number> {
  const values = await readTable(table.section);
  const rowCount = table.lastDataRow - table.firstDataRow + 1;

  for (let offset = 0; offset < rowCount; offset++) {
    const sheetRow = table.firstDataRow + offset;
    const row = (values[offset] ?? []) as (string | number)[];
    const name = getNameFromRow(table, row);
    if (!name) return sheetRow;
  }

  throw new Error(`No empty rows available in ${table.section} table`);
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
  const sheetRow = await findNextEmptySheetRow(table);
  const rowData = tableRowValues(table, data);
  const name = getNameFromRow(table, rowData);

  if (!name) throw new Error("Row name is required");
  if (isProtectedRow(name)) throw new Error(`Cannot create protected row: ${name}`);

  await writeTableRow(table, sheetRow, data);

  return {
    rowIndex: sheetRow,
    name,
    data: rowToObject(table, rowData),
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

  await writeTableRow(table, row.rowIndex, merged);

  const rowValues = tableRowValues(table, merged);
  const updatedName = getNameFromRow(table, rowValues);
  if (isProtectedRow(updatedName)) {
    throw new Error(`Cannot rename row to protected label: ${updatedName}`);
  }

  return {
    rowIndex: row.rowIndex,
    name: updatedName,
    data: merged,
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
  await clearTableRow(table, row.rowIndex);
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
