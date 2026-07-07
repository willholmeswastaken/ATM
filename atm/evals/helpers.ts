/** Shared constants for deterministic eval prompts. */
export const PROMPTS = {
  netWorth: "What is my net worth?",
  isaBalance: "How much is in my ISA?",
  unpaidDebts: "Which credit cards still owe money?",
  overheads: "What are my monthly overheads?",
  disposable: "How much disposable income do I have?",
  debtSchedule: "When is my Example Balance Transfer paid off?",
  savingsAdvice: "Am I saving enough? Give me advice based on my actual numbers.",
  debtAdvice:
    "What should I focus on for debt? Use my actual liability numbers.",
  healthCheck:
    "Give me a financial health check using my real numbers.",
  greeting: "Hello!",
  createAsset:
    "Add a new investment account called Eval Test Fund with £750.",
  markPaid: "Mark Sample Card B as PAID.",
  deleteOverhead: "Remove Example Streaming from my bills.",
  listTabs: "What tabs are in my spreadsheet?",
} as const;
