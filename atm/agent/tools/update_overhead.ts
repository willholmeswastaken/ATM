import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { findRow, updateRow } from "#lib/table-crud.js";

export default defineTool({
  description: "Update an existing overhead/bill amount or type.",
  inputSchema: z.object({
    name: z.string().min(1),
    expense: z.number().optional(),
    type: z.enum(["EXPENSE", "LIABILITY"]).optional(),
    newName: z.string().optional(),
  }),
  approval: always(),
  async execute({ name, expense, type, newName }) {
    const { row, ambiguous } = await findRow("overheads", name);
    if (ambiguous.length > 1) {
      return { error: `Ambiguous bill. Matches: ${ambiguous.join(", ")}` };
    }
    if (!row) return { error: `Overhead not found: ${name}` };

    const patch: Record<string, string | number> = {};
    if (expense !== undefined) patch.expense = expense;
    if (type !== undefined) patch.type = type;
    if (newName) patch.name = newName;

    const updated = await updateRow("overheads", row.name, patch);
    return { name: updated.name, before: row.data, after: updated.data };
  },
});
