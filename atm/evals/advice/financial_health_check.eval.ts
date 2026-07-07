import { defineEval } from "eve/evals";
import { PROMPTS } from "../helpers.js";

export default defineEval({
  description: "Financial health check pulls net worth, budget, and overheads.",
  async test(t) {
    await t.send(PROMPTS.healthCheck);
    t.succeeded();
    t.calledTool("get_net_worth_summary");
    t.calledTool("get_budget_overview");
    t.calledTool("get_overheads");
  },
});
