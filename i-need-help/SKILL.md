---
name: i-need-help
description: Automatically stop stalled work before the next task action when current or carried-forward history shows two unproductive attempts on the same blocker, work oscillating between failed approaches, or a known missing prerequisite with no useful authorized step. Preserve the evidence and ask the existing supervisor or user for specific help. Do not use for general requests for help or tasks that continue making progress.
---

# I need help

<!-- source-of-truth: stop rules and help requests for stalled agent tasks. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-05 -->

## Purpose

Save time, tokens and user attention by recognizing when continued task work has stopped producing value. This is an automatic process skill, not a host watchdog; follow it when the evidence meets its trigger.

## Check for progress

At the start of a continuation or handoff, compare current task history with the blocker before doing more work. If the history already records two unproductive attempts on that blocker, the threshold is met; do not take another task action to confirm it. Otherwise, before another attempt, compare its proposed approach and expected result with the previous attempt. Maintain only a short note in the task's existing state: blocker, approaches tried, observed results and last useful progress. Do not create tracking or evidence files for this process unless the task itself requires them.

An attempt is a purposeful approach or experiment and may contain several tool calls. Useful progress is relevant new evidence, resolved uncertainty or a verified step toward the requested outcome. A useful negative result counts. Repeated reads, cosmetic edits, changed command wording, reassuring status, unrelated discoveries and cycling between failed approaches do not.

Stop when two attempts at the same blocker add no useful progress. Count equivalent retries and oscillating approaches together, including attempts carried forward by a supervisor or earlier agent. When current task history records two matching attempts, treat the threshold as met; do not rerun them or search to reconstruct their results. Reset the count only when relevant evidence or conditions materially change. Stop sooner if an established missing capability, access or user decision leaves no useful authorized next step. Elapsed time alone is not a trigger.

## Stop and ask

When triggered, stop advancing the affected task immediately. Do not make another recovery attempt, retry, poll, speculate, search for confirming evidence, or delegate around the blocker. If a host explicitly requires a receipt for tool execution, finish only that required capture; do not add optional investigation or process-tracking artifacts. When loading this skill after recognizing the trigger, combine its read with any mandatory receipt capture and inspection in the same tool call where possible. Do not make a follow-up call to reread or embellish a receipt that has already been inspected. Once the skill and any required receipt are loaded, prepare the help request from the evidence already available without another task command. Preserve existing work. Take only the minimum safe action to stop task-owned ongoing work; do not stop unrelated processes. Say when termination cannot be confirmed.

Request help from the current owner: a delegated agent reports to its existing supervisor; the main agent asks the user. Carry the blocker and failed-attempt history forward so replacing an agent cannot reset the count. Do not spawn another helper or send external messages.

Use available host question or supervisor-return mechanisms. If unavailable, put the request in the task result and say delivery is unconfirmed. Keep it to about 150 words plus essential evidence links:

- **Stopped:** requested outcome and current blocker.
- **Tried:** both approaches and their observed results.
- **Preserved:** relevant changes, artifacts and unfinished processes.
- **Need:** one direct question or request naming the specific artifact, access change or decision that enables progress. Write “Please provide [artifact/access/decision] so I can [next outcome].” Do not leave it as an indirect statement such as “progress requires…” or “I would need…”.

Example: “Please provide an approved billing-log export so I can determine whether the job emitted logs.”

## Wait and resume

After asking, wait. Status requests and automatic wakeups do not authorize resuming the task. Resume only when the response provides relevant evidence, changed conditions or explicit direction for a concrete next approach. Carry the blocker and prior attempts forward; do not repeat them without new evidence.

Respect host lifecycle rules. Asking for help does not prove a task stopped, completed or entered a native paused state. Do not claim termination without host evidence. Automatic continuations must preserve the waiting state rather than restarting work.
