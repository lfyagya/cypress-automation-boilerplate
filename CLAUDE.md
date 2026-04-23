# Cypress Automation Boilerplate — Claude Code

> A production-ready, command-first Cypress framework any team can fork, adapt, and ship.
> AI-powered from day one with Claude Code and GitHub Copilot built in.

---

## Who is this for?

Any engineering team that:
- Is starting a new web app and needs a maintainable test automation foundation
- Is migrating from page-object patterns or scattered test files
- Wants AI assistance (Claude Code + GitHub Copilot) wired into the framework from the start

This boilerplate is application-agnostic. Swap out the example modules for your app.

---

## What is this?

A three-layer Cypress framework with a single, non-negotiable architecture:

| Layer          | Location                        | Rule                                                  |
| -------------- | ------------------------------- | ----------------------------------------------------- |
| **Config**     | `cypress/configs/**`            | Selectors, endpoints, routes — all `Object.freeze()`  |
| **Commands**   | `cypress/support/commands/**`   | Atomic `cy.*` commands — one owner per name           |
| **Tests**      | `cypress/tests/**/*.cy.js`      | Thin orchestration of `cy.*` calls only               |

**Included out of the box:**

- `example/` module — full reference (UI config + API config + commands + spec)
- `saucedemo/` module — working example against a real demo app
- `cy.apiIntercept()` engine — config-driven network intercepts with auto-aliasing
- `cy.validateSchema()` — JSON schema validation for API responses
- `cy.ensureAuthenticated()` — session-cached auth (adapt to your auth flow)
- `cy.getByTestId()` — data-cy attribute selector
- Multi-environment support (`cypress.env.dev.json`, `.qa.json`, `.prod.json`)
- HTML test reports via Cypress Mochawesome Reporter
- Tag-based test filtering via `@cypress/grep`
- Path aliases (`@configs`, `@support`, `@fixtures`) via Webpack preprocessor

---

## When to use what?

### Agents — multi-step, reasoning-heavy tasks

| Situation                             | Agent                       |
| ------------------------------------- | --------------------------- |
| Writing a new test or command         | `cypress-test-automation`   |
| Reviewing code before merge           | `cypress-reviewer`          |
| Investigating a CI run failure        | `cypress-cloud-investigator`|
| Debugging a failing test locally      | `cypress-bug-hunter`        |
| Auditing for flakiness or slowness    | `cypress-performance-auditor` |
| Full QA gate before opening a PR      | `pre-merge-qa-gate`         |
| Writing framework or API docs         | `documentation-writer`      |
| Opening a pull request                | `pr-creator`                |

### Skills — structured single-purpose workflows

| Task                                  | Skill                         |
| ------------------------------------- | ----------------------------- |
| Check for duplication before writing  | `/detect-duplication`         |
| Convert a Jira ticket to a test plan  | `/jira-to-cypress`            |
| Validate architecture compliance      | `/cypress-architecture-review`|
| Debug root-cause trace                | `/cypress-debug-playbook`     |
| Migrate legacy test to command-first  | `/cypress-command-first-migration` |
| Audit test suite performance          | `/cypress-performance-audit`  |
| Generate API documentation            | `/api-documentation-generator`|
| Run full pre-merge QA gate            | `/verification-loop`          |
| Write regression test after a bug fix | `/ai-regression-testing`      |

### npm scripts — running tests

| What                      | Command                                               |
| ------------------------- | ----------------------------------------------------- |
| Interactive runner        | `npm run cy:open`                                     |
| All tests headless        | `npm run cy:run`                                      |
| Smoke tests only          | `npm run cy:run:smoke`                                |
| By tag                    | `npm run cy:run:tag -- --env grepTags=@tagname`       |
| Against specific env      | `npm run cy:run -- --env configFile=qa`               |

---

## Where does everything live?

```
cypress/
├── configs/                         ← All pure data — never logic here
│   ├── app/
│   │   └── routes.js                ← Central URL/path registry
│   ├── api/
│   │   └── modules/[module]/
│   │       └── [module].api.js      ← API intercept definitions + aliases
│   └── ui/
│       ├── modules/[module]/
│       │   └── [module].ui.js       ← Selector constants (data-cy preferred)
│       └── shared/
│           └── navigation.ui.js     ← Shared navigation selectors
│
├── support/
│   ├── commands/                    ← All custom commands live here
│   │   ├── common/                  ← Framework-wide shared commands
│   │   │   ├── auth.commands.js     ← cy.ensureAuthenticated(), cy.logout()
│   │   │   ├── navigation.commands.js
│   │   │   ├── table.commands.js
│   │   │   └── ui.commands.js       ← cy.getByTestId(), cy.step()
│   │   └── modules/                 ← Feature-specific commands
│   │       └── [module].commands.js
│   ├── core/api/                    ← Framework engine — do not modify
│   │   ├── api.engine.js
│   │   ├── api.commands.js          ← cy.apiIntercept(), cy.apiWait()
│   │   └── status-codes.js
│   ├── commands.js                  ← Central command import registry
│   └── e2e.js                       ← Cypress support entry point
│
└── tests/                           ← Specs — thin cy.* orchestration only
    └── [module]/
        ├── smoke/
        │   └── [module]-smoke.cy.js
        └── e2e/
            └── [module]-e2e.cy.js

docs/                                ← Read these before writing any code
├── getting-started.md               ← Setup + first test walkthrough
├── framework-standards.md           ← Architecture rules + naming conventions
├── api-layer-guide.md               ← API engine, intercepts, schema validation
├── framework-maintenance-guide.md   ← Adding modules, updating configs
└── support-commands-instructions.md ← Command authoring guide

.claude/                             ← Claude Code config (auto-enforced)
├── settings.json                    ← Hooks + permissions
├── hooks/                           ← Automatic rule enforcement on every write
├── agents/                          ← Claude subagents
└── commands/                        ← Claude skills (/skill-name)

.github/                             ← GitHub Copilot config
├── copilot-instructions.md          ← Global Copilot context
├── agents/                          ← Copilot agents
├── skills/                          ← Copilot custom skills
└── prompts/                         ← Slash-command prompts
```

---

## Why this architecture?

### Why Config → Commands → Tests?

**Selectors change.** If a CSS class is renamed in your app, you update one constant in one config file — not every test that uses it. The config layer is the single source of truth.

**Commands are reusable.** A `cy.loginAs('admin')` command is called from 50 tests. If login changes, you fix one command — not 50 tests.

**Tests stay readable.** A spec that reads like `cy.navigateTo('products'); cy.assertProductList()` is self-documenting. A spec with `cy.get('.sidebar ul li:nth-child(2) a').click()` is a maintenance trap.

### Why no page objects?

Page objects duplicate the config layer's purpose with hidden ownership. Their methods accumulate test logic that belongs in commands. Command-first gives you the same abstraction with explicit ownership and no hidden layer.

### Why no `cy.wait(number)`?

Hard waits are lies — they mask timing bugs rather than fixing them. `cy.apiIntercept()` + `cy.apiWait()` wait for the exact API response the test depends on. The test only proceeds when the data is actually there.

### Why AI-powered from day one?

Framework rules are complex and easy to violate. Hooks enforce them automatically. Agents and skills let Claude Code and Copilot reason within the correct architecture without rediscovering the rules each time.

---

## Non-Negotiable Rules

```
NEVER  →  cy.wait(number)              Use cy.apiWait() or .should('be.visible')
NEVER  →  hardcoded selectors          Use constants from cypress/configs/ui/**
NEVER  →  hardcoded endpoints/routes   Use constants from cypress/configs/api/** and routes.js
NEVER  →  new *.actions.js files       Command-first only
NEVER  →  new page-object wrappers     Command-first only
NEVER  →  real credentials in code     Use cypress.env.json (local) or env vars (CI)
NEVER  →  create new config/command    Without searching for an existing one first

ALWAYS →  cy.ensureAuthenticated()     In beforeEach() for any auth-required test
ALWAYS →  config constants             Check configs before adding any selector
ALWAYS →  one command = one owner      Verify name is unique in commands.js
ALWAYS →  data-cy attributes           For all new selectors you add to the app
```

Hooks in `.claude/hooks/` enforce these automatically on every file write.

---

## Adapting This Boilerplate for Your Application

1. **Remove example modules** — delete `saucedemo/` and `example/` after studying them
2. **Update `cypress.env.json`** — set `baseUrl`, `username`, `password`, `authUrl` for your app
3. **Adapt `cy.ensureAuthenticated()`** in `cypress/support/commands/common/auth.commands.js`
4. **Add your modules** using the checklist:

```
1. API config    → cypress/configs/api/modules/[module]/[module].api.js
2. UI config     → cypress/configs/ui/modules/[module]/[module].ui.js
3. Routes        → cypress/configs/app/routes.js
4. Commands      → cypress/support/commands/modules/[module].commands.js
5. Register      → cypress/support/commands.js
6. Spec          → cypress/tests/[module]/smoke/[module]-smoke.cy.js
```

---

## API Config Pattern

Every API config follows this exact shape:

```javascript
import { HTTP_STATUS } from "@support/core/api/status-codes.js";

export const MODULE_API = Object.freeze({
  LIST: Object.freeze({
    method: "GET",
    endpoint: "**/api/module/list**",
    alias: "moduleList",
    expectedStatus: HTTP_STATUS.OK,
  }),
});
```

---

## Agent and Skill Map

| Task                                       | Use This                            |
| ------------------------------------------ | ----------------------------------- |
| Write or migrate a test                    | `cypress-test-automation` agent     |
| Review before merge                        | `cypress-reviewer` agent            |
| Investigate CI failures from Cypress Cloud | `cypress-cloud-investigator` agent  |
| Debug a failing test (local/manual)        | `cypress-bug-hunter` agent          |
| Optimize slow/flaky tests                  | `cypress-performance-auditor` agent |
| Full QA gate (all checks)                  | `pre-merge-qa-gate` agent           |
| Write documentation                        | `documentation-writer` agent        |
| Open a pull request                        | `pr-creator` agent                  |

| Workflow                                        | Skill                              |
| ----------------------------------------------- | ---------------------------------- |
| Duplication check before new code               | `detect-duplication`               |
| Jira ticket to Cypress test plan                | `jira-to-cypress`                  |
| Migrate legacy action/page-obj to command-first | `cypress-command-first-migration`  |
| Review architecture compliance                  | `cypress-architecture-review`      |
| Debug root-cause trace                          | `cypress-debug-playbook`           |
| Runtime/flake analysis                          | `cypress-performance-audit`        |
| Generate API docs                               | `api-documentation-generator`      |
| Pre-merge QA gate (6-phase)                     | `verification-loop`                |
| Post-bug regression test                        | `ai-regression-testing`            |

---

## Pre-Merge Checklist

```
[ ] No hardcoded selectors — all from cypress/configs/ui/**
[ ] No hardcoded endpoints/routes — all from cypress/configs/api/** and routes.js
[ ] No new *.actions.js or page-object files
[ ] No cy.wait(number) — grep -r "cy\.wait([0-9]" cypress/ shows zero
[ ] cy.ensureAuthenticated() in beforeEach() of auth-required specs
[ ] New command registered in cypress/support/commands.js
[ ] Lint passes: npm run lint
[ ] If bug fix: regression test named [BUG-NNN] present
```

Run the `pre-merge-qa-gate` agent for a full PASS / PASS_WITH_ACTIONS / BLOCK verdict.

---

## Canonical Documentation

- `docs/getting-started.md` — Setup and your first test
- `docs/framework-standards.md` — Architecture rules and naming conventions
- `docs/api-layer-guide.md` — API engine, intercepts, schema validation
- `docs/framework-maintenance-guide.md` — Adding modules, updating configs
- `docs/support-commands-instructions.md` — Command authoring guide
