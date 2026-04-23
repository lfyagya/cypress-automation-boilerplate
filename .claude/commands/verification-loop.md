# Verification Loop — Pre-Merge QA Gate

Use this skill before every PR. It produces a READY / BLOCKED verdict with a phase-by-phase report.

## Phase 1 — Architecture Compliance

Check changed files for:
- Any `cy.wait(number)` hard waits
- Any new `*.actions.js` files
- Any new page-object wrappers
- Hardcoded selectors or routes in test/command files
- Duplicate command names in `cypress/support/commands.js`

**Pass:** zero architecture violations
**Fail:** list each violation with file:line, severity HIGH

## Phase 2 — Lint and Format

```bash
npm run lint
```

**Pass:** 0 lint errors
**Fail:** paste error lines, severity HIGH

## Phase 3 — Config Completeness

- All selectors in specs come from `cypress/configs/ui/**`
- All API aliases come from `cypress/configs/api/**`
- All routes come from `cypress/configs/app/routes.js`
- New constants use `Object.freeze()`

**Pass:** no config gaps
**Fail:** list missing constants with file:line

## Phase 4 — Test Execution (Scoped)

Run only the tests covering changed files:

```bash
# Smoke tests:
npm run cy:run:smoke

# All tests:
npm run cy:run

# Specific module by tag:
npm run cy:run:tag -- --env grepTags=@module-name
```

**Pass:** 0 assertion failures
**Fail:** list failing test names and error messages, severity HIGH

## Phase 5 — Regression Coverage

If the PR contains a `fix:` commit:
- Confirm `[BUG-NNN] regression:` test is present in changed spec file(s)

**Pass:** regression test present (if fix PR), or N/A
**Fail:** severity HIGH for missing regression test on a fix PR

## Phase 6 — Command Hygiene

- No duplicate `Cypress.Commands.add` registrations
- New command file imported in `cypress/support/commands.js`
- New env keys present in all env files (dev/qa/prod)

**Pass:** no hygiene violations
**Fail (BLOCK):** duplicate command — severity HIGH

## Output Contract

```
VERIFICATION REPORT — [scope]
=============================================================
Phase 1  Architecture:        PASS / FAIL  [N violations]
Phase 2  Lint:                PASS / FAIL  [N errors]
Phase 3  Config Completeness: PASS / FAIL  [N gaps]
Phase 4  Tests:               PASS / FAIL  [N passed, N failed]
Phase 5  Regression:          PASS / FAIL / N/A
Phase 6  Command Hygiene:     PASS / FAIL  [N violations]
=============================================================
STATUS: READY FOR PR | BLOCKED
Required actions before merge: [list or "none"]
```
