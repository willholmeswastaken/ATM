import { defineTool } from "eve/tools";
import { once } from "eve/tools/approval";
import { z } from "zod";
import { createRow } from "#lib/table-crud.js";

export default defineTool({
  description: "Create a new liability/debt row (credit card, loan, etc.).",
  inputSchema: z.object({
    account: z.string().min(1),
    type: z.string().default("Spending"),
    currentBalance: z.number().default(0),
    toPay: z.number().default(0),
    status: z.string().default("UNPAID"),
    limit: z.number().default(0),
  }),
  approval: once(),
  async execute(input) {
    const row = await createRow("liabilities", {
      account: input.account,
      type: input.type,
      currentBalance: input.currentBalance,
      toPay: input.toPay,
      status: input.status,
      limit: input.limit,
    });
    return { created: row.name, data: row.data };
  },
});
