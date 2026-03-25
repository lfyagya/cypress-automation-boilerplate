# Copilot Operating Playbook

Team workflow for using GitHub Copilot consistently in this repository.

## 1) Configuration Baseline

- Always-on policy: `/.github/copilot-instructions.md`
- Canonical framework rules: `/.github/FRAMEWORK_RULES.md`
- QA chat mode: `/.github/chatmodes/qa.chatmode.md`
- Documentation chat mode: `/.github/chatmodes/documentation.chatmode.md`
- Agent modes: `/.github/agents/*.agent.md`
- Reusable skills: `/.github/skills/*/SKILL.md`
- Repeatable prompts: `/.github/prompts/*.prompt.md`
- Preferred model: **Claude Sonnet 4.6**

## 2) Mode Selection (Default Workflow)

| Task                                 | Use                                 |
| ------------------------------------ | ----------------------------------- |
| New feature / test implementation    | `cypress-test-automation` agent     |
| Architecture review / pre-merge gate | `cypress-reviewer` agent            |
| Bug triage / flaky test root cause   | `cypress-bug-hunter` agent          |
| Performance / flake optimization     | `cypress-performance-auditor` agent |
| Full QA gate orchestration           | `qa` agent                          |
| Documentation authoring              | `documentation-writer` agent        |

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

## 4) Skill Usage by Stage

| Stage                   | Skill                             |
| ----------------------- | --------------------------------- |
| New feature / migration | `cypress-command-first-migration` |
| Architecture review     | `cypress-architecture-review`     |
| Failure triage          | `cypress-debug-playbook`          |
| Performance / flake fix | `cypress-performance-audit`       |

## 5) Slash Prompts Available

| Prompt                   | When to Use                                                     |
| ------------------------ | --------------------------------------------------------------- |
| `/scaffold-module`       | Create a full module (API config + UI config + commands + test) |
| `/create-api-config`     | Add a new API config file                                       |
| `/create-ui-config`      | Add a new UI selector config file                               |
| `/create-command`        | Add a new command file                                          |
| `/create-test`           | Generate a spec file                                            |
| `/validate-architecture` | Check a file for architecture violations                        |

## 6) Merge Readiness Checklist

- [ ] Command-first architecture preserved (no new actions/page-objects)
- [ ] All selectors/endpoints from config, not literals
- [ ] No `cy.wait(ms)` added
- [ ] Commands registered in `cypress/support/commands.js`
- [ ] Auth handled via `cy.ensureAuthenticated()`
- [ ] `cypress-reviewer` agent has signed off
