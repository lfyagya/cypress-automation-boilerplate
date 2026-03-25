---
description: Use when generating a new Cypress test spec file for a module feature (smoke or e2e).
agent: agent
model: Claude Sonnet 4.6
---

Generate a production-ready Cypress test spec file.

## Inputs

- Module name (kebab-case): `${input:moduleName}` (e.g. `loan-applications`)
- Feature being tested: `${input:featureLabel}` (e.g. `Dashboard Table Loading`)
- Test type: `${input:testType}` (smoke | e2e)
- Tag(s) for grep: `${input:tags}` (e.g. `@smoke,@loan-applications`)
- Related command prefix: `${input:commandPrefix}` (e.g. `LoanApplications`)
- Related API config: `${input:apiConfigPath}` (e.g. `@configs/api/modules/loan-applications/loan-applications.api.js`)
- Related UI config: `${input:uiConfigPath}` (e.g. `@configs/ui/modules/loan-applications/loan-applications.ui.js`)

## Output: `cypress/tests/${input:moduleName}/${input:testType}/${input:moduleName}-${input:testType}.cy.js`

## Pattern

```javascript
/**
 * @fileoverview ${input:moduleName} — ${input:featureLabel}
 * ${input:testType} tests for ${input:featureLabel}.
 *
 * Tags: ${input:tags}
 */
import { MODULE_API } from '${input:apiConfigPath}';
import { MODULE_UI } from '${input:uiConfigPath}';

describe(
  '${input:moduleName}: ${input:featureLabel}',
  { tags: ['${input:tags}'] },
  () => {
    before(() => {
      // Auth cached via cy.session() inside ensureAuthenticated
      cy.ensureAuthenticated();
    });

    beforeEach(() => {
      cy.ensureAuthenticated();
      // API intercepts MUST be set before cy.visit() — Cypress official best practice
      cy.intercept${input:commandPrefix}APIs();
      cy.navigate${input:commandPrefix}();
    });

    it('loads the dashboard and displays data', () => {
      cy.assert${input:commandPrefix}TableLoaded();
    });

    it('shows correct page title', () => {
      cy.title().should('include', '${input:featureLabel}');
    });
  }
);
```

## Industry Rules (From Cypress Official Docs)

- `cy.ensureAuthenticated()` in BOTH `before()` and `beforeEach()` — session is cached
- API intercepts registered BEFORE `cy.visit()` / navigation calls
- Multiple assertions per test are fine and performant in E2E (unlike unit tests)
- Each test must be able to run independently (`it.only` should pass in isolation)
- Never couple test state — if test B needs test A to run first, combine them
- Use `@cypress/grep` tags for selective runs
- State reset in `beforeEach`, never `afterEach` (unreliable if test crashes)
- No `cy.wait(ms)` — use `cy.apiWait()` or `.should()` assertion chains
