# Cypress Performance Audit

Use this skill to audit one or more spec files for performance and flakiness issues.

## Inputs required

- Spec file path(s) or module name to audit
- Cypress Cloud run history (optional — for flakiness data)

## Required output order

1. **Critical issues** (cause test failures or unreliable results):
   - Hard waits: `cy.wait(number)` — list each with line number
   - Missing intercepts: `cy.visit()` before `cy.apiIntercept()` — race condition
   - `cy.apiWait()` called too late — API may have resolved already

2. **Performance issues** (slow but not breaking):
   - `beforeEach` blocks longer than needed — what can be moved to `before()`
   - Repeated navigation to the same URL within a suite — consolidate
   - Large fixture files loaded unnecessarily

3. **Flakiness risks** (intermittent failures):
   - Hardcoded `cy.wait(number)` anywhere
   - Assertions on dynamic data without proper API wait
   - Missing `testIsolation: true` on multi-it suites with shared state
   - Tests without `cy.ensureAuthenticated()` in session-sensitive flows

4. **Recommendations** — ordered by impact:
   - [file:line] — [issue] — [fix]

## Rules

- Report exact file:line for every finding
- Distinguish between critical (breaks tests) and advisory (degrades speed)
- Do not recommend `cy.wait(number)` as a fix — it is never the answer
