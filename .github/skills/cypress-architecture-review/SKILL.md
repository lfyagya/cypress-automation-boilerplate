---
name: cypress-architecture-review
description: "Use when reviewing Cypress changes for command-first architecture compliance, selector quality, command ownership, and production readiness. BLOCKING: Load this skill BEFORE generating any review output."
---

# Cypress Architecture Review Skill

## Review Framework

Architecture review is a structural correctness gate, not style feedback.

## Tier 1 — Hard Failures (Block Merge)

These must be fixed before any PR is merged:

| Rule                   | Violation Example                                         | Evidence                                                      |
| ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------- |
| No new action files    | `*.actions.js` imported in new work                       | Import statement in spec/command                              |
| No new page objects    | `new FeatureObj()` or class-based selectors               | Class definition or `new` instantiation                       |
| No hardcoded selectors | `cy.get('.table-row')`                                    | String literal starting with `.`, `#`, or tag in test/command |
| No hardcoded URLs      | `cy.visit('/specific/path')` in tests                     | Raw URL string not from routes config                         |
| No `cy.wait(ms)`       | `cy.wait(2000)`                                           | Numeric arg to cy.wait                                        |
| Unique command names   | Two files registering same `Cypress.Commands.add('name')` | Duplicate registration                                        |
| Auth setup present     | Auth flows without `cy.ensureAuthenticated()`             | Missing call in before/beforeEach                             |

## Tier 2 — Warnings (Fix Before Merge If Possible)

| Rule                    | What to Look For                                              |
| ----------------------- | ------------------------------------------------------------- |
| Intercepts before visit | `cy.visit()` appears before `cy.apiIntercept()` in same block |
| Session caching         | `cy.login()` per test without `cy.session()` wrapper          |
| Thin specs              | Business logic (loops, data transforms) inside `it()` blocks  |
| afterEach cleanup       | State teardown in `afterEach` — move to `beforeEach`          |
| Tiny test proliferation | Many single-assertion `it()` blocks that could be combined    |

## Selector Quality Scoring

| Selector Type               | Score | Verdict                             |
| --------------------------- | ----- | ----------------------------------- |
| `[data-cy="..."]`           | 10/10 | ✅ Best                             |
| `[data-testid="..."]`       | 9/10  | ✅ Acceptable                       |
| `[aria-label="..."]`        | 8/10  | ✅ Good for a11y                    |
| `cy.contains('exact text')` | 6/10  | ⚠️ Only if text is assertion target |
| `[role="..."]`              | 6/10  | ⚠️ Sparingly                        |
| `#id`                       | 3/10  | ❌ Brittle                          |
| `.class`                    | 1/10  | ❌ Never                            |
| Tag name                    | 1/10  | ❌ Never                            |

## Output Contract

```
TIER 1 FAILURES:
  [FAIL] <file>:<approx line>: <rule violated> — <what was found>

TIER 2 WARNINGS:
  [WARN] <file>: <issue>

SELECTOR AUDIT:
  <file>: <worst selector found> → <recommended replacement>

VERDICT: PASS | NEEDS_CHANGES
```
