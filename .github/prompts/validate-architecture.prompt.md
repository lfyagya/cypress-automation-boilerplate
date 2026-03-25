---
description: Use when you want to check a file or folder for command-first architecture violations before committing.
agent: agent
model: Claude Sonnet 4.6
---

Run a pre-commit architecture validation on the provided scope.

## Input

- Scope (file or glob): `${input:scope}` (e.g. `cypress/tests/loan-applications/**`)

## Checks to Run

### Red Flags (FAIL immediately)

| Check               | What to look for                                                                       |
| ------------------- | -------------------------------------------------------------------------------------- |
| Hardcoded selectors | Strings like `'.class'`, `'#id'`, `'button'`, `'[type="submit"]'` outside config files |
| Hardcoded URLs      | Raw URL strings in test/command files — should come from routes config                 |
| Hardwaits           | `cy.wait(` followed by a number                                                        |
| Action file usage   | `import ... from '*.actions.js'` or `new ...Obj()` (page object pattern)               |
| cy.wait(ms)         | Any `cy.wait(` with a numeric argument                                                 |
| Duplicate commands  | `Cypress.Commands.add('name', ...)` registered in more than one file                   |
| Missing auth        | Test spec with `cy.visit` but no `cy.ensureAuthenticated()`                            |

### Yellow Flags (WARN — investigate)

| Check                          | What to look for                                                            |
| ------------------------------ | --------------------------------------------------------------------------- |
| Business logic in specs        | Loops, conditionals, data transformations inside `it()` blocks              |
| Missing intercept before visit | `cy.visit()` before `cy.apiIntercept()` calls                               |
| Missing `cy.session()` in auth | Auth flow that re-logs in every test (performance hit)                      |
| `afterEach` cleanup            | State teardown in `afterEach` — unreliable if test fails (use `beforeEach`) |
| Tiny single-assertion tests    | Multiple `it()` blocks that could be consolidated                           |

## Output Format

```
File: <path>
  [FAIL] <line ref>: <issue description>
  [WARN] <line ref>: <issue description>

VERDICT: PASS | NEEDS_CHANGES
```

## Documentation Reference

- `/.github/FRAMEWORK_RULES.md`
- `/docs/framework-standards.md`
