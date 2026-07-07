import { defineEval } from "eve/evals";
import { PROMPTS } from "../helpers.js";

export default defineEval({
  description: "Delete overhead parks for approval, then completes after approve.",
  async test(t) {
    const pending = await t.send(PROMPTS.deleteOverhead);
    pending.parked();
    t.requireInputRequest({ toolName: "delete_overhead" });

    await t.respondAll("approve");

    t.succeeded();
    t.calledTool("delete_overhead", {
      status: "completed",
      input: { name: "Example Streaming" },
    });
  },
});
