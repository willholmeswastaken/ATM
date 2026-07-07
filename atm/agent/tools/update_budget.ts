import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { getCell, updateCell, BUDGET_CELLS } from "#lib/google-sheets.js";

const BUDGET_FIELDS = {
  salary: BUDGET_CELLS.salary,
  bills: BUDGET_CELLS.bills,
  savings: BUDGET_CELLS.savings,
  disposable: BUDGET_CELLS.disposable,
} as const;

export default defineTool({
  description:
    "Update a budget target cell: salary, bills, savings, or disposable income.",
  inputSchema: z.object({
    field: z.enum(["salary", "bills", "savings", "disposable"]),
    value: z.number(),
  }),
  approval: always(),
  async execute({ field, value }) {
    const cell = BUDGET_FIELDS[field];
    const before = await getCell(cell);
    await updateCell(cell, value);
    return { field, before, after: value };
  },
});
