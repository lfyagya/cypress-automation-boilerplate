# Cypress Debug Playbook

Use this skill to trace the root cause of a Cypress test failure systematically.

## Inputs required

- Error message (exact text from Cypress output)
- Failing test file path and test name
- Stack trace (if available)
- Cypress Cloud run URL or Test Replay link (if available)

## Required output order

1. **Failure classification** — which category from the table below
2. **Root cause trace** — exact file:line where the failure originates
3. **Evidence** — what in the code confirms this is the root cause
4. **Fix** — exact code change (file path, before, after)
5. **Verification** — how to confirm the fix works without running the full suite

## Failure Classification Table

| Category | Indicators |
|---|---|
| `SELECTOR_STALE` | `cy.get()` timeout, element not in DOM |
| `API_ALIAS_MISMATCH` | `cy.apiWait()` timeout, intercept never matched |
| `INTERCEPT_ORDER` | Race condition — API returned before intercept registered |
| `SESSION_POLLUTION` | Test passes in isolation, fails in suite |
| `ENV_MISMATCH` | Passes locally, fails in CI or different env |
| `ASSERTION_WRONG` | Element found, value mismatch |
| `CONFIG_MISSING` | `undefined` value — import not registered |
| `TIMING` | Intermittent, non-deterministic failure |

## Rules

- Start from the stack trace or Cypress Cloud evidence — do not guess
- Fix the root cause, not the symptom
- Never propose `cy.wait(number)` as a fix
- If the failure is in a `*.actions.js` or page-object, recommend migration instead of patching
- After 3 failed fix attempts, escalate — do not continue proposing variations
