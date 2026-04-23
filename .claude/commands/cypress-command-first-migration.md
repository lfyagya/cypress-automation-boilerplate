# Cypress Command-First Migration

Use this skill to migrate a legacy `*.actions.js` file or page-object wrapper to command-first architecture.

## Inputs required

- Legacy file path(s) to migrate
- Target module name

## Required output order

1. **Audit** — what the legacy file contains:
   - Methods/functions and what they do
   - Selectors used (are any already in `cypress/configs/ui/**`?)
   - Routes used (are any already in `cypress/configs/app/routes.js`?)
   - API calls made (are any already in `cypress/configs/api/**`?)

2. **Duplication check** — existing commands that already cover this behavior

3. **Migration plan**:
   - New or updated config entries needed (UI + API + routes)
   - New or updated command registrations needed
   - Which legacy methods map to which new commands
   - Files to delete after migration

4. **Migration output** (in order):
   - Config additions/updates
   - Command additions/updates (as `Cypress.Commands.add(...)` registrations)
   - `cypress/support/commands.js` import update
   - Test spec updates (replace legacy calls with `cy.*` commands)

5. **Cleanup** — list of legacy files safe to delete after migration

## Rules

- Never create a migration that re-introduces the page-object pattern
- Each migrated method becomes its own named `cy.*` command — not a wrapper object
- Selectors from the legacy file go in `cypress/configs/ui/**` — not inline in commands
- Do not leave dead code — delete the legacy file once migration is complete
