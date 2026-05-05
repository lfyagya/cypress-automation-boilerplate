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

Agents spawn an independent context and reason across multiple steps. Use them for tasks that require investigation, judgment, or multi-file changes.

**Daily development** — these run on nearly every feature branch:

| Situation                             | Agent                          |
| ------------------------------------- | ------------------------------ |
| Writing a new test or command         | `cypress-test-automation`      |
| Reviewing code before merge           | `cypress-reviewer`             |
| Debugging a failing test locally      | `cypress-bug-hunter`           |
| Auditing for flakiness or slowness    | `cypress-performance-auditor`  |

**Workflow / release** — these run at specific workflow gates:

| Situation                             | Agent                       |
| ------------------------------------- | --------------------------- |
| Full QA gate before opening a PR      | `pre-merge-qa-gate`         |
| Investigating a CI run failure        | `cypress-cloud-investigator`|
| Opening a pull request                | `pr-creator`                |
| Writing framework or API docs         | `documentation-writer`      |

### Skills — structured single-purpose workflows

| Task                                  | Skill                               |
| ------------------------------------- | ----------------------------------- |
| Check for duplication before writing  | `/detect-duplication`               |
| Convert a Jira ticket to a test plan  | `/jira-to-cypress`                  |
| Validate architecture compliance      | `/cypress-architecture-review`      |
| Debug root-cause trace                | `/cypress-debug-playbook`           |
| Migrate legacy test to command-first  | `/cypress-command-first-migration`  |
| Audit test suite performance          | `/cypress-performance-audit`        |
| Generate API documentation            | `/api-documentation-generator`      |
| Run full pre-merge QA gate            | `/verification-loop`                |
| Write regression test after a bug fix | `/ai-regression-testing`            |

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

```text
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
├── README.md                        ← Navigation hub — who goes where
├── onboarding/                      ← Read once, in order
│   ├── getting-started.md           ← Setup + first test walkthrough
│   └── joining-an-existing-project.md ← Mid-project onboarding
├── guides/                          ← Task-oriented — "how do I do X?"
│   ├── framework-maintenance-guide.md ← Adding modules, updating configs
│   ├── support-commands-instructions.md ← Command authoring guide
│   ├── hooks-explainer.md           ← What hooks are, why they exist, when they fire
│   ├── ci-cd-guide.md               ← Pipeline setup, secrets, reading results
│   └── prompting-guide.md           ← How to prompt Claude Code and Copilot effectively
├── reference/                       ← Look-up — rules, standards, API catalogue
│   ├── framework-standards.md       ← Architecture rules + naming conventions
│   ├── api-layer-guide.md           ← API engine, intercepts, schema validation
│   ├── test-organization.md         ← Why configs/tests/commands are split this way
│   └── two-views.md                 ← Human engineer view vs. AI agentic view
└── decisions/                       ← ADRs — append-only architecture record
    └── README.md                    ← ADR format guide

.claude/                             ← Claude Code config (auto-enforced)
├── settings.json                    ← Hooks + permissions
├── hooks/                           ← Automatic rule enforcement on every write
├── agents/                          ← Subagents (spawned with Agent tool — multi-step, own context)
└── skills/                          ← Skills (slash commands — run inline, e.g. /detect-duplication)

.github/                             ← GitHub Copilot config
├── copilot-instructions.md          ← Global Copilot context
├── agents/                          ← Copilot agents
├── skills/                          ← Copilot custom skills
└── prompts/                         ← Slash-command prompts
```

---

## Why this architecture?

- **Selectors in one place** — update a constant in `configs/ui/`, every test that uses it updates automatically. No hunting through 50 spec files.
- **Commands own all complexity** — specs stay readable; changing a flow means fixing one command, not every test that calls it.
- **No `cy.wait(number)`** — `cy.apiWait('@alias')` waits for the actual network response, not a guessed duration. Tests pass everywhere, including slow CI.
- **No page objects** — commands are your page methods, config files are your locator maps, with explicit single-file ownership enforced by hooks. If your team comes from POM, see the [full comparison and migration guide](docs/reference/test-organization.md#part-5--the-pom-question-for-teams-coming-from-page-objects).

> Deep dive on all architecture decisions, test scope organization, routes, and command layer design: [docs/reference/test-organization.md](docs/reference/test-organization.md)

---

## Non-Negotiable Rules

```text
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

```text
1. API config    → cypress/configs/api/modules/[module]/[module].api.js
2. UI config     → cypress/configs/ui/modules/[module]/[module].ui.js
3. Routes        → cypress/configs/app/routes.js
4. Commands      → cypress/support/commands/modules/[module].commands.js
5. Register      → cypress/support/commands.js
6. Spec          → cypress/tests/[module]/smoke/[module]-smoke.cy.js
```

---

## Pre-Merge Checklist

```text
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
