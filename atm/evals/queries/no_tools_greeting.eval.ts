import { defineEval } from "eve/evals";
import { PROMPTS } from "../helpers.js";

export default defineEval({
  description: "Agent does not call finance tools for simple greetings.",
  async test(t) {
    await t.send(PROMPTS.greeting);
    t.succeeded();
    t.notCalledTool("get_net_worth_summary");
    t.notCalledTool("get_assets");
    t.notCalledTool("create_asset");
  },
});
