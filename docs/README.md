# Documentation

Find what you need by role, not by guessing file names.

| I am...                                                                    | Start here                                                                             |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| New to this project — first time setup                                     | [onboarding/getting-started.md](onboarding/getting-started.md)                         |
| Joining a team already using this framework                                | [onboarding/joining-an-existing-project.md](onboarding/joining-an-existing-project.md) |
| Writing a test or command right now                                        | [guides/support-commands-instructions.md](guides/support-commands-instructions.md)     |
| Adding a module, endpoint, or selector                                     | [guides/framework-maintenance-guide.md](guides/framework-maintenance-guide.md)         |
| Understanding hooks — what they are, why they exist, when they don't apply | [guides/hooks-explainer.md](guides/hooks-explainer.md)                                 |
| Looking up a rule, standard, or selector strategy                          | [reference/framework-standards.md](reference/framework-standards.md)                   |
| Understanding why the architecture works this way                          | [reference/test-organization.md](reference/test-organization.md)                       |
| Working with API intercepts or schema validation                           | [reference/api-layer-guide.md](reference/api-layer-guide.md)                           |
| Understanding how humans and AI agents use this framework differently      | [reference/two-views.md](reference/two-views.md)                                       |
| Asking why a past decision was made                                        | [decisions/](decisions/)                                                               |

---

## Folder Map

```text
docs/
├── onboarding/    ← Read once, in order — setup and orientation
├── guides/        ← Task-oriented — "how do I do X right now?"
├── reference/     ← Look-up — rules, standards, command catalogue
└── decisions/     ← ADRs — append-only record of architecture choices
```

### onboarding/ — tutorials, read linearly

| File                                                                        | When to read it                                                   |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [getting-started.md](onboarding/getting-started.md)                         | First time — install, configure, run first test                   |
| [joining-an-existing-project.md](onboarding/joining-an-existing-project.md) | Joining mid-project — orient, find commands, add without breaking |

### guides/ — task-oriented how-to docs

| File                                                                        | When to read it                                                        |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [framework-maintenance-guide.md](guides/framework-maintenance-guide.md)     | Adding a module, endpoint, selector, or environment                    |
| [support-commands-instructions.md](guides/support-commands-instructions.md) | Writing a new `cy.*` command — naming, structure, ownership            |
| [hooks-explainer.md](guides/hooks-explainer.md)                             | What hooks are, why they exist, when each fires, when they don't apply |
| [ci-cd-guide.md](guides/ci-cd-guide.md)                                     | Pipeline setup, secrets, reading results                               |
| [prompting-guide.md](guides/prompting-guide.md)                             | How to prompt Claude Code and Copilot effectively                      |

### reference/ — look-up material, consult repeatedly

| File                                                       | When to read it                                                                         |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [framework-standards.md](reference/framework-standards.md) | Architecture rules, naming conventions, selector strategy, tagging                      |
| [api-layer-guide.md](reference/api-layer-guide.md)         | Every API command documented — `cy.apiIntercept`, `cy.apiWait`, `cy.apiStub`            |
| [test-organization.md](reference/test-organization.md)     | Why configs/tests/commands are split this way — principles behind each decision         |
| [two-views.md](reference/two-views.md)                     | Human engineer view and AI agentic view — testing strategy, architecture, agents, hooks |

### decisions/ — Architecture Decision Records

Append-only. One file per decision, numbered sequentially. See [decisions/README.md](decisions/README.md) for the format.
