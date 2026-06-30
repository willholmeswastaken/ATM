import { defineAgent } from "eve";
import { hasGatewayCredentials, resolveModel } from "#lib/model.js";

const usingMock = !hasGatewayCredentials();

export default defineAgent({
  description:
    "Personal net worth and budget agent that reads and updates a Google Sheets finance dashboard.",
  model: resolveModel(),
  ...(usingMock
    ? { modelContextWindowTokens: 128_000 }
    : {}),
});
