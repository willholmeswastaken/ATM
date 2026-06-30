import { defineTool } from "eve/tools";
import { z } from "zod";
import {
  formatGBP,
  overheadRatio,
  parseMoney,
  savingsRate,
} from "#lib/finance.js";
import { BUDGET_CELLS, getCell, METRIC_CELLS } from "#lib/google-sheets.js";

export default defineTool({
  description:
    "Get budget overview: salary, bills, savings, disposable income, and daily metrics.",
  inputSchema: z.object({}),
  async execute() {
    const cells = [
      BUDGET_CELLS.salary,
      BUDGET_CELLS.bills,
      BUDGET_CELLS.savings,
      BUDGET_CELLS.disposable,
      METRIC_CELLS.daysTillPayday,
      METRIC_CELLS.budgetPerDay,
      METRIC_CELLS.expectedLeftToday,
      METRIC_CELLS.cashAvailable,
      METRIC_CELLS.actualSpent,
      METRIC_CELLS.actualBillsSpent,
    ];

    const values = await Promise.all(cells.map((c) => getCell(c)));

    const salary = parseMoney(values[0]);
    const bills = parseMoney(values[1]);
    const savings = parseMoney(values[2]);
    const disposable = parseMoney(values[3]);
    const daysTillPayday = parseMoney(values[4]);
    const budgetPerDay = parseMoney(values[5]);
    const expectedLeftToday = parseMoney(values[6]);
    const cashAvailable = parseMoney(values[7]);
    const actualSpent = parseMoney(values[8]);
    const actualBillsSpent = parseMoney(values[9]);

    return {
      salary,
      bills,
      savings,
      disposable,
      daysTillPayday,
      budgetPerDay,
      expectedLeftToday,
      cashAvailable,
      actualSpent,
      actualBillsSpent,
      savingsRate: savingsRate(salary, savings),
      overheadRatio: overheadRatio(salary, bills),
      formatted: {
        salary: formatGBP(salary),
        bills: formatGBP(bills),
        savings: formatGBP(savings),
        disposable: formatGBP(disposable),
        budgetPerDay: formatGBP(budgetPerDay),
      },
    };
  },
});
