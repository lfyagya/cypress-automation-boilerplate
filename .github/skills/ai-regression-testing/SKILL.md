---
name: ai-regression-testing
description: 'Generate a regression test after fixing a bug. Ensures the exact failing scenario is covered and the fix is permanently verifiable.'
---

# AI Regression Testing

Use this skill after fixing a bug to generate a regression test.

## Inputs required

- Bug description (what was broken)
- Root cause (what was wrong in the code)
- Fix applied (files and changes)

## Required output

1. Regression test name: `[BUG-NNN] regression: <exact description>`
2. Location: inside `context('Regression Tests')` block in the relevant spec
3. Test body: reproduces the exact failing scenario, asserts the specific behavior that was broken
4. Intercept setup if the bug was API-related
5. Confirmation that the test would have caught the bug before the fix

## Rules

- Test name must be searchable in CI logs — include bug ID
- Test must reproduce the failing scenario — not a happy path
- Use config constants — no hardcoded selectors or routes
- Do not assert beyond what the bug was about — keep it focused
