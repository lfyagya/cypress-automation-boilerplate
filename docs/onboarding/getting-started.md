# Getting Started

> **This is a tutorial.** You will go from zero to a passing test in a new module. Read it top to bottom, run every command, and you will understand the framework by the end.

## What you will do

1. Install and configure the boilerplate
2. Run the included reference tests to verify your setup
3. Study the reference module to understand the 3-layer pattern
4. Remove the reference module and build your first real module

Time: ~30 minutes

---

## Prerequisites

- Node.js 18 or above — check with `node -v`
- npm 9 or above — check with `npm -v`
- A running instance of your target application, or a staging URL
- VS Code with GitHub Copilot (recommended) or Claude Code CLI

---

## Step 1 — Install

```bash
git clone <your-repo-url>
cd cypress-automation-boilerplate
npm install
```

Verify it worked:

```bash
npx cypress --version
```

You should see Cypress version output. If you see an error, check your Node version.

---

## Step 2 — Configure Your Environment

```bash
cp cypress.env.example.json cypress.env.json
```

Open `cypress.env.json` and fill in your app's values:

```json
{
  "baseUrl": "https://your-app.com",
  "username": "your-test-user",
  "password": "your-test-password",
  "authUrl": "/api/auth/login"
}
```

**This file is gitignored. Never commit it.** For CI, use environment variables instead.

| File | Purpose | Commit? |
| ---- | ------- | ------- |
| `cypress.env.json` | Local secrets | Never |
| `cypress.env.example.json` | Template with placeholder values | Yes |
| `cypress/environments/cypress.env.dev.json` | Dev environment config | Yes |
| `cypress/environments/cypress.env.qa.json` | QA environment config | Yes |
| `cypress/environments/cypress.env.prod.json` | Production environment config — use CI secrets for credentials | Yes |

---

## Step 3 — Verify Setup with the Reference Tests

The boilerplate ships with a working `saucedemo/` module that tests against a real public demo app. Run it to confirm everything is installed correctly.

```bash
npm run cy:open
```

In the Cypress runner, select **saucedemo-smoke.cy.js** and run it. All tests should pass.

**Checkpoint:** If the tests pass, your setup is correct. If they fail, check that `baseUrl` in your config matches the target app.

> The `saucedemo/` module is your reference implementation. Study it before writing your own module.

---

## Step 4 — Understand the 3-Layer Pattern

The boilerplate ships one reference module. Read it.

**`saucedemo/` — UI-only pattern reference** (saucedemo.com has no real API layer):

```text
cypress/configs/ui/modules/saucedemo/saucedemo.ui.js     ← Layer 1: selectors
cypress/support/commands/modules/saucedemo.commands.js   ← Layer 2: commands
cypress/tests/saucedemo/smoke/saucedemo-smoke.cy.js      ← Layer 3: spec
```

For the API config layer (`configs/api/modules/[module]/[module].api.js`), see the pattern in [docs/guides/framework-maintenance-guide.md](../guides/framework-maintenance-guide.md) — `saucedemo` has no API config to reference since the target app has no real API layer.

Notice:

- The spec file only calls `cy.*` commands. It contains no selectors, no URLs, no logic.
- The command file imports from the config files. It never hardcodes a selector or URL.
- The config files only contain frozen constants. No functions, no logic.

This is the pattern you will follow for every module you write.

> Full explanation of why: [docs/reference/framework-standards.md](../reference/framework-standards.md)

---

## Step 5 — Adapt Auth for Your Application

The boilerplate's `cy.ensureAuthenticated()` command handles session-cached login. You need to adapt it to your app's auth mechanism before you can write tests against protected pages.

Open `cypress/support/commands/common/auth.commands.js` and update:

- The login request URL (currently points to saucedemo)
- The request body shape (username/password field names)
- The session validation check (what proves the user is logged in)

Common patterns:

| Auth type | What to change |
| --------- | -------------- |
| Username + password form | Update the `cy.request()` body and URL |
| OAuth / Okta | Replace `cy.request()` with the appropriate redirect flow |
| Token in localStorage | Update the session validation to check `localStorage.getItem('token')` |
| Cookie-based | Update the session validation to check `cy.getCookie('session')` |

> Never hardcode credentials. Always read from `cypress.env.json` via `Cypress.env('username')`.

---

## Step 6 — Remove the Reference Module

Once you understand the pattern, delete it:

```bash
rm -rf cypress/tests/saucedemo
rm -rf cypress/configs/ui/modules/saucedemo
rm -rf cypress/support/commands/modules/saucedemo.commands.js
```

Then remove their import lines from `cypress/support/commands.js`.

---

## Step 7 — Write Your First Module

Before creating any file, search `cypress/configs/**` and `cypress/support/commands/**` to check if a config or command already exists for what you need.

Then follow the 6-step checklist:

### 1. API Config

Create `cypress/configs/api/modules/[yourmodule]/[yourmodule].api.js`:

```javascript
import { HTTP_STATUS } from "@core/api/status-codes.js";

export const YOURMODULE_API = Object.freeze({
  LIST: Object.freeze({
    method: "GET",
    endpoint: "**/api/yourmodule**",
    alias: "yourmoduleList",
    expectedStatus: HTTP_STATUS.OK,
  }),
});
```

### 2. UI Config

Create `cypress/configs/ui/modules/[yourmodule]/[yourmodule].ui.js`:

```javascript
export const YOURMODULE_UI = Object.freeze({
  LIST: Object.freeze({
    TABLE: '[data-cy="yourmodule-table"]',
    SEARCH_INPUT: '[data-cy="yourmodule-search"]',
  }),
});
```

> If your app does not have `data-cy` attributes yet, coordinate with your development team to add them before writing selectors.

### 3. Routes

Add to `cypress/configs/app/routes.js`:

```javascript
const YOURMODULE = Object.freeze({
  ROOT: "/yourmodule",
});

export const ROUTES = Object.freeze({
  // existing routes...
  YOURMODULE,
});
```

### 4. Commands

Create `cypress/support/commands/modules/[yourmodule].commands.js`:

```javascript
import { YOURMODULE_API } from "@configs/api/modules/yourmodule/yourmodule.api";
import { YOURMODULE_UI } from "@configs/ui/modules/yourmodule/yourmodule.ui";
import { ROUTES } from "@configs/app/routes";

Cypress.Commands.add("interceptYourmoduleRequests", () => {
  cy.apiIntercept(YOURMODULE_API, "LIST");
});

Cypress.Commands.add("visitYourmodule", () => {
  cy.interceptYourmoduleRequests();
  cy.visit(ROUTES.YOURMODULE.ROOT);
  cy.apiWait("@yourmoduleList");
});

Cypress.Commands.add("assertYourmoduleLoaded", () => {
  cy.get(YOURMODULE_UI.LIST.TABLE).should("be.visible");
});
```

### 5. Register

In `cypress/support/commands.js`, add:

```javascript
import "./commands/modules/yourmodule.commands";
```

### 6. Spec

Create `cypress/tests/[yourmodule]/smoke/[yourmodule]-smoke.cy.js`:

```javascript
describe("Yourmodule — Smoke", { tags: ["@yourmodule", "@smoke"] }, () => {
  beforeEach(() => {
    cy.ensureAuthenticated();
  });

  it("loads the yourmodule list", () => {
    cy.visitYourmodule();
    cy.assertYourmoduleLoaded();
  });
});
```

---

## Step 8 — Run Your Test

```bash
npm run cy:open
```

Select your new spec and run it. It should pass.

If it fails, use the `cypress-bug-hunter` agent to trace the root cause.

---

## What You Should Understand By Now

- The **Config layer** is immutable. No logic, no functions — only frozen constants.
- The **Commands layer** owns all actions and imports from configs. Never duplicates selectors or URLs.
- The **Tests layer** is thin. It calls commands and asserts. Nothing else.
- `cy.ensureAuthenticated()` must be in `beforeEach()` for every auth-required spec.
- Intercepts must be registered **before** `cy.visit()` fires.

---

## Next Steps

| What | Where |
| ---- | ----- |
| Understand the architecture rules deeply | [docs/reference/framework-standards.md](../reference/framework-standards.md) |
| Add more endpoints to your module | [docs/guides/framework-maintenance-guide.md](../guides/framework-maintenance-guide.md) |
| Learn the full API engine | [docs/reference/api-layer-guide.md](../reference/api-layer-guide.md) |
| Write better commands | [docs/guides/support-commands-instructions.md](../guides/support-commands-instructions.md) |
| Use AI tools effectively | [docs/guides/prompting-guide.md](../guides/prompting-guide.md) |
