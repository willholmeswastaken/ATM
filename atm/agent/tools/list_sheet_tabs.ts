import { defineTool } from "eve/tools";
import { z } from "zod";
import { listSheetTabs } from "#lib/google-sheets.js";

export default defineTool({
  description: "List all tabs in the finance spreadsheet.",
  inputSchema: z.object({}),
  async execute() {
    const tabs = await listSheetTabs();
    return { tabs, count: tabs.length };
  },
});
