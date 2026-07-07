import { defineEval } from "eve/evals";
import { PROMPTS } from "../helpers.js";

export default defineEval({
  description: "Agent calls get_net_worth_summary for net worth questions.",
  async test(t) {
    await t.send(PROMPTS.netWorth);
    t.succeeded();
    t.calledTool("get_net_worth_summary");
  },
});
