import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { removeRow } from "#lib/table-crud.js";

export default defineTool({
  description: "Delete a recurring overhead/bill from the income statement.",
  inputSchema: z.object({
    name: z.string().min(1),
  }),
  approval: always(),
  async execute({ name }) {
    return removeRow("overheads", name);
  },
});
