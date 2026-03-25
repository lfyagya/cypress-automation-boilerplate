# Cypress Framework Core Rules

## Canonical Rule Set

1. **Architecture**: Config → Custom Commands → Tests.
2. **Config Ownership**: Keep selectors/endpoints/routes in `cypress/configs/**`; avoid hardcoded literals.
3. **Command Ownership**: Runtime commands belong in `cypress/support/commands/**` with unique names.
4. **Test Thinness**: Specs orchestrate `cy.*` commands; avoid embedding business logic in specs.
5. **Deterministic Timing**: No hard waits (`cy.wait(ms)`); use deterministic API/UI conditions.
6. **New Work Constraints**: No new `*.actions.js` and no new page-object wrappers.
7. **Auth**: Call `cy.ensureAuthenticated()` in `before()` or `beforeEach()` for any authenticated test.

## Layer Responsibilities

| Layer    | Location                      | Responsibility                                               |
| -------- | ----------------------------- | ------------------------------------------------------------ |
| Config   | `cypress/configs/**`          | Pure constants — endpoints, selectors, routes, scenario data |
| Core     | `cypress/support/core/**`     | Framework internals — API engine, schema validation          |
| Commands | `cypress/support/commands/**` | Reusable Cypress commands consumed by tests                  |
| Tests    | `cypress/tests/**`            | Business intent, `cy.*` orchestration, assertions            |
| Schemas  | `cypress/schemas/**`          | API response shape contracts                                 |
| Fixtures | `cypress/fixtures/**`         | Static test data                                             |

## Details

For full standards, examples, and folder strategy, refer to `/docs/framework-standards.md`.
