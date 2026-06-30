import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { removeRow } from "#lib/table-crud.js";

export default defineTool({
  description: "Delete an asset/savings account row from the Balance Sheet.",
  inputSchema: z.object({
    account: z.string().min(1),
  }),
  approval: always(),
  async execute({ account }) {
    const result = await removeRow("assets", account);
    return result;
  },
});
