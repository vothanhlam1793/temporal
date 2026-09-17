import { Client, Connection } from "@temporalio/client";
import { expenseWorkflow } from "./workflows.js";

const connection = await Connection.connect({ address: "localhost:7233" });
const client = new Client({ connection });
const workflowId = `expense-${Date.now()}`;

const handle = await client.workflow.start(expenseWorkflow, {
  args: ["Minh", 150],
  taskQueue: "expense-approval",
  workflowId,
});

console.log(`Started workflow: ${workflowId}`);
console.log("Employee Minh submitted a $150 expense.");
console.log(`Manager: npm run dev:manager -- ${workflowId} approved Lan`);
console.log(`Finance: npm run dev:finance -- ${workflowId} Hoa`);

console.log(await handle.result());
