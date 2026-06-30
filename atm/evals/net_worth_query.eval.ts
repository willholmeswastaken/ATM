import { defineEval } from "eve/evals";

export default defineEval({
  description: "Agent calls get_net_worth_summary for net worth questions.",
  async test(t) {
    await t.send("What is my net worth?");
    t.succeeded();
    t.calledTool("get_net_worth_summary");
  },
});
