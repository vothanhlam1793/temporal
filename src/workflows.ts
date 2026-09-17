import {
  condition,
  defineSignal,
  proxyActivities,
  setHandler,
} from "@temporalio/workflow";
import type * as activities from "./activities.js";

export const approveExpense = defineSignal<[string]>("approveExpense");

const { assessExpense, reimburseExpense } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
  retry: {
    maximumAttempts: 3,
  },
});

export async function expenseWorkflow(amount: number): Promise<string> {
  const assessment = await assessExpense(amount);

  if (amount <= 100) {
    await reimburseExpense(amount);
    return `${assessment} Reimbursement complete.`;
  }

  let approvedBy: string | undefined;
  setHandler(approveExpense, (manager) => {
    approvedBy = manager;
  });

  // This wait survives worker crashes, deploys, and arbitrary delays.
  await condition(() => approvedBy !== undefined);

  await reimburseExpense(amount);
  return `${assessment} Approved by ${approvedBy}; reimbursement complete.`;
}
