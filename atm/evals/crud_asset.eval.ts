import { defineEval } from "eve/evals";

export default defineEval({
  description: "Agent uses get_assets for ISA balance questions.",
  async test(t) {
    await t.send("How much is in my ISA?");
    t.succeeded();
    t.calledTool("get_assets");
  },
});
