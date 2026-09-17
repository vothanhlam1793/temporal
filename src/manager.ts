import { Client, Connection } from "@temporalio/client";
import { managerDecision } from "./workflows.js";

const [workflowId, decision = "approved", manager = "Lan"] = process.argv.slice(2);

if (!workflowId || (decision !== "approved" && decision !== "rejected")) {
  throw new Error(
    "Usage: npm run dev:manager -- <workflow-id> <approved|rejected> [manager-name]",
  );
}

const connection = await Connection.connect({ address: "localhost:7233" });
const client = new Client({ connection });
const handle = client.workflow.getHandle(workflowId);

await handle.signal(managerDecision, decision, manager);
console.log(`Manager ${manager} ${decision} ${workflowId}.`);
