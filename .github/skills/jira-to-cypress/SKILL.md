---
name: jira-to-cypress
description: 'Convert a Jira ticket into a full Cypress test plan. Produces scenarios, repro steps, config/command/test changes, and a duplication check.'
---

# Jira AC to Cypress Workflow

## When to run this skill

- You have a Jira ticket with acceptance criteria and need a test plan before writing code
- You want to break AC into positive, negative, and edge-case scenarios before touching the framework
- You need to know which configs, commands, and specs will need to change for a feature

## When NOT to run this skill

- After the feature is already coded (use this before, to guide what to write)
- For bug fixes without AC → use `/ai-regression-testing` instead

---

## What this skill does

Converts Jira acceptance criteria into a structured Cypress test plan: scenarios, framework impact, duplication check, and a validation checklist.

## Inputs Required

- Jira ticket summary
- Jira ticket description
- Acceptance criteria (copy-paste the AC)
- Test type: `e2e` or `smoke`
- Target module or page name

## Output Order

1. **Positive scenarios** — happy path, one scenario per AC item
2. **Negative scenarios** — invalid input, error states, unauthorized access
3. **Edge-case scenarios** — boundary values, empty states, concurrency
4. **Questions and assumptions** — items requiring clarification before writing tests
5. **Manual repro steps** — browser steps to reproduce each scenario
6. **Required API config changes** — new intercept entries needed
7. **Required UI config changes** — new selector constants needed
8. **Required command changes** — new or updated commands
9. **Required spec changes** — new `it()` blocks and which files they go in
10. **Reuse and duplication check** — existing configs/commands that can be reused
11. **Validation checklist** — confirms output follows framework standards
12. **Focused execution plan** — suggested order to implement everything

## Rules

- Follow Config → Commands → Tests — every scenario maps to the correct layer
- No page objects or `*.actions.js` files
- Use existing configs and commands when available — run `/detect-duplication` before proposing new files
- Flag duplication before proposing new files
- Smoke scenarios must remain read-only — no write operations in smoke tests
