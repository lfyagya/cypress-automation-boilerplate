# GitHub Copilot Prompting Guide

How to use GitHub Copilot effectively with this framework.  
Based on techniques from industry training by the GitHub Copilot developer team.

---

## The 6 Core Prompting Techniques

### 1. Zero-Shot Prompting

Ask directly — no examples needed. Works best for simple, well-scoped tasks.

**When to use:** Quick questions, explaining a single concept, generating a one-liner.

**Example:**

```text
What does cy.ensureAuthenticated() do in this framework?
```

---

### 2. Few-Shot Prompting

Provide 1–3 examples of what you want before making the request. Copilot infers the pattern.

**When to use:** Generating new configs or commands that must match an existing shape.

**Example:**

```text
Here are two existing UI configs:

// example.ui.js
export const EXAMPLE_UI = Object.freeze({
  LIST: { TABLE: '[data-cy="example-table"]' }
});

// payments.ui.js
export const PAYMENTS_UI = Object.freeze({
  LIST: { TABLE: '[data-cy="payments-table"]' }
});

Now generate a UI config for the "invoices" module using the same pattern.
```

---

### 3. Chain-of-Thought Prompting

Ask Copilot to reason through the problem step by step before writing code.

**When to use:** Debugging a failing test, reviewing architecture, investigating a flaky failure.

**Example:**

```text
A test is failing with "element not found: [data-cy='payments-table']".
Walk through the following:
1. Could the intercept be missing before cy.visit()?
2. Could the selector be wrong?
3. Could the page not be finishing its load?
Diagnose the most likely cause and suggest a fix.
```

---

### 4. Prompt Chaining

Decompose a large task into sequential prompts — output of one feeds the next.

**When to use:** Scaffolding a full new module (API config → UI config → commands → test).

**This is what `/scaffold-module` does automatically.** Use it when you want the full pipeline:

```text
/scaffold-module
Module name: invoices
Base path: /api/v1/invoices
HTTP methods needed: GET (list), GET (details), POST (create)
UI has: table, search input, create form
```

Copilot chains through: API config → UI config → routes entry → commands → spec, in order.

---

### 5. Self-Consistency Prompting

Generate the same artifact two or three times with slightly different prompts, then compare outputs and pick the most consistent one.

**When to use:** Uncertain about a new pattern, validating a schema or config structure.

**Example:**

```text
Generate the API config for an invoices module. Do it two ways:
- Once using the standard CRUD resources list
- Once using only the custom array
Which approach better matches the framework pattern?
```

---

### 6. Generated Knowledge Prompting

Ask Copilot to "brain dump" relevant knowledge first, then apply it to the task.

**When to use:** Before writing a command or test in an unfamiliar area.

**Example:**

```text
List everything you know about cy.session() in Cypress 13: how it works, what cacheAcrossSpecs does, and when validate() is called.

Then, using that knowledge, update cy.ensureAuthenticated() to handle a token-based app that stores auth in localStorage instead of cookies.
```

---

## Prompt Templates for This Framework

### Scaffold a full module

```text
/scaffold-module
Module name: <name>
Base path: <api-base>
HTTP methods: <LIST/DETAILS/CREATE/UPDATE/DELETE + any custom>
UI views: <list|form|detail>
Test coverage: smoke|e2e|both
```

### Create an API config

```text
/create-api-config
Module: <name>
Base path: <api-base>
Resources: <comma-separated CRUD_TEMPLATES keys>
Custom endpoints: <none | method + pattern>
```

### Create a command

```text
/create-command
Module: <name>
Command name: <verbNoun>
Action: <describe what it does>
API alias involved: <@ALIAS_NAME or none>
UI selectors involved: <yes/no>
```

### Validate architecture before PR

```text
/validate-architecture
Check the following file(s):
<paste file contents or @-mention>
```

### Debug a failing test

```text
Use the cypress-debug-playbook skill.
Failing test: <spec name and it() description>
Error message: <paste the error>
Recent changes: <what changed before this started failing>
```

---

## What Makes a Good Prompt in This Framework

| Principle       | Bad             | Good                                                                        |
| --------------- | --------------- | --------------------------------------------------------------------------- |
| Scope           | "Fix this"      | "Fix the intercept in visitPayments — it's registering after cy.visit"      |
| Reference files | "Make a config" | "Make a config using `createModuleConfig` like example.api.js"              |
| Desired output  | "Help me"       | "Generate only the command file; I already have the API and UI configs"     |
| Constraints     | (none stated)   | "No cy.wait(number), use [data-cy] selectors, follow command-first pattern" |

---

## How Copilot Agents Work in This Repo

| Trigger                        | Agent          | Best For                                      |
| ------------------------------ | -------------- | --------------------------------------------- |
| `@cypress-test-automation`     | Implementation | Writing new tests or commands                 |
| `@cypress-reviewer`            | Code review    | Pre-merge architecture check                  |
| `@cypress-bug-hunter`          | Debugging      | Root cause analysis                           |
| `@cypress-performance-auditor` | Performance    | CI time and flakiness audit                   |
| `@qa`                          | Full gate      | Architecture + bugs + performance in one pass |
| `@documentation-writer`        | Docs           | Writing or updating framework docs            |

---

## Copilot Custom Instructions Active in This Repo

The `.github/copilot-instructions.md` file tells Copilot:

- This is a command-first framework (no page objects, no action files)
- Always load context from `docs/` before generating code
- Never emit `cy.wait(number)`
- Always use `[data-cy]` selectors

These rules are **always on** — you do not need to repeat them in every prompt.
