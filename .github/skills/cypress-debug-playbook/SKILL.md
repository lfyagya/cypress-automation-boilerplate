---
name: cypress-debug-playbook
description: "Use when debugging Cypress failures, flaky test behavior, alias mismatches, selector issues, and nondeterministic assertions. BLOCKING: Load this skill BEFORE any debug output."
---

# Cypress Debug Playbook Skill

## Objective

Find root cause fast and apply the smallest safe, architecture-aligned fix.

## Debug Decision Tree

```
Test fails?
  ├─ Element not found?
  │    ├─ Is it a selector issue?    → Check UI config data-cy value matches DOM
  │    ├─ Is DOM not ready?          → Check API intercept is set before cy.visit()
  │    └─ Is element conditional?   → Add .should('exist') before interaction
  │
  ├─ API status code mismatch?
  │    ├─ expectedStatus wrong?     → Check API config entry expectedStatus value
  │    └─ Endpoint changed?         → Update endpoint in API config file
  │
  ├─ Alias not found (@alias)?
  │    ├─ Intercept registered?     → cy.apiIntercept() / cy.apiInterceptAll() called?
  │    └─ Intercept before visit?   → Must be registered BEFORE cy.visit()
  │
  ├─ cy.wait() timeout?
  │    ├─ Hard wait?                → NEVER fix with longer wait — find the real condition
  │    └─ Alias wait?               → Check intercept is registered and fires
  │
  └─ Flaky test?
       ├─ Timing-dependent?         → Replace with cy.apiWait() or .should() chain
       ├─ Test state leaking?       → Check beforeEach resets properly (not afterEach)
       └─ Session not cached?       → Ensure cy.ensureAuthenticated() uses cy.session()
```

## Fix Rules

1. Never introduce `cy.wait(ms)` as a fix — it hides the real problem.
2. Never change test architecture to work around a timing bug.
3. Fix in the **layer where the bug lives**: config → command → test.
4. Smallest possible change that makes the test deterministic.

## Common Root Causes from Industry Experience

| Symptom                                            | Root Cause                                   | Fix                                                      |
| -------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------- |
| `CypressError: Timed out waiting for element`      | Selector stale or DOM not attached           | Update `data-cy` value in UI config                      |
| `CypressError: cy.wait() timed out waiting @alias` | Intercept registered after visit             | Move `cy.apiIntercept()` before `cy.visit()`             |
| Failed status assertion                            | `expectedStatus` in API config is wrong      | Update `expectedStatus` in the API config entry          |
| Test passes alone, fails in suite                  | State leaking from previous test             | Move cleanup to `beforeEach`, never `afterEach`          |
| Auth fails intermittently                          | No `cy.session()` — full re-login every test | Wrap auth in `cy.session()` inside `ensureAuthenticated` |
| `Cannot read property of undefined`                | Fixture data shape changed                   | Update fixture and matching schema                       |

## Output Contract

1. **Root cause**: exact file + why it fails.
2. **Fix**: minimal code change.
3. **Rule**: which framework rule this fix satisfies.
4. **Verification**: how to confirm the fix.
