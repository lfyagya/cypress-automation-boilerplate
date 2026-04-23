---
name: verification-loop
description: 'Run the 6-phase pre-merge QA gate. Produces a READY / BLOCKED verdict covering architecture, config completeness, test quality, data safety, regression coverage, and command hygiene.'
---

# Verification Loop — Pre-Merge QA Gate

Run this skill before every PR. It produces a READY / BLOCKED verdict.

## Phase 1 — Architecture Compliance

Check changed files:
- Any `cy.wait(number)` hard waits
- Any new `*.actions.js` files
- Any new page-object wrappers
- Hardcoded selectors or routes in test/command files
- Duplicate command names in `cypress/support/commands.js`

**Pass:** zero violations | **Fail:** list each with file:line, severity HIGH

## Phase 2 — Lint

```bash
npm run lint
```

**Pass:** 0 errors | **Fail:** paste error lines, severity HIGH

## Phase 3 — Config Completeness

- All selectors → `cypress/configs/ui/**`
- All API aliases → `cypress/configs/api/**`
- All routes → `cypress/configs/app/routes.js`
- New constants use `Object.freeze()`

## Phase 4 — Test Execution (Scoped)

```bash
npm run cy:run:smoke           # smoke suite
npm run cy:run:tag -- --env grepTags=@module-name  # scoped by tag
```

**Pass:** 0 assertion failures | **Fail:** list test names + errors, severity HIGH

## Phase 5 — Regression Coverage

If PR has `fix:` commit: confirm `[BUG-NNN] regression:` test exists.

## Phase 6 — Command Hygiene

- No duplicate `Cypress.Commands.add` (BLOCK)
- New command imported in `commands.js`

## Output

```
Phase 1  Architecture:        PASS / FAIL
Phase 2  Lint:                PASS / FAIL
Phase 3  Config Completeness: PASS / FAIL
Phase 4  Tests:               PASS / FAIL
Phase 5  Regression:          PASS / FAIL / N/A
Phase 6  Command Hygiene:     PASS / FAIL
===========================================
STATUS: READY FOR PR | BLOCKED
```
