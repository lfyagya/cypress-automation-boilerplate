# Cypress Architecture Review

Use this skill to validate that changed files comply with the framework's architecture rules.

## Inputs required

- List of files to review (or the current git diff)
- Test type: `e2e` or `smoke`

## Required output order

1. **Hard violations** (must fix before merge):
   - `cy.wait(number)` hard waits
   - `*.actions.js` imports or new files
   - Page-object imports or new files
   - Hardcoded selectors in `*.cy.js` or `*.commands.js`
   - Hardcoded routes in `cy.visit()` (except allowlisted `/`)
   - Duplicate command names

2. **Config completeness violations**:
   - Selectors used in specs not found in `cypress/configs/ui/**`
   - API aliases used not found in `cypress/configs/api/**`
   - Routes used not in `cypress/configs/app/routes.js`
   - Config constants not using `Object.freeze()`

3. **Test quality issues**:
   - Missing `cy.ensureAuthenticated()` in auth-required specs
   - `cy.apiIntercept()` called after `cy.visit()` (intercept order bug)
   - Smoke tests with write operations (POST/PUT/PATCH/DELETE)

4. **Final verdict**: COMPLIANT / NON-COMPLIANT (list all blockers)

## Rules

- Search the actual files — do not assume compliance from file names
- Every finding must include file:line reference
- Distinguish between hard blockers and warnings
