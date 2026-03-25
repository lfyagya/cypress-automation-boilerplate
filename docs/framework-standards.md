# Framework Standards

## Architecture: Config → Commands → Tests

Every module has exactly three layers. No page objects. No action files.

```text
cypress/
  configs/
    api/modules/<name>/<name>.api.js    ← HTTP intercept definitions
    ui/modules/<name>/<name>.ui.js      ← [data-cy] selector constants
    app/routes.js                       ← URL path constants
  support/
    commands/modules/<name>.commands.js ← Verb-first Cypress commands
    core/api/                           ← Engine (do not modify per-project)
  tests/<name>/
    smoke/<name>-smoke.cy.js            ← Smoke specs
    e2e/<name>-e2e.cy.js               ← Full E2E specs
```

## Non-Negotiable Rules

| #   | Rule                                         | Why                                                         |
| --- | -------------------------------------------- | ----------------------------------------------------------- |
| 1   | NO page objects, NO action files             | Dual ownership causes drift; commands own logic             |
| 2   | NO `cy.wait(number)`                         | Timing-dependent; use `cy.apiWait('@alias')` or `.should()` |
| 3   | `[data-cy="..."]` selectors only             | Decoupled from CSS; stable across refactors                 |
| 4   | Auth via `cy.ensureAuthenticated()` only     | Ensures `cy.session()` caching                              |
| 5   | Intercepts registered BEFORE `cy.visit()`    | Requests can fire before Cypress registers listeners        |
| 6   | State reset in `beforeEach`, not `afterEach` | Reliable; `afterEach` does not run on test failure          |
| 7   | All URL paths from `ROUTES` constants        | Never hardcode a URL in a test or command                   |

## Folder Naming

```text
configs/api/modules/       kebab-case module name
configs/ui/modules/        same name as API module
support/commands/modules/  same name, +.commands.js
tests/<name>/smoke/        <name>-smoke.cy.js
tests/<name>/e2e/          <name>-e2e.cy.js
```

## File Naming

| Layer      | Pattern               | Example                |
| ---------- | --------------------- | ---------------------- |
| API config | `<name>.api.js`       | `payments.api.js`      |
| UI config  | `<name>.ui.js`        | `payments.ui.js`       |
| Commands   | `<name>.commands.js`  | `payments.commands.js` |
| Specs      | `<name>-<type>.cy.js` | `payments-smoke.cy.js` |
| Schemas    | `<name>.schema.js`    | `payments.schema.js`   |
| Fixtures   | `<name>.json`         | `payments.json`        |

## Selector Priority

| Score | Strategy            | Example                   |
| ----- | ------------------- | ------------------------- |
| 10/10 | `data-cy` attribute | `[data-cy="submit-btn"]`  |
| 3/10  | CSS class           | `.btn-primary`            |
| 2/10  | Tag + text          | `button:contains("Save")` |
| 1/10  | XPath               | `//button[@id="save"]`    |

**Only 10/10 is acceptable.** Raise a PR comment for anything lower.

## Tagging Strategy

Tests use `@cypress/grep` tags. Apply at the `describe` level for the module, `it` level for criticality.

```js
describe('Payments', { tags: ['@payments'] }, () => {
  it('loads the list', { tags: ['@smoke'] }, () => { ... });
  it('validates pagination', { tags: ['@e2e'] }, () => { ... });
});
```

Run subsets:

```bash
npx cypress run --env grepTags=@smoke
npx cypress run --env grepTags=@payments
```
