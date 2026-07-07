import { defineEval } from "eve/evals";
import { PROMPTS } from "../helpers.js";

export default defineEval({
  description: "Agent fetches budget and net worth before savings advice.",
  async test(t) {
    await t.send(PROMPTS.savingsAdvice);
    t.succeeded();
    t.calledTool("get_budget_overview");
    t.calledTool("get_net_worth_summary");
    t.calledTool("get_assets");
  },
});
