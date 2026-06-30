import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { findRow, updateRow } from "#lib/table-crud.js";

export default defineTool({
  description: "Update an existing asset/savings account (balance, type, or name).",
  inputSchema: z.object({
    account: z.string().min(1).describe("Current account name to find"),
    funds: z.number().optional(),
    type: z.string().optional(),
    newAccountName: z.string().optional().describe("Rename the account"),
  }),
  approval: always(),
  async execute({ account, funds, type, newAccountName }) {
    const { row, ambiguous } = await findRow("assets", account);
    if (ambiguous.length > 1) {
      return { error: `Ambiguous account. Matches: ${ambiguous.join(", ")}` };
    }
    if (!row) return { error: `Asset not found: ${account}` };

    const updates: Record<string, string | number> = {};
    if (funds !== undefined) updates.funds = funds;
    if (type !== undefined) updates.type = type;
    if (newAccountName) updates.account = newAccountName;

    const updated = await updateRow("assets", row.name, updates);
    return {
      account: updated.name,
      before: row.data,
      after: updated.data,
    };
  },
});
