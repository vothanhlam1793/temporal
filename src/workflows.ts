import {
  condition,
  defineSignal,
  proxyActivities,
  setHandler,
} from "@temporalio/workflow";
import type * as activities from "./activities.js";

export const managerDecision = defineSignal<
  [decision: "approved" | "rejected", manager: string]
>("managerDecision");
export const financePaymentComplete = defineSignal<[financeOfficer: string]>(
  "financePaymentComplete",
);

const { notify, recordExpense, recordReimbursement, requestFinancePayment } =
  proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
  retry: {
    maximumAttempts: 3,
  },
  });

const REMINDER_INTERVAL = "20 seconds";

export async function expenseWorkflow(
  employee: string,
  amount: number,
): Promise<string> {
  await recordExpense(employee, amount);
  await notify("manager", `${employee} submitted a $${amount} expense.`);

  let managerResponse:
    | { decision: "approved" | "rejected"; manager: string }
    | undefined;
  setHandler(managerDecision, (decision, manager) => {
    managerResponse = { decision, manager };
  });

  while (managerResponse === undefined) {
    const managerResponded = await condition(
      () => managerResponse !== undefined,
      REMINDER_INTERVAL,
    );
    if (!managerResponded) {
      await notify("monitor", `Manager has not reviewed ${employee}'s expense.`);
      await notify("manager", `Reminder: review ${employee}'s $${amount} expense.`);
    }
  }

  if (managerResponse.decision === "rejected") {
    await notify("employee", `Expense rejected by ${managerResponse.manager}.`);
    return `Expense rejected by ${managerResponse.manager}.`;
  }

  await requestFinancePayment(amount);
  await notify("finance", `Pay $${amount} to ${employee}.`);

  let financeOfficer: string | undefined;
  setHandler(financePaymentComplete, (officer) => {
    financeOfficer = officer;
  });

  while (financeOfficer === undefined) {
    const paymentConfirmed = await condition(
      () => financeOfficer !== undefined,
      REMINDER_INTERVAL,
    );
    if (!paymentConfirmed) {
      await notify("monitor", `Finance has not confirmed payment for ${employee}.`);
      await notify("finance", `Reminder: confirm $${amount} payment to ${employee}.`);
    }
  }

  await recordReimbursement(employee, amount, financeOfficer);
  await notify("employee", `Your $${amount} expense was reimbursed.`);
  return `Expense approved by ${managerResponse.manager} and paid by ${financeOfficer}.`;
}
