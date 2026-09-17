# Temporal approval exercise

This small example pays an expense. Expenses at or below `$100` are paid automatically; an expense above that threshold waits for a manager's durable approval signal.

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

The client starts a `$250` expense workflow. It stops at the approval wait. Check its event history in the UI, then press Enter in the client terminal. That sends the `approveExpense` signal and the workflow resumes.

Stop the worker while the client is waiting, start it again, then approve. The workflow still resumes because its state and event history live in Temporal, not the worker process.

## What each file shows

- `src/workflows.ts`: durable orchestration. It never performs external I/O directly.
- `src/activities.ts`: external work, which Temporal can retry.
- `src/worker.ts`: runs workflow code and activities from the task queue.
- `src/client.ts`: starts the workflow and signals the human decision.

## LangGraph connection

An agent graph can run in an activity, while Temporal owns the durable business process around it: retries, approval waits, timers, and recovery after a worker restart.
