import { defineEval } from "eve/evals";

export default defineEval({
  description: "Agent fetches data before giving savings advice.",
  async test(t) {
    await t.send("Am I saving enough? Give me advice based on my actual numbers.");
    t.succeeded();
    t.calledTool("get_budget_overview");
    t.calledTool("get_net_worth_summary");
  },
});
