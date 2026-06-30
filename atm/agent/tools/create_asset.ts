import { defineTool } from "eve/tools";
import { once } from "eve/tools/approval";
import { z } from "zod";
import { createRow } from "#lib/table-crud.js";

export default defineTool({
  description: "Create a new asset/savings account row in the Balance Sheet.",
  inputSchema: z.object({
    account: z.string().min(1),
    funds: z.number(),
    type: z.enum(["Retirement", "Long Cash", "Investments", "Short Cash", "Other"]),
  }),
  approval: once(),
  async execute({ account, funds, type }) {
    const row = await createRow("assets", {
      account,
      funds,
      type: type === "Other" ? "Investments" : type,
    });
    return { created: row.name, data: row.data };
  },
});
