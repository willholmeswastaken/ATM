import { defineEval } from "eve/evals";
import { PROMPTS } from "../helpers.js";

export default defineEval({
  description: "Agent calls get_overheads for monthly bills questions.",
  async test(t) {
    await t.send(PROMPTS.overheads);
    t.succeeded();
    t.calledTool("get_overheads");
  },
});
