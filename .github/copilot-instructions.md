# Cypress Automation Framework - Copilot Instructions

Preferred model: Claude Sonnet 4.6

## Architecture Policy (Mandatory)

- Use **Config → Custom Commands → Tests** architecture.
- New work must be **command-first**.
- Do not create or use new `*.actions.js` files.
- Do not create or use page-object wrappers.

## Non-Negotiable Rules

- Use selectors/endpoints from config files; avoid hardcoded literals.
- Call `cy.ensureAuthenticated()` in `before()` and `beforeEach()` when auth is required.
- Prefer config-driven intercept setup via `cy.apiIntercept(...)` or `cy.apiInterceptAll(...)`.
- Never use `cy.wait(ms)` — use deterministic API/UI conditions.
- Keep command names clear and ownership unique (one name, one file).

## Canonical Documentation

- `/docs/README.md`
- `/docs/framework-standards.md`
- `/docs/framework-maintenance-guide.md`
- `/docs/support-commands-instructions.md`
- `/docs/api-layer-guide.md`

## Copilot Operating Reference

- `/.github/copilot-operating-playbook.md`
- `/.github/FRAMEWORK_RULES.md`

## Command Layer Conventions

- Runtime command registrations: `cypress/support/commands/**/*.commands.js`
- Global command imports: `cypress/support/commands.js`

## Prompt Context Requirements

Before generating or modifying test/command code, read these context files:

- Routes: `cypress/configs/app/routes.js`
- UI selectors: `cypress/configs/ui/modules/**` and `cypress/configs/ui/shared/**`
- API aliases/endpoints: `cypress/configs/api/**`

Do not hardcode URLs, selectors, or raw API endpoints when config constants exist.

## Test Authoring Expectations

- Tests in `cypress/tests/**/*.cy.js` call `cy.*` commands directly.
- Tests import UI/API configs only for assertions and test-data wiring.
- Avoid architecture wrappers that hide command ownership.
