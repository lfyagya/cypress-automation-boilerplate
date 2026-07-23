# Two Views of This Framework

> **This is a dual-audience reference doc.** The same framework serves two very different users — human automation engineers and AI agents. Their vocabularies overlap, but their mental models do not. This doc explains both views explicitly so there is no confusion about which tools belong to which world.

---

## Why Two Views Are Needed

When a human engineer reads this framework, they see a test automation toolkit: configs, commands, specs, CI pipelines.

When an AI agent (Claude Code, GitHub Copilot) uses this framework, it sees something different: a structured constraint system that tells it what to create, what to reuse, and what is forbidden — without requiring judgment.

The framework was designed to serve both. But the docs have historically been written only for human engineers. This document corrects that by making both views explicit.

---

## View 1 — Automation Engineer

_For: QA engineers, developers writing tests, team leads reviewing coverage._

### Testing Strategy

This framework targets three test scopes. Understanding where each scope applies prevents test sprawl.

| Scope      | What it verifies                                        | Where it lives                                         | When it runs               |
| ---------- | ------------------------------------------------------- | ------------------------------------------------------ | -------------------------- |
| **Smoke**  | Critical user path works end to end — nothing is broken | `tests/[module]/smoke/`                                | Every commit, every PR     |
| **E2E**    | Full user journey including edge cases and error states | `tests/[module]/e2e/`                                  | Nightly, pre-release       |
| **Schema** | API response shape matches the declared contract        | `schemas/[module].schema.js` via `cy.validateSchema()` | Any test that calls an API |

Do not write smoke tests for edge cases. Do not write E2E tests for critical paths only — both exist together. If a test is slow, it is probably in the wrong scope.

---

### Architecture — The Three Layers

```
Config → Commands → Tests
```

This is not a folder convention. It is a dependency rule:

- **Tests** may only call `cy.*` commands and import config constants for assertions
- **Commands** may only import from configs and call other `cy.*` commands
- **Configs** are pure data — no functions, no imports (except HTTP status constants)

Anything that violates the direction of this dependency (a test importing a command file directly, a config importing from a command) is an architecture violation.

---

### Config Layer — What Exists in the App

Three config types, three questions:

| Config     | Location                                           | Question it answers                             |
| ---------- | -------------------------------------------------- | ----------------------------------------------- |
| UI config  | `cypress/configs/ui/modules/[name]/[name].ui.js`   | Where on the page is this element?              |
| API config | `cypress/configs/api/modules/[name]/[name].api.js` | What HTTP contract does this feature depend on? |
| Routes     | `cypress/configs/app/routes.js`                    | What URL does this feature live at?             |

All configs use `Object.freeze()` — immutable at runtime. This is not style; it prevents config mutation bugs during a test run.

**Selector priority (non-negotiable):**

| Priority            | Strategy          | Use when                                            |
| ------------------- | ----------------- | --------------------------------------------------- |
| 1 (only acceptable) | `[data-cy="..."]` | Always — coordinate with dev team to add if missing |
| Never               | CSS classes       | Classes change with every UI refactor               |
| Never               | IDs               | IDs are implementation details, not test contracts  |

---

### Command Layer — What You Can Do

Commands are atomic `cy.*` operations. They own all complexity so tests stay readable.

**Command categories:**

| Category   | Naming pattern              | Example                                      | Responsibility                           |
| ---------- | --------------------------- | -------------------------------------------- | ---------------------------------------- |
| Intercepts | `intercept[Module]Requests` | `interceptPaymentRequests`                   | Register all API intercepts for a module |
| Navigation | `visit[Module]`             | `visitPayments`                              | Intercept + visit + wait for data        |
| Actions    | `[verb][Module]`            | `createPayment`, `searchPayments`            | Interact with UI elements                |
| Assertions | `assert[Module][State]`     | `assertPaymentsLoaded`, `assertPaymentEmpty` | Verify UI or API state                   |

**One command, one owner.** Each command name maps to exactly one file. Check `cypress/support/commands.js` before naming a new command to verify the name is not already taken.

**Never call `cy.apiIntercept()` directly from a spec.** Only module commands call it. The spec calls `cy.visitPayments()`, which internally calls `cy.interceptPaymentRequests()`, which calls `cy.apiIntercept()`. The chain is unidirectional.

---

### Authentication

```javascript
describe("Payments", () => {
  beforeEach(() => {
    cy.ensureAuthenticated(); // required for any auth-required test
  });
});
```

`cy.ensureAuthenticated()` wraps `cy.session()` with `cacheAcrossSpecs: true`. The login request fires once per spec file, not before every test. Without it, every `it()` block performs a full login — orders of magnitude slower.

Never implement auth inline in a spec. If the auth flow changes, one command fixes every test.

---

### Testing Types — Which Type Goes Where

| Type              | Framework home                                       | Notes                                                 |
| ----------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Functional UI     | `tests/[module]/smoke/` or `e2e/`                    | Standard `cy.*` command orchestration                 |
| API contract      | `schemas/[module].schema.js` + `cy.validateSchema()` | Validates response shape against JSON schema          |
| Network intercept | `cy.apiIntercept()` + `cy.apiWait()`                 | Validates status codes, stubs responses for isolation |
| Auth flow         | `auth.commands.js`                                   | Do not duplicate — adapt `cy.ensureAuthenticated()`   |
| Accessibility     | Not yet built-in                                     | Add `cypress-axe` and a shared `a11y.commands.js`     |
| Visual regression | Not yet built-in                                     | Add Percy or Cypress visual testing plugin            |

---

### When to NOT Create a New Command

Before creating anything, search `cypress/support/commands/**` **by what the command actually
does** — grep the action or assertion it performs, not just the module folder that seems relevant.
The same behavior can already exist under a command named for a different module, or living in
`common/` instead of `modules/`. A new command is only justified when:

- No existing command covers this action
- The action is reused in 2+ specs (single-use logic stays in the test)
- The action cannot be expressed as a simple chain of existing commands

If an action is genuinely one-off and specific to a single spec, keep it inline in the test. Commands exist for reuse, not for wrapping every line of code.

---

### When to NOT Create a New Config Entry

- The same selector already exists under a different name, in a different module's file, or
  outside the module folder you'd expect — grep the literal `data-cy` value across all of
  `configs/ui/**` before assuming it's new
- The same endpoint is already intercepted in an existing API config, possibly under a different
  module — grep the literal path across all of `configs/api/**`, not just this module's file
- A route already exists in `routes.js`, possibly under a different constant name

Duplication in configs is the most common source of long-term drift. Two entries for the same
element diverge the moment the app changes — and a filename-based search that never finds them is
how they stay duplicated.

---

## View 2 — AI Agentic

_For: team members using Claude Code or GitHub Copilot agents to generate or modify test code._

### How AI Sees This Framework

From an AI agent's perspective, this framework is a **structured vocabulary + constraint system**:

- **Configs** are the only source of truth for selectors, endpoints, and routes — the AI must read them before writing any selector or endpoint literal
- **Commands** are the AI's action vocabulary — every task in a test should map to an existing command or a new one worth adding
- **Hooks** are the AI's guardrails — they block writes that violate rules before they reach the file system
- **Agents and skills** are specialized AI workers — each one knows exactly one domain

The AI does not exercise judgment about architecture. The rules are enforced mechanically so the AI does not have to rely on context to "remember" them.

---

### The AI Toolchain — What Each Tool Does

```
Human prompt
      ↓
[UserPromptSubmit hook] — duplication guard fires
      ↓
Claude reasons using context from:
  - copilot-instructions.md (always-on rules)
  - FRAMEWORK_RULES.md (canonical rule set)
  - Instruction files (.github/instructions/*.instructions.md)
      ↓
Claude proposes a file write
      ↓
[PreToolUse hook] — rule scanner BLOCKS if violations found
      ↓
File is written
      ↓
[PostToolUse hook] — rule scanner WARNS if violations slipped through
      ↓
Session ends
      ↓
[Stop hook] — pre-merge checklist printed if Cypress files changed
```

**Hooks enforce what the AI knows, not what the AI remembers.** Even if a prompt does not mention the rules, the hooks catch violations anyway.

---

### Agents — Specialized AI Workers

Each agent has a bounded scope. Use the right agent for the right task.

| Agent                | When to use it                                                       |
| -------------------- | -------------------------------------------------------------------- |
| `cypress-bug-hunter` | Debugging a failing or flaky test — traces root cause                |
| `pre-merge-qa-gate`  | Code review + full 6-phase QA gate — final check before opening a PR |
| `pr-creator`         | Generating PR description and opening the PR via `gh` CLI            |

Agents are defined in `.github/agents/*.agent.md`. They are not general-purpose assistants — each one loads a specific set of context and applies a specific workflow.

---

### Skills — Structured Single-Purpose Workflows

Skills are slash commands that run inline in the current conversation. They load specialized knowledge on demand. `cypress-author`, `cypress-docs`, and `cypress-explain` are the [official Cypress AI Toolkit](https://github.com/cypress-io/ai-toolkit) skills and are the primary entry point for authoring, doc lookups, and explanations — reach for an agent (above) only when the task needs multi-file investigation or a workflow gate.

| Skill             | What it does                                                 | When to use                               |
| ----------------- | ------------------------------------------------------------ | ----------------------------------------- |
| `cypress-author`  | Creates, updates, and fixes E2E/component tests              | Writing or fixing any test                |
| `cypress-docs`    | Searches official Cypress documentation for verified answers | Looking up a command, config, or behavior |
| `cypress-explain` | Explains a test or Cypress concept without making edits      | Reviewing or understanding existing code  |

---

### What the AI Uses as Its Vocabulary

When Claude Code writes a test, it should express every action as a `cy.*` command — not as raw Cypress API calls. The commands are the vocabulary:

```javascript
// AI-generated test using the command vocabulary
it("displays payment list on load", () => {
  cy.visitPayments(); // navigation command
  cy.assertPaymentsLoaded(); // assertion command
});

it("filters payments by date", () => {
  cy.visitPayments();
  cy.filterPaymentsByDate("2026-01-01", "2026-01-31"); // action command
  cy.assertPaymentCount(5); // assertion command
});
```

Not:

```javascript
// Raw API calls — do not generate this
cy.intercept("GET", "**/api/payments**").as("paymentsList");
cy.visit("/payments");
cy.wait("@paymentsList");
cy.get('[data-cy="payments-table"]').should("be.visible");
```

The second form is what commands are made of. It belongs inside a command file, not in a spec.

---

### AI Guardrail Summary — What Gets Blocked Automatically

| Violation                              | Where it's blocked                   |
| -------------------------------------- | ------------------------------------ |
| `cy.wait(3000)`                        | Pre-write hook (file write blocked)  |
| Import from `*.actions.js`             | Pre-write hook (file write blocked)  |
| Import from `*page-object*`            | Pre-write hook (file write blocked)  |
| Hardcoded selector in `cy.get()`       | Pre-write hook (file write blocked)  |
| Hardcoded endpoint in `cy.intercept()` | Pre-write hook (file write blocked)  |
| Creating duplicate config/command      | Duplication guard (prompt warning)   |
| Missing pre-merge checks               | Session-end hook (checklist printed) |

If the AI's output is blocked by a hook, the AI must resolve the violation before the file is written. The AI cannot override hooks — they are enforced at the process level.

---

### How Copilot and Claude Code Enforce the Same Rules Differently

| System             | Mechanism                                                                                           | When it runs                           |
| ------------------ | --------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **Claude Code**    | Hooks (`.claude/hooks/`) — Node scripts that intercept file writes                                  | During Claude Code sessions only       |
| **GitHub Copilot** | Instruction files (`.github/instructions/*.instructions.md`) — rules injected into Copilot's prompt | During Copilot chat and agent sessions |

Both systems read from the same canonical rules (`FRAMEWORK_RULES.md`). The enforcement mechanism differs; the rules do not.

---

## Combining Both Views — A Typical Week

```
Monday: Engineer receives a ticket
  → Human view: understands what needs testing
  → AI view: uses cypress-author to plan out the test

Tuesday: Engineer writes the module
  → AI view: uses cypress-author to scaffold the spec
  → Hooks enforce rules on every file Claude writes

Wednesday: Engineer reviews the output
  → Human view: reads the spec to verify business intent
  → AI view: runs pre-merge-qa-gate agent for architecture sign-off

Thursday: Push to PR
  → AI view: runs pre-merge-qa-gate for full verdict
  → AI view: uses pr-creator agent to open the PR

Friday: CI runs
  → AI view: validate-cypress-rules.mjs runs --base-ref main in pipeline
  → Human view: reads the test report
```

Both views operate on the same codebase, with the same rules, at the same quality bar.
