import { defineTool } from "eve/tools";
import { z } from "zod";
import {
  debtToAssetRatio,
  formatGBP,
  netWorth,
  parseMoney,
} from "#lib/finance.js";
import { getCell, SUMMARY_CELLS } from "#lib/google-sheets.js";
import { listRows } from "#lib/table-crud.js";

export default defineTool({
  description:
    "Get net worth summary including total savings, bad debt, net position, and key ratios.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    totalSavings: z.number(),
    totalBadDebt: z.number(),
    totalSpentThisMonth: z.number(),
    netPosition: z.number(),
    debtToAssetRatio: z.number(),
    formatted: z.object({
      totalSavings: z.string(),
      totalBadDebt: z.string(),
      netPosition: z.string(),
    }),
  }),
  async execute() {
    const [savings, spent, debt] = await Promise.all([
      getCell(SUMMARY_CELLS.totalSavings),
      getCell(SUMMARY_CELLS.totalSpentThisMonth),
      getCell(SUMMARY_CELLS.totalBadDebt),
    ]);

    const totalSavings = parseMoney(savings);
    const totalBadDebt = parseMoney(debt);
    const totalSpentThisMonth = parseMoney(spent);
    const netPosition = netWorth(totalSavings, totalBadDebt);

    return {
      totalSavings,
      totalBadDebt,
      totalSpentThisMonth,
      netPosition,
      debtToAssetRatio: debtToAssetRatio(totalSavings, totalBadDebt),
      formatted: {
        totalSavings: formatGBP(totalSavings),
        totalBadDebt: formatGBP(totalBadDebt),
        netPosition: formatGBP(netPosition),
      },
    };
  },
});
