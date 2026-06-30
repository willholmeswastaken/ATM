import { defineTool } from "eve/tools";
import { once } from "eve/tools/approval";
import { z } from "zod";
import { createRow } from "#lib/table-crud.js";

export default defineTool({
  description: "Create a new recurring overhead/bill in the income statement.",
  inputSchema: z.object({
    name: z.string().min(1),
    expense: z.number(),
    type: z.enum(["EXPENSE", "LIABILITY"]).default("EXPENSE"),
  }),
  approval: once(),
  async execute({ name, expense, type }) {
    const row = await createRow("overheads", { name, expense, type });
    return { created: row.name, data: row.data };
  },
});
