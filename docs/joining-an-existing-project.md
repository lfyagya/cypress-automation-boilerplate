# Joining an Existing Project

> **This is a tutorial for engineers joining mid-project.** If someone else already set up this framework and you are joining the team, this is your starting point — not `getting-started.md`.

---

## What you will do

1. Understand the modules that already exist
2. Find the commands available to you
3. Write your first test without breaking what's already there
4. Know when to create something new vs. reuse what exists

Time: ~20 minutes

---

## Step 1 — Orient Yourself

First, understand what modules already exist in the project:

```bash
ls cypress/configs/ui/modules/
ls cypress/configs/api/modules/
ls cypress/tests/
```

Each folder is a feature module. For every module you see, there are four matching files:

```text
cypress/configs/api/modules/[name]/[name].api.js   ← API intercepts
cypress/configs/ui/modules/[name]/[name].ui.js     ← UI selectors
cypress/support/commands/modules/[name].commands.js ← Commands
cypress/tests/[name]/smoke/[name]-smoke.cy.js       ← Specs
```

Pick the module closest to the feature you are working on. Read all four files before writing anything.

---

## Step 2 — Find Available Commands

Every command registered in this project is listed in `cypress/support/commands.js`. Open it to see what modules are registered.

To search for a specific command:

```bash
grep -r "Cypress.Commands.add" cypress/support/commands/
```

To find commands related to a specific module:

```bash
grep -r "Cypress.Commands.add" cypress/support/commands/modules/payments.commands.js
```

Common commands available everywhere (no import needed):

| Command | What it does |
| ------- | ------------ |
| `cy.ensureAuthenticated()` | Session-cached login — use in every `beforeEach()` |
| `cy.getByTestId('id')` | `cy.get('[data-cy="id"]')` shorthand |
| `cy.step('message')` | Labelled step in Cypress command log |
| `cy.apiIntercept(config, key)` | Register one API intercept |
| `cy.apiWait('@alias')` | Wait for a registered intercept |
| `cy.apiStub(config, key, response)` | Return a mocked response |

---

## Step 3 — Run the Existing Tests

Before writing anything, run the existing suite to confirm it passes:

```bash
npm run cy:run:smoke
```

If tests fail before you've touched anything, that is a pre-existing issue — do not try to fix it as part of your first contribution. Flag it to the team.

---

## Step 4 — Before Writing Anything New

**Always run `/detect-duplication` first.** This is the most important step.

Search for existing configs and commands that match what you need:

```bash
# Search for existing selectors
grep -r "data-cy" cypress/configs/ui/

# Search for existing API aliases
grep -r "alias:" cypress/configs/api/

# Search for existing commands by verb
grep -r "Cypress.Commands.add(\"visit" cypress/support/commands/
grep -r "Cypress.Commands.add(\"assert" cypress/support/commands/
```

If something already exists — **use it**. Do not create a duplicate. One selector, one owner. One command name, one file.

---

## Step 5 — Adding a Test to an Existing Module

If the module and its commands already exist, adding a new test is simple:

```javascript
// cypress/tests/payments/smoke/payments-smoke.cy.js

describe("Payments — Smoke", { tags: ["@payments", "@smoke"] }, () => {
  beforeEach(() => {
    cy.ensureAuthenticated();
  });

  // existing tests...

  it("shows empty state when no payments exist", () => {
    cy.visitPayments();
    cy.assertPaymentsEmpty();  // command already exists
  });
});
```

If the assertion command does not exist yet, add it to the module's command file — not the spec.

---

## Step 6 — Adding to an Existing Module (new endpoint or selector)

If you need something new in an existing module:

**New selector** → add a constant to the existing UI config file. Do not add it directly to a command or spec.

**New API endpoint** → add a frozen entry to the existing API config file. Follow the same shape as existing entries.

**New command** → add it to the existing module command file. Check the name is not already used anywhere.

See [docs/framework-maintenance-guide.md](framework-maintenance-guide.md) for the exact patterns.

---

## Step 7 — Creating a Completely New Module

Only do this if no existing module covers the feature you are testing.

Follow the 6-step module checklist in [docs/getting-started.md](getting-started.md#step-7--write-your-first-module).

Before starting: run `/detect-duplication`, confirm the module does not exist, and check `cypress/support/commands/common/` for any shared commands you can reuse.

---

## What "Thin Tests" Means in Practice

If you see existing tests that look like this:

```javascript
it("loads the payments list", () => {
  cy.visitPayments();
  cy.assertPaymentsLoaded();
});
```

That is correct — two lines, no selectors, no URLs, no logic. The commands own everything.

If you are tempted to write something like this:

```javascript
it("loads the payments list", () => {
  cy.visit("/payments");
  cy.get('[data-cy="payments-table"]').should("be.visible");
});
```

Stop. Move the navigation to a `cy.visitPayments()` command and the assertion to a `cy.assertPaymentsLoaded()` command. Then the spec becomes two lines.

This keeps every test readable, every selector in one place, and every change isolated to one file.

---

## Understanding the Pre-Merge Gate

Before you open a PR, run:

```bash
# Quick check
/verification-loop

# Or full gate
# Use the pre-merge-qa-gate agent
```

The CI pipeline also runs `cypress-rules.yml` on every PR — it blocks merge if any non-negotiable rule is violated. The same validation runs locally via `.claude/hooks/` on every file write.

If CI blocks your PR, read the error output: it will name the exact file and line that violates a rule.

---

## Getting Help

| Problem | Where to go |
| ------- | ----------- |
| Test is failing | `cypress-bug-hunter` agent or `/cypress-debug-playbook` |
| Not sure if something already exists | `/detect-duplication` skill |
| Need to understand the architecture | [docs/framework-standards.md](framework-standards.md) |
| Need to add a new module | [docs/framework-maintenance-guide.md](framework-maintenance-guide.md) |
| CI pipeline failing | [docs/ci-cd-guide.md](ci-cd-guide.md) |
| Command doesn't exist yet | [docs/support-commands-instructions.md](support-commands-instructions.md) |
