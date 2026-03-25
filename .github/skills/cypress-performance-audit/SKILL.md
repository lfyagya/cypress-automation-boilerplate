---
name: cypress-performance-audit
description: "Use when auditing Cypress test suite for slow specs, flaky behavior, CI runtime bloat, and session/auth overhead. BLOCKING: Load this skill BEFORE generating any performance output."
---

# Cypress Performance Audit Skill

## Objective

Reduce CI runtime, eliminate flakiness, and enforce deterministic test execution.

## Performance Audit Checklist

### Auth Performance (Biggest Win)

- [ ] `cy.session()` used inside `cy.ensureAuthenticated()` — caches auth per session ID
- [ ] Auth not re-run in every `beforeEach` if `before()` cached it already
- [ ] `cy.origin()` used (not cy.visit to 3rd-party auth URL) for SSO flows

**Industry data**: Auth caching with `cy.session()` reduces login time by 60-80% in typical CI runs.

### API Performance

- [ ] `cy.apiInterceptAll()` used instead of individual `cy.apiIntercept()` per call (reduces setup overhead)
- [ ] Intercepts set in `before()` when all tests in suite use same API set
- [ ] Fixtures used for stable data — no live API calls in smoke tests

### Selector Performance

- [ ] `[data-cy="..."]` used — fastest selector strategy (no CSS engine traversal)
- [ ] No `:nth-child`, `:first`, `:last` — these re-evaluate every retry
- [ ] `.within()` used to scope selectors to container (avoids full-DOM search)

### Test Structure Performance (Cypress Official)

- [ ] No single-assertion micro-tests — combined into logical blocks (resetting test state is expensive)
- [ ] `beforeEach` for state that differs per test; `before` for shared one-time setup
- [ ] No `afterEach` cleanup — unreliable and adds overhead; use `beforeEach` for reset
- [ ] Specs split by concern — large single spec files run slower in parallel

### CI Performance

- [ ] Tests tagged with `@cypress/grep` for selective runs (smoke vs e2e)
- [ ] `numTestsKeptInMemory` configured (default 50 can cause memory pressure)
- [ ] `video: false` in CI unless needed (video recording adds 10-20% overhead)
- [ ] `experimentalMemoryManagement: true` enabled for Chrome in CI

## Flakiness Indicators

| Pattern                          | Risk   | Fix                                              |
| -------------------------------- | ------ | ------------------------------------------------ |
| `cy.wait(ms)` anywhere           | HIGH   | Replace with `cy.apiWait()` or `.should()` chain |
| `cy.visit()` before intercepts   | HIGH   | Move intercepts first                            |
| No `cy.session()`                | MEDIUM | Wrap auth in session                             |
| `afterEach` teardown             | MEDIUM | Move to `beforeEach`                             |
| Broad selectors (`.class`)       | MEDIUM | Replace with `[data-cy="..."]`                   |
| Full API responses in beforeEach | LOW    | Move to `before()` if data is shared             |

## Output Contract

1. **Auth savings**: estimated time reduction from `cy.session()` fix.
2. **Flakiness risks**: ordered HIGH/MEDIUM/LOW with file refs.
3. **Quick wins**: top 3 changes with biggest impact.
4. **Estimated CI improvement**: rough reduction in minutes if fixes applied.
