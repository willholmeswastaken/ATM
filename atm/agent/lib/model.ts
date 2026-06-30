import { mockModel } from "eve/evals";

export function hasGatewayCredentials(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      process.env.VERCEL_OIDC_TOKEN ||
      process.env.VERCEL_AI_GATEWAY_API_KEY,
  );
}

/** Deterministic model for local dev/evals without AI Gateway credentials. */
function evalFixtureModel() {
  return mockModel(({ lastUserMessage, toolResults }) => {
    if (toolResults.length > 0) {
      const summary = toolResults
        .map((t) => `${t.name}: ${JSON.stringify(t.output)}`)
        .join("\n");
      return `Here is your financial data:\n${summary}`;
    }

    const msg = (lastUserMessage ?? "").toLowerCase();

    if (msg.includes("net worth")) {
      return { toolCalls: [{ name: "get_net_worth_summary", input: {} }] };
    }
    if (msg.includes("isa") || msg.includes("asset")) {
      return {
        toolCalls: [
          {
            name: "get_assets",
            input: msg.includes("isa") ? { account: "ISA" } : {},
          },
        ],
      };
    }
    if (msg.includes("saving") && msg.includes("advice")) {
      return {
        toolCalls: [
          { name: "get_net_worth_summary", input: {} },
          { name: "get_budget_overview", input: {} },
          { name: "get_assets", input: {} },
        ],
      };
    }
    if (msg.includes("overhead") || msg.includes("bill")) {
      return { toolCalls: [{ name: "get_overheads", input: {} }] };
    }
    if (msg.includes("debt") || msg.includes("liabilit")) {
      return {
        toolCalls: [{ name: "get_liabilities", input: { unpaidOnly: true } }],
      };
    }
    if (msg.includes("budget") || msg.includes("disposable")) {
      return { toolCalls: [{ name: "get_budget_overview", input: {} }] };
    }

    return { toolCalls: [{ name: "get_net_worth_summary", input: {} }] };
  });
}

export function resolveModel() {
  if (!hasGatewayCredentials()) {
    return evalFixtureModel();
  }
  return "openai/gpt-4.1";
}
