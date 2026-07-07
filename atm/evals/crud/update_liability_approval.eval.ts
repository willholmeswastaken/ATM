import { defineEval } from "eve/evals";
import { PROMPTS } from "../helpers.js";

export default defineEval({
  description: "Update liability parks for approval, then completes after approve.",
  async test(t) {
    const pending = await t.send(PROMPTS.markPaid);
    pending.parked();
    t.requireInputRequest({ toolName: "update_liability" });

    await t.respondAll("approve");

    t.succeeded();
    t.calledTool("update_liability", {
      status: "completed",
      input: { account: "Sample Card B", status: "PAID" },
    });
  },
});
