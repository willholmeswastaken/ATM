import { defineEval } from "eve/evals";
import { PROMPTS } from "../helpers.js";

export default defineEval({
  description: "Agent calls get_budget_overview for disposable income questions.",
  async test(t) {
    await t.send(PROMPTS.disposable);
    t.succeeded();
    t.calledTool("get_budget_overview");
  },
});
