import { defineEval } from "eve/evals";
import { PROMPTS } from "../helpers.js";

export default defineEval({
  description: "Agent calls list_sheet_tabs for spreadsheet discovery.",
  async test(t) {
    await t.send(PROMPTS.listTabs);
    t.succeeded();
    t.calledTool("list_sheet_tabs");
  },
});
