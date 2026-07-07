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
    if (msg.includes("tabs") || msg.includes("spreadsheet")) {
      return { toolCalls: [{ name: "list_sheet_tabs", input: {} }] };
    }
    if (msg.includes("paid off") || msg.includes("payoff") || msg.includes("debt schedule")) {
      return {
        toolCalls: [
          {
            name: "get_debt_schedule",
            input: { account: "Example Balance Transfer" },
          },
        ],
      };
    }
    if (msg.includes("isa") || (msg.includes("asset") && !msg.includes("add"))) {
      return {
        toolCalls: [
          {
            name: "get_assets",
            input: msg.includes("isa") ? { account: "ISA" } : {},
          },
        ],
      };
    }
    if (
      (msg.includes("saving") || msg.includes("health check")) &&
      msg.includes("advice")
    ) {
      return {
        toolCalls: [
          { name: "get_net_worth_summary", input: {} },
          { name: "get_budget_overview", input: {} },
          { name: "get_assets", input: {} },
        ],
      };
    }
    if (msg.includes("health check")) {
      return {
        toolCalls: [
          { name: "get_net_worth_summary", input: {} },
          { name: "get_budget_overview", input: {} },
          { name: "get_overheads", input: {} },
        ],
      };
    }
    if (msg.includes("debt") && (msg.includes("focus") || msg.includes("advice"))) {
      return {
        toolCalls: [
          { name: "get_liabilities", input: { unpaidOnly: true } },
          { name: "get_net_worth_summary", input: {} },
        ],
      };
    }
    if (msg.includes("remove") || msg.includes("delete")) {
      return {
        toolCalls: [
          { name: "delete_overhead", input: { name: "Example Streaming" } },
        ],
      };
    }
    if (
      msg.includes("overhead") ||
      msg.includes("bill") ||
      msg.includes("subscription")
    ) {
      return { toolCalls: [{ name: "get_overheads", input: {} }] };
    }
    if (
      msg.includes("credit card") ||
      msg.includes("owe money") ||
      msg.includes("liabilit")
    ) {
      return {
        toolCalls: [{ name: "get_liabilities", input: { unpaidOnly: true } }],
      };
    }
    if (msg.includes("budget") || msg.includes("disposable")) {
      return { toolCalls: [{ name: "get_budget_overview", input: {} }] };
    }
    if (msg.includes("add") && (msg.includes("account") || msg.includes("fund"))) {
      return {
        toolCalls: [
          {
            name: "create_asset",
            input: {
              account: "Eval Test Fund",
              funds: 750,
              type: "Investments",
            },
          },
        ],
      };
    }
    if (msg.includes("mark") && msg.includes("paid")) {
      return {
        toolCalls: [
          {
            name: "update_liability",
            input: { account: "Sample Card B", status: "PAID" },
          },
        ],
      };
    }

    if (msg.includes("hello") || msg === "hi") {
      return { text: "Hello! How can I help with your finances today?" };
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
