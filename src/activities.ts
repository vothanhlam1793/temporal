export async function assessExpense(amount: number): Promise<string> {
  console.log(`Reviewing expense of $${amount}`);

  if (amount <= 100) {
    return "Expense is eligible for automatic approval.";
  }

  return "Manager approval is required.";
}

export async function reimburseExpense(amount: number): Promise<void> {
  console.log(`Reimbursing $${amount}`);
}
