import { defineTool } from "eve/tools";
import { z } from "zod";
import { formatGBP, parseMoney } from "#lib/finance.js";
import { listRows } from "#lib/table-crud.js";

export default defineTool({
  description:
    "List all liabilities/debts including credit cards with balances, limits, and status.",
  inputSchema: z.object({
    account: z.string().optional().describe("Optional filter by account name"),
    unpaidOnly: z
      .boolean()
      .optional()
      .describe("Only return accounts that are not PAID or have a balance"),
  }),
  async execute({ account, unpaidOnly }) {
    let rows = await listRows("liabilities");
    if (account) {
      const q = account.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q));
    }

    let items = rows.map((r) => ({
      account: r.name,
      type: String(r.data.type ?? ""),
      currentBalance: parseMoney(r.data.currentBalance),
      toPay: parseMoney(r.data.toPay),
      status: String(r.data.status ?? ""),
      limit: parseMoney(r.data.limit),
      formatted: {
        currentBalance: formatGBP(parseMoney(r.data.currentBalance)),
        limit: formatGBP(parseMoney(r.data.limit)),
      },
    }));

    if (unpaidOnly) {
      items = items.filter(
        (i) =>
          i.currentBalance > 0 ||
          i.status.toUpperCase() !== "PAID",
      );
    }

    const totalDebt = items.reduce((sum, i) => sum + i.currentBalance, 0);

    return {
      liabilities: items,
      totalDebt,
      formattedTotal: formatGBP(totalDebt),
      count: items.length,
    };
  },
});
