# Cypress Command-First Automation Boilerplate

A production-ready, AI-assisted Cypress automation boilerplate based on the **Config → Custom Commands → Tests** architecture. Designed so any QA team can scaffold their own framework in minutes using Copilot prompts, agents, and skills.

---

## Architecture at a Glance

```text
configs/            ← Single source of truth: API endpoints, UI selectors, routes
    api/            ← API config entries (method, endpoint, alias, expectedStatus)
    ui/             ← UI selector constants (data-cy, ARIA, text matchers)
    app/            ← App routes / path constants
    scenarios/      ← Reusable test scenario data objects

support/
    core/api/       ← API engine, factory, schema validation (framework internals)
    commands/
        common/     ← Framework-wide reusable commands (auth, nav, filter, form…)
        modules/    ← Module-level command composition
        dashboards/ ← Dashboard-specific commands (direct spec consumers)
    commands.js     ← Central import registry
    e2e.js          ← Cypress support file entry point

tests/              ← Spec files — thin orchestration using cy.* commands only
    {module}/
        smoke/
        e2e/

schemas/            ← JSON schema contracts for API response validation
fixtures/           ← Static test data
```

**Non-Negotiable Rules:**

- No new `*.actions.js` files
- No Page Object wrappers
- No hardcoded selectors or URLs
- No `cy.wait(milliseconds)`
- `cy.ensureAuthenticated()` in `before()`/`beforeEach()` where auth required

---

## Quick Start for New Teams

### 1. Clone & Install

```bash
git clone <this-repo> my-project-automation
cd my-project-automation
npm install
```

### 2. Configure Environment

```bash
cp cypress.env.example.json cypress.env.json
# Fill in: baseUrl, username, password, any auth tokens
```

### 3. Update Routes

Edit `cypress/configs/app/routes.js` — replace the example modules and paths with your application's actual routes.

### 4. Generate Your First Module with Copilot

Open VS Code with GitHub Copilot. Then use these prompts:

```text
/scaffold-module   → Full module scaffold (API config + UI config + commands + test)
/create-api-config → Generate an API config file
/create-ui-config  → Generate a UI selector config
/create-command    → Generate a command file
/create-test       → Generate a test spec
```

### 5. Run Tests

```bash
npm run cy:open          # Interactive runner
npm run cy:run           # Headless
npm run cy:run:smoke     # Smoke suite only
```

---

## GitHub Copilot Configuration

This boilerplate ships a complete Copilot setup in `.github/`:

| File Type           | Location                                 | Purpose                           |
| ------------------- | ---------------------------------------- | --------------------------------- |
| Global instructions | `.github/copilot-instructions.md`        | Always-on architecture rules      |
| Framework rules     | `.github/FRAMEWORK_RULES.md`             | Core rule reference               |
| Agent modes         | `.github/agents/*.agent.md`              | Specialized task agents           |
| Chat modes          | `.github/chatmodes/*.chatmode.md`        | Interactive modes (QA gate, docs) |
| Instructions        | `.github/instructions/*.instructions.md` | Auto-inject by file type          |
| Prompts             | `.github/prompts/*.prompt.md`            | Slash-command prompts             |
| Skills              | `.github/skills/*/SKILL.md`              | Domain expertise packs            |

### Recommended Copilot Workflow

1. **New feature** → Use `cypress-test-automation` agent
2. **Before merge** → Use `cypress-reviewer` agent or `/validate-architecture` prompt
3. **Bug triage** → Use `cypress-bug-hunter` agent
4. **Perf issues** → Use `cypress-performance-auditor` agent
5. **Write docs** → Use `documentation-writer` agent
6. **Full QA gate** → Use `qa` chat mode

---

## Adapting for Your Application

| Step             | What to do                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| Auth             | Edit `cypress/support/commands/common/auth.commands.js` for your auth mechanism (Okta, OAuth, basic, session token) |
| Routes           | Replace `cypress/configs/app/routes.js` with your app's paths                                                       |
| First API config | Use `/create-api-config` prompt                                                                                     |
| First UI config  | Use `/create-ui-config` prompt                                                                                      |
| First module     | Use `/scaffold-module` prompt                                                                                       |
| CI/CD            | Adapt `cypress.config.js` env loading and `package.json` scripts                                                    |

---

## Documentation

- [docs/framework-standards.md](docs/framework-standards.md) — Architecture rules, folder strategy, naming
- [docs/api-layer-guide.md](docs/api-layer-guide.md) — API engine, config factory, stubbing patterns
- [docs/framework-maintenance-guide.md](docs/framework-maintenance-guide.md) — How to add/update modules
- [docs/support-commands-instructions.md](docs/support-commands-instructions.md) — Command authoring guide
- [docs/getting-started.md](docs/getting-started.md) — Step-by-step onboarding for new QA engineers
