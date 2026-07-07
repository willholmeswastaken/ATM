import { defineEval } from "eve/evals";
import { PROMPTS } from "../helpers.js";

export default defineEval({
  description: "Debt advice pulls liabilities and net worth before responding.",
  async test(t) {
    await t.send(PROMPTS.debtAdvice);
    t.succeeded();
    t.calledTool("get_liabilities", { input: { unpaidOnly: true } });
    t.calledTool("get_net_worth_summary");
  },
});
