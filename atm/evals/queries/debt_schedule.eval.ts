import { defineEval } from "eve/evals";
import { PROMPTS } from "../helpers.js";

export default defineEval({
  description: "Agent calls get_debt_schedule for payoff date questions.",
  async test(t) {
    await t.send(PROMPTS.debtSchedule);
    t.succeeded();
    t.calledTool("get_debt_schedule");
  },
});
