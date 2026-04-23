# Detect Duplication Before Code

Use this skill before creating any new Cypress config, command, helper, utility, or spec.

## Inputs required

- Requested change summary
- Target module/feature
- Test type: `e2e`, `smoke`, or `shared`
- Candidate file types to add or change

## Required output order

1. Existing reusable matches
2. Near-duplicate matches that should be extended instead of cloned
3. Gaps that genuinely require new code
4. Recommended reuse target by file path
5. Files that must not be created because they would duplicate ownership
6. Consolidation or refactor actions required before adding anything new
7. Final decision:
   - `REUSE_EXISTING`
   - `EXTEND_EXISTING`
   - `NEW_FILE_JUSTIFIED`

## Rules

- Search for overlap across UI configs, API configs, routes, commands, helpers, and tests.
- Treat duplicate command names, duplicate selectors, and duplicate API aliases as blockers.
- Prefer improving the closest reusable layer over creating a sibling abstraction.
- If no reusable match exists, state exactly why a new file is justified.
- Do not approve new `*.actions.js` files or page-object wrappers.
- For smoke tests, confirm the reusable layer remains read-only.
