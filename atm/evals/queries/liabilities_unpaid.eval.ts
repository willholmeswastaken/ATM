import { defineEval } from "eve/evals";
import { PROMPTS } from "../helpers.js";

export default defineEval({
  description: "Agent calls get_liabilities with unpaidOnly for outstanding debts.",
  async test(t) {
    await t.send(PROMPTS.unpaidDebts);
    t.succeeded();
    t.calledTool("get_liabilities", {
      input: { unpaidOnly: true },
    });
  },
});
