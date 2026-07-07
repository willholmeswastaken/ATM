import { defineEval } from "eve/evals";
import { PROMPTS } from "../helpers.js";

export default defineEval({
  description: "Agent uses get_assets for ISA balance questions.",
  async test(t) {
    await t.send(PROMPTS.isaBalance);
    t.succeeded();
    t.calledTool("get_assets", { input: { account: "ISA" } });
  },
});
