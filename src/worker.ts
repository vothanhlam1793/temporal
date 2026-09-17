import { Worker } from "@temporalio/worker";
import * as activities from "./activities.js";

const worker = await Worker.create({
  workflowsPath: new URL("./workflows.ts", import.meta.url).pathname,
  activities,
  taskQueue: "expense-approval",
});

console.log("Worker listening on task queue: expense-approval");
await worker.run();
