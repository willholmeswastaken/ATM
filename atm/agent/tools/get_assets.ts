import { defineTool } from "eve/tools";
import { z } from "zod";
import { formatGBP, parseMoney } from "#lib/finance.js";
import { listRows } from "#lib/table-crud.js";

export default defineTool({
  description: "List all asset/savings accounts with balances and types.",
  inputSchema: z.object({
    account: z
      .string()
      .optional()
      .describe("Optional filter by account name (partial match)"),
  }),
  async execute({ account }) {
    let rows = await listRows("assets");
    if (account) {
      const q = account.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q));
    }

    const items = rows.map((r) => ({
      account: r.name,
      funds: parseMoney(r.data.funds),
      type: String(r.data.type ?? ""),
      formatted: formatGBP(parseMoney(r.data.funds)),
    }));

    const total = items.reduce((sum, i) => sum + i.funds, 0);

    return {
      assets: items,
      total,
      formattedTotal: formatGBP(total),
      count: items.length,
    };
  },
});
