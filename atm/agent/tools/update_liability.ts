import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { findRow, updateRow } from "#lib/table-crud.js";

export default defineTool({
  description:
    "Update an existing liability/debt (balance, status, limit, etc.).",
  inputSchema: z.object({
    account: z.string().min(1),
    type: z.string().optional(),
    currentBalance: z.number().optional(),
    toPay: z.number().optional(),
    status: z.string().optional().describe('e.g. "PAID" or "UNPAID"'),
    limit: z.number().optional(),
    newAccountName: z.string().optional(),
  }),
  approval: always(),
  async execute({ account, ...updates }) {
    const { row, ambiguous } = await findRow("liabilities", account);
    if (ambiguous.length > 1) {
      return { error: `Ambiguous account. Matches: ${ambiguous.join(", ")}` };
    }
    if (!row) return { error: `Liability not found: ${account}` };

    const patch: Record<string, string | number> = {};
    if (updates.type !== undefined) patch.type = updates.type;
    if (updates.currentBalance !== undefined)
      patch.currentBalance = updates.currentBalance;
    if (updates.toPay !== undefined) patch.toPay = updates.toPay;
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.limit !== undefined) patch.limit = updates.limit;
    if (updates.newAccountName) patch.account = updates.newAccountName;

    const updated = await updateRow("liabilities", row.name, patch);
    return {
      account: updated.name,
      before: row.data,
      after: updated.data,
    };
  },
});
