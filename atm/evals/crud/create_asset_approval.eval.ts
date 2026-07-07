import { defineEval } from "eve/evals";
import { PROMPTS } from "../helpers.js";

export default defineEval({
  description: "Create asset parks for approval, then completes after approve.",
  async test(t) {
    const pending = await t.send(PROMPTS.createAsset);
    pending.parked();
    t.requireInputRequest({ toolName: "create_asset" });

    await t.respondAll("approve");

    t.succeeded();
    t.calledTool("create_asset", { status: "completed", count: 1 });
  },
});
