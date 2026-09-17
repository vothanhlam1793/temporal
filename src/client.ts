import { Client, Connection } from "@temporalio/client";
import { approveExpense, expenseWorkflow } from "./workflows.js";

const connection = await Connection.connect({ address: "localhost:7233" });
const client = new Client({ connection });
const workflowId = `expense-${Date.now()}`;

const handle = await client.workflow.start(expenseWorkflow, {
  args: [250],
  taskQueue: "expense-approval",
  workflowId,
});

console.log(`Started workflow: ${workflowId}`);
console.log("It is now waiting durably for manager approval.");
console.log("Open http://localhost:8233, then press Enter here to approve it.");

await new Promise<void>((resolve) => process.stdin.once("data", resolve));
await handle.signal(approveExpense, "Lan");

console.log("Approval signal sent.");
console.log(await handle.result());
