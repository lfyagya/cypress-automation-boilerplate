---
name: detect-duplication
description: 'Run before creating any new Cypress config, command, or spec. Returns REUSE_EXISTING / EXTEND_EXISTING / NEW_FILE_JUSTIFIED verdict.'
---

# Detect Duplication Before Code

## When to run this skill

Run `/detect-duplication` **before creating any new file** — config, command, helper, utility, or spec.

This is a mandatory first step. If you skip it and create a duplicate, the pre-merge QA gate will block the PR.

## When NOT to run this skill

- After you have already written the code (run it before, not after)
- For renaming or deleting files (duplication check does not apply)

---

## What this skill does

Searches the codebase for existing configs, commands, and specs that match or overlap with what you are about to create. Returns a verdict before you write a single line.

## Inputs Required

- What you want to create (short description)
- Target module or feature name
- Test type: `e2e`, `smoke`, or `shared`
- File types you plan to add or change

## Output Order

1. Existing reusable matches — exact file paths
2. Near-duplicate matches that should be extended instead of cloned
3. Genuine gaps — what does not exist and why a new file is justified
4. Recommended reuse target by file path
5. Files that must NOT be created (duplicate ownership)
6. Consolidation actions required before adding anything new
7. Final verdict: `REUSE_EXISTING` / `EXTEND_EXISTING` / `NEW_FILE_JUSTIFIED`

## Search Scope

- `cypress/configs/ui/**` — UI selector constants
- `cypress/configs/api/**` — API intercept configs
- `cypress/configs/app/routes.js` — route constants
- `cypress/support/commands/**` — all registered commands
- `cypress/tests/**` — existing specs

## Rules

- Duplicate command names are blockers — one name, one owner
- Duplicate selector constants are blockers — one constant per element
- Duplicate API aliases are blockers — aliases must be unique across all configs
- Prefer extending the closest reusable layer over creating a sibling file
- Do not approve new `*.actions.js` files or page-object wrappers under any circumstances
