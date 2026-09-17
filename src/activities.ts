export async function recordExpense(
  employee: string,
  amount: number,
): Promise<void> {
  console.log(`Recorded $${amount} expense for ${employee}`);
}

export async function notify(role: string, message: string): Promise<void> {
  console.log(`[Notify ${role}] ${message}`);
}

export async function requestFinancePayment(amount: number): Promise<void> {
  console.log(`Requested finance payment for $${amount}`);
}

export async function recordReimbursement(
  employee: string,
  amount: number,
  financeOfficer: string,
): Promise<void> {
  console.log(
    `Recorded $${amount} reimbursement for ${employee}, confirmed by ${financeOfficer}`,
  );
}
