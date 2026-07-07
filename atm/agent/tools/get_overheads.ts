import { defineTool } from "eve/tools";
import { z } from "zod";
import { formatGBP, parseMoney } from "#lib/finance.js";
import { listRows } from "#lib/table-crud.js";

export default defineTool({
  description:
    "List recurring monthly overheads/bills from the income statement.",
  inputSchema: z.object({
    name: z.string().optional().describe("Optional filter by bill name"),
  }),
  async execute({ name }) {
    let rows = await listRows("overheads");
    if (name) {
      const q = name.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q));
    }

    const items = rows.map((r) => ({
      name: r.name,
      expense: parseMoney(r.data.expense),
      type: String(r.data.type ?? ""),
      formatted: formatGBP(parseMoney(r.data.expense)),
    }));

    const total = items.reduce((sum, i) => sum + i.expense, 0);

    return {
      overheads: items,
      totalOverheads: total,
      formattedTotal: formatGBP(total),
      count: items.length,
    };
  },
});
