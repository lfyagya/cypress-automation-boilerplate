# Copilot Operating Playbook

Team workflow for using GitHub Copilot consistently in this repository.

## 1) Configuration Baseline

- Always-on policy: `/.github/copilot-instructions.md`
- Canonical framework rules: `/.github/FRAMEWORK_RULES.md`
- Structural pattern rules, auto-applied per file glob: `/.github/instructions/*.instructions.md` (config files, command files, test files)
- Agent modes: `/.github/agents/*.agent.md`
- Primary skills (write/fix/explain/lookup): `/.claude/skills/*/SKILL.md` (`cypress-author`, `cypress-docs`, `cypress-explain`)
- Preferred model: **Claude Sonnet 4.6**
- Human vs. AI agent view of the framework: `/docs/reference/two-views.md`

## 2) Mode Selection (Default Workflow)

| Task                                    | Use                        |
| --------------------------------------- | -------------------------- |
| New feature / test implementation       | `cypress-author` skill     |
| Bug triage / flaky test root cause      | `cypress-bug-hunter` agent |
| Architecture review / pre-merge QA gate | `pre-merge-qa-gate` agent  |

## 3) Prompt Standard (Required Fields)

Every Copilot request should include:

```text
Scope:        <exact file/folder/glob>
Goal:         <what success looks like>
Output:       <checklist | patch plan | pass-fail report | code>
Pass criteria:
  - <criterion 1>
  - <criterion 2>
```

## 4) Skills — Primary Entry Point

`cypress-author`, `cypress-docs`, and `cypress-explain` (the official Cypress AI Toolkit) cover authoring, doc lookups, and explanations. Use an agent (above) only for review, debugging, or the QA gate.

## 5) Structural Pattern Rules — Auto-Applied, Not Invoked

The exact shape of each layer (`createModuleConfig` usage, `data-cy` selector priority, verb-first command naming, thin-test pattern) is the rule itself, not a separate prompt to invoke — it lives in `/.github/instructions/*.instructions.md` and applies automatically to any file matching its `applyTo` glob:

| File                            | Applies to                         |
| ------------------------------- | ---------------------------------- |
| `config-files.instructions.md`  | `cypress/configs/**/*.js`          |
| `command-files.instructions.md` | `cypress/support/commands/**/*.js` |
| `test-files.instructions.md`    | `cypress/tests/**/*.cy.js`         |

`cypress-author` follows the same pattern when scaffolding a full module (API config + UI config + commands + test) in one pass.

## 6) Merge Readiness Checklist

- [ ] Command-first architecture preserved (no new actions/page-objects)
- [ ] All selectors/endpoints from config, not literals
- [ ] No `cy.wait(ms)` added
- [ ] Commands registered in `cypress/support/commands.js`
- [ ] Auth handled via `cy.ensureAuthenticated()`
- [ ] `pre-merge-qa-gate` agent has signed off
