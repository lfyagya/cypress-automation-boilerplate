---
name: api-documentation-generator
description: 'Generate API documentation for a module. Documents each intercept alias, method, endpoint pattern, and example usage.'
---

# API Documentation Generator

Use this skill to generate documentation for an API config module.

## Inputs required

- Module name
- API config path: `cypress/configs/api/modules/[module]/[module].api.js`
- Command file path: `cypress/support/commands/modules/[module].commands.js`

## Required output

1. Module overview — what the module tests and what APIs it depends on
2. API entry table:
   - Alias | Method | Endpoint | Response description | Commands that use it
3. Usage examples:
   - `cy.apiIntercept(MODULE_API.ENTRY)` — single intercept
   - `cy.apiInterceptAll(MODULE_API)` — all entries at once
   - `cy.apiWait(MODULE_API.ENTRY)` — wait and assert 200
4. Schema validation guide (if schemas exist in `cypress/fixtures/schemas/`)
5. Full spec example showing intercept → navigate → wait → assert flow

## Rules

- Use exact alias names from the config — do not paraphrase
- Every code example must be runnable
- Document only what exists — no future/planned entries
- Output format: Markdown for `docs/api-layer-guide.md`
