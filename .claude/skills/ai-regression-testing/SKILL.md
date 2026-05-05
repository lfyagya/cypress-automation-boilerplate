# AI Regression Testing

Use this skill after fixing a bug to generate a regression test that prevents the bug from returning.

## Inputs required

- Bug description (what was broken)
- Root cause (what was wrong in the code)
- The fix that was applied
- File paths of changed code

## Required output order

1. Regression test name: `[BUG-NNN] regression: <exact description of the bug>`
2. Location: inside `context('Regression Tests')` block in the relevant spec file
3. Test body: reproduces the exact failing scenario, asserts the specific behavior that was broken
4. Any setup required (fixture, intercept, navigation)
5. Confirmation that the test would have caught the bug before the fix

## Rules

- The test name must be searchable in CI logs — include the bug ID
- The test must reproduce the exact failing scenario — not a happy path
- Do not assert more than what the bug was about — keep it focused
- Use config constants — no hardcoded selectors or routes
- If the bug was in a command, test the command directly
