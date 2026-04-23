# API Documentation Generator

Use this skill to generate or update API layer documentation for a module.

## Inputs required

- Module name
- API config file path: `cypress/configs/api/modules/[module]/[module].api.js`
- Any command files that use the API: `cypress/support/commands/modules/[module].commands.js`

## Required output order

1. Module overview — what the module tests and what APIs it depends on
2. API entry table — for each entry in the config:
   - Alias name
   - HTTP method
   - Endpoint pattern
   - What the response contains
   - Which commands use this alias
3. Intercept usage guide:
   - `cy.apiIntercept(MODULE_API.ENTRY)` — single intercept
   - `cy.apiInterceptAll(MODULE_API)` — all entries
   - `cy.apiWait(MODULE_API.ENTRY)` — wait and assert status
4. Schema validation (if schemas exist in `cypress/fixtures/schemas/`)
5. Example spec showing the complete intercept → wait → assert flow

## Rules

- Use exact alias names from the config file — do not invent or paraphrase
- Every code example must be runnable — no placeholder comments
- Document only what exists — do not describe future or planned entries
- Output format: Markdown suitable for `docs/api-layer-guide.md` or a module-specific doc file
