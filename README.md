# Temporal approval exercise

This exercise models an expense reimbursement across four roles:

- Employee starts a `$150` expense request.
- Manager approves or rejects it with a signal.
- Finance confirms payment with a second signal.
- Monitor sends durable reminders every 20 seconds while either human role is pending.

## Run it

In three terminals:

```sh
npm install
npm run dev:server
```

Wait until Temporal is ready, then open `http://localhost:8233` to inspect workflows.
For this local exercise, the UI also permits `http://10.7.0.21:8233`. It deliberately
uses an insecure CSRF cookie because the UI is served over HTTP; do not copy that setting
to a production deployment. Use HTTPS there.

```sh
npm run dev:worker
```

```sh
npm run dev:client
```

The employee client prints the new workflow ID and waits for its result. Use the workflow ID in two further terminals:

```sh
npm run dev:manager -- <workflow-id> approved Lan
npm run dev:finance -- <workflow-id> Hoa
```

The manager can also reject the expense:

```sh
npm run dev:manager -- <workflow-id> rejected Lan
```

Watch the Workflow History in the UI. Leave the workflow pending for 20 seconds to see the monitor activities enqueue reminders. You can send the same signals from the UI: `managerDecision` takes `["approved", "Lan"]`, while `financePaymentComplete` takes `["Hoa"]`.

Stop the worker while the client is waiting, start it again, then approve. The workflow still resumes because its state and event history live in Temporal, not the worker process.

## What each file shows

- `src/workflows.ts`: durable orchestration. It never performs external I/O directly.
- `src/activities.ts`: external work, which Temporal can retry.
- `src/worker.ts`: runs workflow code and activities from the task queue.
- `src/client.ts`: employee client that starts a workflow.
- `src/manager.ts` and `src/finance.ts`: role-specific signal clients. These map directly to HTTP API endpoints in a production service.

## LangGraph connection

An agent graph can run in an activity, while Temporal owns the durable business process around it: retries, approval waits, timers, and recovery after a worker restart.
