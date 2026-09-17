import { Client, Connection } from "@temporalio/client";
import { financePaymentComplete } from "./workflows.js";

const [workflowId, financeOfficer = "Hoa"] = process.argv.slice(2);

if (!workflowId) {
  throw new Error("Usage: npm run dev:finance -- <workflow-id> [finance-officer]");
}

const connection = await Connection.connect({ address: "localhost:7233" });
const client = new Client({ connection });
const handle = client.workflow.getHandle(workflowId);

await handle.signal(financePaymentComplete, financeOfficer);
console.log(`Finance officer ${financeOfficer} confirmed payment for ${workflowId}.`);
