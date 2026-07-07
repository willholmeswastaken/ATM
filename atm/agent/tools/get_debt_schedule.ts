import { defineTool } from "eve/tools";
import { z } from "zod";
import { readDebtSchedule } from "#lib/table-crud.js";

export default defineTool({
  description: "Read the Debt Schedule tab with payoff tracking per account.",
  inputSchema: z.object({
    account: z.string().optional().describe("Optional filter by account name"),
  }),
  async execute({ account }) {
    let entries = await readDebtSchedule();
    if (account) {
      const q = account.toLowerCase();
      entries = entries.filter((e) =>
        String(e.account ?? "").toLowerCase().includes(q),
      );
    }
    return { entries, count: entries.length };
  },
});
