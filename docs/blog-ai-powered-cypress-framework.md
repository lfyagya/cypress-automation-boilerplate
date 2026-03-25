# From Page Objects to AI-Powered Testing: How We Built a Cypress Framework with GitHub Copilot

> **A deep dive into building a production Cypress automation framework from scratch — and how 40+ GitHub Copilot customization files transformed our team's velocity, consistency, and architecture.**

---

## Table of Contents

1. [The Problem We Faced](#1-the-problem-we-faced)
2. [Where We Started](#2-where-we-started)
3. [The Architecture Decision — Command-First](#3-the-architecture-decision--command-first)
4. [Building the Reusable Boilerplate](#4-building-the-reusable-boilerplate)
5. [Enter GitHub Copilot — The Configuration Deep Dive](#5-enter-github-copilot--the-configuration-deep-dive)
6. [Custom Agents — Task Specialization at Scale](#6-custom-agents--task-specialization-at-scale)
7. [Prompt Templates — Slash-Command Shortcuts](#7-prompt-templates--slash-command-shortcuts)
8. [Skills — Packaging Domain Knowledge](#8-skills--packaging-domain-knowledge)
9. [Auto-Injected Instructions — Right Context, Right Time](#9-auto-injected-instructions--right-context-right-time)
10. [Chat Modes — Conversational Workflows](#10-chat-modes--conversational-workflows)
11. [The Prompting Guide — Teaching the Team to Work with AI](#11-the-prompting-guide--teaching-the-team-to-work-with-ai)
12. [What We Built — The Impact](#12-what-we-built--the-impact)
13. [Minimizing Redundancy — AI as Duplication Police](#13-minimizing-redundancy--ai-as-duplication-police)
14. [Framework Structure — AI as Co-Architect](#14-framework-structure--ai-as-co-architect)
15. [Patterns and Approaches We Follow](#15-patterns-and-approaches-we-follow)
16. [What We Learned](#16-what-we-learned)
17. [By the Numbers](#17-by-the-numbers)
18. [What's Next](#18-whats-next)

---

## 1. The Problem We Faced

Writing Cypress tests for enterprise dashboards is painful. Our team was maintaining automation for **FHF Dashboards** — a suite of financial servicing applications covering collections, loss mitigation, titles, custodian portfolios, insurance, complaints, and more. Each dashboard had dozens of API endpoints, complex multi-step workflows (call scripting, payment processing, identity verification), and UI components that changed frequently.

The problems were familiar to any test automation team:

- **Slow test creation**: Every new test required manually crafting selectors, intercepting APIs, managing authentication, and handling timing.
- **Inconsistent patterns**: Different team members built tests differently. Some used page objects. Some used action files. Some hardcoded everything.
- **Dual-ownership drift**: When both a page object AND a command owned the same logic, changes went to one but not the other. Tests broke silently.
- **Flaky tests**: Hard waits (`cy.wait(3000)`) were everywhere. Tests worked on fast machines, failed in CI.
- **No AI integration**: GitHub Copilot was available but generating code that didn't match our architecture. It would suggest page objects when we needed commands, hardcode selectors when we had configs, and create `cy.wait()` calls we'd spent months eliminating.

We needed a framework that was **opinionated enough to be consistent, flexible enough to scale, and machine-readable enough that AI could reliably generate correct code**.

---

## 2. Where We Started

Our production framework (`CypressFHF/fhf-dashboards`) had grown organically over **5 years on the `dev` branch** — our main branch — accumulating **630+ commits** across **30+ feature branches** (EL-_, SERV-_, GEARS-_, QA-_, LOS-\*) since June 2020. The file structure on `dev` told the story:

```
cypress/e2e/
  FHF-Dashboard/
    Authentication/LoginTest.js, Logout.js
    Dashboards/
      Complaints/Complaints.smoke.js
      Custodian/CustodianDashboards.smoke.js, ExceptionQueue.js, PortfolioView.js
      DocMan/DocMan.E2E.js, docman.smoke.js
      Insurance/lienHolderClaim.smoke.js, totalLoss.smoke.js
      LossMitigation/assignment.smoke.js, auctionInvoice.E2E.js, impound.E2E.js, ...
      Titles/General.E2E.js, general.smoke.js, missing-titles.smoke.js, ...
      UniFi/collection/ListingPage/, SummaryPage/
    RunAll.js
  PageObj/                  ← Page Objects everywhere
    Authentication/LoginObj.js, LogoutObj.js
    Dashboards/
      Complaints/ComplaintsObj.js
      Custodian/CustodianRequestObj.js, ExceptionQueueObj.js, PortfolioViewObj.js
      Dealer-Portal/DealerPortalObj.js, OktaLoginObj.js
      DocMan/DocManObj.js
      Insurance/insuranceObj.js
      LossMitigation/AssignmentObj.js, AuctionInvoicesObj.js, ImpoundObj.js, ...
      NavigationBar/NavBarObj.js
      Titles/TitlesObj.js, generalObj.js, missingTitlesObj.js, ...
      UniFi/Collections/CollectionsSummaryPageObj.js, ListingPageObj.js, NotesObj.js

cypress/support/
  Complaints/complaints-actions.js, complaints-services.js
  DocMan/docmanActions.js, docman-services.js
  Insurance/insurance-actions.js, insurance-services.js
  LossMitigation/
    Assignment/assignment-actions.js, assignment-services.js
    AuctionInvoice/auctionInvoice-actions.js, auctionInvoices-services.js
    Impound/impound-actions.js, impound-services.js
    Remarketing/remarketing-actions.js, remarketing-services.js
    Repo/repo-actions.js, repo-services.js
    RepoInvoice/repoInvoice-actions.js, repoInvoices-services.js
    Skip/skip-actions.js, skip-services.js
    Transport/transport-actions.js, transport-services.js
  Titles/
    General/general-actions.js, general-services.js
    Missing Titles/missing-titles-action.js, missing-titles-services.js
    Release/release-action.js, release-services.js
    Remarketing/remarketing-action.js, remarketing-services.js
    ReRegistration/re-registration-actions.js, re-registration-services.js
  UniFi/Collections/collections-services.js
  helper/dateUtils.js, locators.js, sortingUtils.js, testDataGenerator.js, utils.js
  commands.js, e2e.js, index.d.ts
```

**70 test files. 57 support files. Zero Copilot configuration. Zero documentation.**

The `dev` branch had **no** `.github/` directory, **no** `docs/` folder, **no** `cypress/configs/`, **no** `cypress/tests/`, **no** `cypress/schemas/`. Everything was ad-hoc.

We had **three different patterns** coexisting:

1. **Page Objects** (`e2e/PageObj/*Obj.js`) — 20+ page object classes wrapping selectors and actions (LoginObj.js, DocManObj.js, TransportObj.js, CollectionsSummaryPageObj.js, etc.)
2. **Action + Service file pairs** (`support/<Domain>/*-actions.js` + `*-services.js`) — 12+ domain modules each with paired files (e.g., `impound-actions.js` + `impound-services.js`)
3. **Scattered helpers** (`support/helper/*`) — utility files like `locators.js`, `sortingUtils.js`, `utils.js` mixing concerns across all modules

Tests imported from page objects, action files, service files, and helpers interchangeably, creating a web of dependencies no one could confidently refactor. Some modules like LossMitigation had 7 sub-modules, each with their own action/service pair — **14 files** doing what a few config-driven commands could do.

The authentication was Okta SSO with MFA — complex cross-origin flows using `cy.origin()`. API responses came from ORDS (Oracle REST Data Services) with a specific envelope format. Every dashboard had its own authentication quirks, endpoint patterns, and selector conventions.

**Something had to change.** We created the `SERV-11051` branch — our dedicated migration branch — and decided to change everything at once: architecture AND AI workflow.

---

## 3. The Architecture Decision — Command-First

On the `SERV-11051` branch, we made a deliberate architectural choice: **Config → Custom Commands → Tests**. No page objects. No action files. Period. This wasn't a gradual refactor on `dev` — it was a clean-break migration where we rebuilt the architecture from the ground up while the `dev` branch continued to serve as the stable baseline.

```
cypress/
  configs/
    api/modules/<name>/<name>.api.js    ← HTTP intercept definitions
    ui/modules/<name>/<name>.ui.js      ← [data-cy] selector constants
    app/routes.js                       ← URL path constants
  support/
    commands/modules/<name>.commands.js  ← Verb-first Cypress commands
    core/api/                           ← Engine (do not modify per-project)
  tests/<name>/
    smoke/<name>-smoke.cy.js            ← Smoke specs
    e2e/<name>-e2e.cy.js                ← Full E2E specs
```

### The 7 Non-Negotiable Rules

We codified these as `FRAMEWORK_RULES.md` — a file that both humans AND Copilot read on every interaction:

| #   | Rule                                         | Why                                                         |
| --- | -------------------------------------------- | ----------------------------------------------------------- |
| 1   | NO page objects, NO action files             | Dual ownership causes drift; commands own logic             |
| 2   | NO `cy.wait(number)`                         | Timing-dependent; use `cy.apiWait('@alias')` or `.should()` |
| 3   | `[data-cy="..."]` selectors only             | Decoupled from CSS; stable across refactors                 |
| 4   | Auth via `cy.ensureAuthenticated()` only     | Ensures `cy.session()` caching                              |
| 5   | Intercepts registered BEFORE `cy.visit()`    | Requests can fire before Cypress registers listeners        |
| 6   | State reset in `beforeEach`, not `afterEach` | Reliable; `afterEach` does not run on test failure          |
| 7   | All URL paths from `ROUTES` constants        | Never hardcode a URL in a test or command                   |

### Why This Matters for AI

Page objects are **fundamentally hostile to AI code generation**. A page object encapsulates both selectors and behavior — when AI generates a test, it has to know both the class interface AND the underlying DOM. With command-first architecture:

- **Selectors** live in one canonical location (UI config)
- **Behavior** lives in one canonical location (commands)
- **Tests** orchestrate intent using `cy.*` verbs

When Copilot sees `cy.visitPayments()` → `cy.searchPayments('test')` → `cy.assertTableHasRows()`, it can infer the pattern instantly. There's no class hierarchy to navigate, no inheritance chain to follow, no method-vs-property ambiguity.

---

## 4. Building the Reusable Boilerplate

We didn't just refactor the production framework — we extracted the patterns into a **standalone boilerplate** (`cypress-command-first-boilerplate`) that any team could fork and adapt.

### The API Engine — Factory Pattern

The heart of the framework is `createModuleConfig()`, a factory that generates intercept configurations from compact definitions:

```js
// cypress/configs/api/modules/payments/payments.api.js
import { createModuleConfig } from '@core/api';

export const PAYMENTS_CONFIG = createModuleConfig({
  basePath: '/api/v1/payments',
  prefix: 'PAYMENT',
  resources: ['LIST', 'DETAILS', 'CREATE', 'UPDATE', 'DELETE'],
  custom: [
    {
      alias: 'PAYMENT_VOID',
      method: 'POST',
      pattern: '/api/v1/payments/**/void',
    },
  ],
});
```

This single definition auto-generates six typed intercept entries (`@PAYMENT_LIST`, `@PAYMENT_DETAILS`, `@PAYMENT_CREATE`, `@PAYMENT_UPDATE`, `@PAYMENT_DELETE`, `@PAYMENT_VOID`) — each with method, URL pattern, alias, and expected status code. No boilerplate. No copy-paste errors.

### Commands as Verbs

Every command follows a verb-first naming convention: `visitPayments()`, `searchPayments()`, `assertPaymentLoaded()`, `interceptPaymentRequests()`. A command file looks like:

```js
import { PAYMENTS_CONFIG } from '@configs/api/modules/payments/payments.api';
import { PAYMENTS_UI } from '@configs/ui/modules/payments/payments.ui';

Cypress.Commands.add('visitPayments', () => {
  cy.interceptPaymentRequests();
  cy.visit(ROUTES.PAYMENTS.ROOT);
  cy.apiWait('@PAYMENT_LIST');
});

Cypress.Commands.add('searchPayments', query => {
  cy.apiIntercept(PAYMENTS_CONFIG, 'PAYMENT_SEARCH');
  cy.get(PAYMENTS_UI.LIST.SEARCH_INPUT).clear().type(query);
  cy.get(PAYMENTS_UI.LIST.SEARCH_BTN).click();
  cy.apiWait('@PAYMENT_SEARCH');
});
```

Tests become thin and intent-driven:

```js
describe('Payments', { tags: ['@payments'] }, () => {
  before(() => cy.ensureAuthenticated());
  beforeEach(() => cy.visitPayments());

  it('searches payments', { tags: ['@smoke'] }, () => {
    cy.searchPayments('test');
    cy.assertTableHasRows('[data-cy="payments-table"]', 1);
  });
});
```

### Schema Validation

Every API response is validated against a JSON schema using AJV:

```js
cy.apiWait('@PAYMENT_LIST').then(({ response }) => {
  cy.validateSchema(response.body, PAYMENT_SCHEMAS.LIST);
});
```

This catches backend contract drift before it becomes a UI bug.

---

## 5. Enter GitHub Copilot — The Configuration Deep Dive

Here's where things got interesting. We realized that **the architecture we built was exactly what AI needed to be effective** — and that we could supercharge the loop by configuring Copilot to understand our framework natively.

None of the configuration files described below existed on the `dev` branch. The `SERV-11051` migration branch introduced **all 40+ Copilot customization files** as part of the architecture transformation — the `.github/` directory, docs, schemas, and configs all came into existence together.

### The Always-On Instructions

`.github/copilot-instructions.md` is loaded into every Copilot interaction automatically. Ours tells Copilot:

```markdown
## Architecture Policy (Mandatory)

- Use **Config → Custom Commands → Tests** architecture.
- New work must be **command-first**.
- Do not create or use new `*.actions.js` files.
- Do not create or use page-object wrappers.

## Non-Negotiable Rules

- Use selectors/endpoints from config files; avoid hardcoded literals.
- Never use `cy.wait(ms)` — use deterministic API/UI conditions.
- Keep command names clear and ownership unique (one name, one file).

## Prompt Context Requirements

Before generating or modifying test/command code, read these context files:

- Routes: `cypress/configs/app/routes.js`
- UI selectors: `cypress/configs/ui/modules/**`
- API aliases/endpoints: `cypress/configs/api/**`
```

**Before this file existed**, Copilot would generate page objects in response to "write a test for the payments page." **After**, it generates config-driven commands that follow our exact patterns. The difference was night and day.

### The Framework Rules File

`FRAMEWORK_RULES.md` contains the 7 canonical rules plus a layer responsibility matrix. This is referenced by the instructions file and every agent — it's the constitution that Copilot swears by:

```markdown
| Layer    | Location                      | Responsibility                                               |
| -------- | ----------------------------- | ------------------------------------------------------------ |
| Config   | `cypress/configs/**`          | Pure constants — endpoints, selectors, routes, scenario data |
| Core     | `cypress/support/core/**`     | Framework internals — API engine, schema validation          |
| Commands | `cypress/support/commands/**` | Reusable Cypress commands consumed by tests                  |
| Tests    | `cypress/tests/**`            | Business intent, `cy.*` orchestration, assertions            |
| Schemas  | `cypress/schemas/**`          | API response shape contracts                                 |
```

### The Operating Playbook

`copilot-operating-playbook.md` defines the **team workflow** for using Copilot. It specifies:

- **Mode selection**: Which agent to use for each workflow stage
- **Prompting standard**: Required fields (target scope, expected output, pass/fail criteria)
- **Skill usage by stage**: Which skill applies during migration, review, debugging, optimization
- **Merge readiness checklist**: Architecture preserved? No hard waits? Config constants used? Reviewer gate passed?

### Git Commit Instructions

Even commit messages are Copilot-configured. `git-commit-instructions.md` enforces Conventional Commit format with repository-specific scopes (`collections`, `commands`, `configs`, `tests`, `docs`, `copilot`) and reminds that commits must preserve the command-first architecture.

---

## 6. Custom Agents — Task Specialization at Scale

We built **8 specialized agents**, each with a defined role, tool access, and model specification. This is the biggest force multiplier we discovered.

### The Agent Lineup

| Agent                         | Purpose        | When to Use                                   |
| ----------------------------- | -------------- | --------------------------------------------- |
| `cypress-test-automation`     | Implementation | Writing new tests or commands                 |
| `cypress-reviewer`            | Code review    | Pre-merge architecture check                  |
| `cypress-bug-hunter`          | Debugging      | Root cause analysis for failures              |
| `cypress-performance-auditor` | Performance    | CI time and flakiness audit                   |
| `documentation-writer`        | Docs           | Writing or updating framework docs            |
| `qa`                          | Full gate      | Architecture + bugs + performance in one pass |
| `qa-interactive`              | Interactive QA | Step-by-step guided testing                   |
| `custom-agent-mode-setup`     | Meta           | Configuring new agents                        |

### How an Agent Works

Each agent is a YAML-frontmatter markdown file. Here's the test automation agent:

```yaml
---
name: cypress-test-automation
description: Specialized mode for Cypress automation using command-first architecture
tools: ['fetch', 'search', 'usages', 'read']
model: Claude Sonnet 4.6
---
```

The body contains:

- **Core Direction**: Config → Commands → Tests
- **Prohibited patterns**: No action files, no page objects, no hardcoded selectors, no `cy.wait(ms)`
- **Documentation to reference**: The canonical 4-file doc set
- **Response priorities**: Ordered list of what matters most

### The Bug Hunter Agent

This one is particularly powerful. It has a **structured debug sequence**:

1. Reproduce the failure — read the spec, command chain, and config involved
2. Trace the path: **Test → Command → Config**
3. Identify the layer where the failure originates
4. Propose the minimal fix — do not refactor unrelated code

And a **common root causes** lookup table:

| Symptom              | Likely Cause                                        |
| -------------------- | --------------------------------------------------- |
| Element not found    | Stale selector in UI config, or DOM not ready       |
| Alias not found      | `cy.apiIntercept()` called after `cy.visit()`       |
| Status code mismatch | `expectedStatus` in API config doesn't match actual |
| Flaky test           | Hard wait removed but deterministic wait not added  |
| Wrong data           | Fixture stale, or test state leaking between runs   |

When a test fails in CI, we invoke `@cypress-bug-hunter` with the error message and get a structured root cause analysis that follows our architecture — not generic Cypress debugging advice.

### The Reviewer Agent

The reviewer acts as a **senior code reviewer** enforcing our standards. It checks:

- Selectors and endpoints come from `cypress/configs/**`
- Reusable behavior lives in `cypress/support/commands/**`
- Test specs remain thin and intent-driven
- No hard waits or unstable timing assumptions
- No new legacy abstractions

Every PR gets reviewed by both a human AND the reviewer agent. The agent catches architecture violations that humans miss — like a stale selector that was hardcoded in one command instead of coming from the UI config.

---

## 7. Prompt Templates — Slash-Command Shortcuts

Prompt templates (`/.github/prompts/*.prompt.md`) are reusable, parameterized prompts that team members invoke like slash commands. They standardize how we ask Copilot for specific artifacts.

### The Scaffold Module Prompt

`/scaffold-module` generates ALL five artifacts for a new module in one shot:

1. API config (`<name>.api.js`) — endpoint definitions
2. UI config (`<name>.ui.js`) — selector constants
3. Routes entry — URL path constants
4. Commands file (`<name>.commands.js`) — verb-first commands
5. Spec file (`<name>-smoke.cy.js`) — smoke test

### The API Config Prompt

`/create-api-config` generates production-ready API config files with parameterized inputs:

```
Area: unifi
Module filename: collections
Export constant: COLLECTIONS_API
API base path: ${ORDS}/contact-management
Resource key: CONTACTS
Resource path segment: contact
PascalCase resource name: Contact
```

The output is a complete `Object.freeze()` config with GET, POST, PUT operations, correct aliases, and `expectedStatus` values from `HTTP_STATUS` constants.

### The Scenario Generator

`/generate-scenarios` creates data-driven scenario config files — frozen objects with test data, assertions, priority levels, and tag-based filtering. This is huge for scaling test coverage without duplicating logic.

### The Migration Prompt

`/migrate-test-file` converts legacy specs from page-object/action-file patterns to command-first architecture. It:

1. Reads the target test file
2. Identifies page object and action file imports
3. Moves reusable behavior to command files
4. Replaces hardcoded selectors with config constants
5. Outputs the migrated test, updated commands, and config additions

### The Architecture Validator

`/validate-architecture` checks changed files against command-first standards and outputs a pass/fail report. This is our pre-PR linting — an automated architecture compliance check.

Our 6 production prompts (boilerplate has 6 too — with some overlap and some unique ones):

| Prompt                  | Purpose                                |
| ----------------------- | -------------------------------------- |
| `create-api-config`     | Generate API config from endpoint spec |
| `create-ui-config`      | Generate UI selector config            |
| `generate-scenarios`    | Create data-driven scenario files      |
| `migrate-test-file`     | Convert legacy test to command-first   |
| `validate-architecture` | Pre-PR architecture compliance         |
| `document-api`          | Generate API documentation             |

---

## 8. Skills — Packaging Domain Knowledge

Skills are the most sophisticated customization layer. A skill is a folder containing a `SKILL.md` file with deep domain knowledge — tested instructions for specific workflows that produce high-quality outputs.

### Our 5 Production Skills

**1. `cypress-command-first-migration`** — The migration playbook. When Copilot is asked to migrate a legacy file, this skill provides step-by-step instructions for converting page objects and action files to command-first patterns, including how to handle backward compatibility during transition.

**2. `cypress-architecture-review`** — Reviews changes for compliance. Checks command ownership uniqueness, config centralization, no hard waits, no new legacy abstractions, thin tests, and reusable composition. Outputs findings tagged by severity with file-level remediation steps.

**3. `cypress-debug-playbook`** — Structured debugging methodology:

1. Reproduce failure and isolate failing step
2. Trace Test → Command → Config path
3. Validate intercept aliases and expected status definitions
4. Replace brittle waits with deterministic conditions
5. Re-run narrow validation checks

**4. `cypress-performance-audit`** — CI runtime and flakiness analysis. Checks for `cy.session()` usage, `beforeEach` deduplication, alias-based waits, fixture sizes, and assertion patterns.

**5. `api-documentation-generator`** — Generates consistent API documentation with endpoint summary, request schema, success/error responses, and example payloads. Every endpoint gets the same treatment.

### Why Skills Beat Prompts for Complex Tasks

A prompt is a one-shot input template. A skill is a **persistent knowledge package** that shapes how Copilot thinks about an entire domain. When you invoke a skill, Copilot reads the `SKILL.md` file and internalizes its constraints, output format, and methodology before generating anything.

For migration, this means Copilot doesn't just "convert the file" — it follows our specific migration sequence, checks for backward compatibility needs, preserves import paths, and validates the output against our standards.

---

## 9. Auto-Injected Instructions — Right Context, Right Time

Instructions files (`.github/instructions/*.instructions.md`) are automatically injected into Copilot's context based on the file you're editing. No prompt needed. No memory to search. The right rules appear at the right time.

### Our 3 Instruction Files

**`command-files.instructions.md`** — Applied when editing `*.commands.js`:

- Commands must use `Cypress.Commands.add()` with unique names
- Import selectors from `@configs/ui/**`, endpoints from `@configs/api/**`
- No hardcoded selectors or URLs
- Verb-first naming convention

**`config-files.instructions.md`** — Applied when editing `*.api.js` or `*.ui.js`:

- Use `Object.freeze()` for all config objects
- Follow naming conventions (UPPER_SNAKE_CASE for API entries, data-cy for selectors)
- Include `expectedStatus` from `HTTP_STATUS` constants
- Include descriptive aliases

**`test-files.instructions.md`** — Applied when editing `*.cy.js`:

- Tests call `cy.*` custom commands
- No direct DOM manipulation outside commands
- Use `@cypress/grep` tags (`@smoke`, `@e2e`, `@regression`)
- Import configs only for assertions and data wiring

This is the **set-and-forget architecture enforcement**. A developer opens a command file, starts typing, and Copilot already knows the rules.

---

## 10. Chat Modes — Conversational Workflows

Chat modes (`/.github/chatmodes/*.chatmode.md`) define conversational contexts that shape how Copilot interacts during extended sessions.

**`qa.chatmode.md`** — QA-focused conversation mode. When activated, Copilot behaves as a QA specialist: it asks about test coverage, validates assertions, suggests edge cases, and checks for flakiness risks before generating code.

**`documentation.chatmode.md`** — Documentation-focused mode. Copilot prioritizes clarity, consistency with existing docs, proper markdown formatting, and cross-references to canonical documentation files.

These modes are less about code generation and more about **workflow context** — they shape the conversation toward the right outcomes for the task at hand.

---

## 11. The Prompting Guide — Teaching the Team to Work with AI

We documented our prompting methodology in `docs/prompting-guide.md` — a comprehensive guide based on techniques from GitHub Copilot developer team training. This guide teaches the entire team how to work effectively with AI.

### The 6 Core Techniques

**1. Zero-Shot Prompting** — Ask directly, no examples needed.

> "What does `cy.ensureAuthenticated()` do in this framework?"

**2. Few-Shot Prompting** — Provide 1-3 examples before the request.

> "Here are two existing UI configs: [example.ui.js] and [payments.ui.js]. Now generate a UI config for 'invoices' using the same pattern."

**3. Chain-of-Thought Prompting** — Reason step-by-step before coding.

> "A test is failing with 'element not found'. Walk through: (1) Could the intercept be missing? (2) Could the selector be wrong? (3) Could the page not finish loading? Diagnose and fix."

**4. Prompt Chaining** — Sequential prompts where output feeds the next.

> This is what `/scaffold-module` does: API config → UI config → routes → commands → spec, in order.

**5. Self-Consistency** — Generate multiple approaches, compare, pick the best.

> "Generate the API config two ways: once using CRUD resources, once using custom array. Which matches our pattern better?"

**6. Generated Knowledge** — Brain dump relevant knowledge, then apply.

> "List everything you know about `cy.session()` in Cypress. Then update `cy.ensureAuthenticated()` to handle token-based auth."

### Good vs. Bad Prompts

| Principle       | Bad             | Good                                                                    |
| --------------- | --------------- | ----------------------------------------------------------------------- |
| Scope           | "Fix this"      | "Fix the intercept in visitPayments — it's registering after cy.visit"  |
| Reference files | "Make a config" | "Make a config using `createModuleConfig` like example.api.js"          |
| Desired output  | "Help me"       | "Generate only the command file; I already have the API and UI configs" |
| Constraints     | (none)          | "No cy.wait(number), use [data-cy] selectors, follow command-first"     |

---

## 12. What We Built — The Impact

With the framework and AI configuration in place on our `SERV-11051` migration branch, here's what we produced — much of it co-created with Copilot following our rules. The `dev` branch had 70 test files and 57 support files using legacy patterns; the migration branch rebuilt from zero with the new architecture.

### API Layer

- **12+ dashboard API configs**: Collections, Loss Mitigation, Titles, Custodian, DocMan, Contracts, Insurance, Complaints, Ancillary, Communications, Checks, and shared Common APIs
- **ORDS Registry**: 25 modules registered with slug, base path, config file, and dashboard mapping
- **API Engine**: Factory pattern (`createModuleConfig()`) with CRUD template auto-generation, custom endpoint support, nested resource handling
- **Status Code Helpers**: `HTTP_STATUS` constants, `isSuccess()`, `isClientError()`, `isServerError()`, `getStatusCategory()`, `getStatusName()`
- **Timeout Presets**: `DEFAULT` (15s), `LONG` (30s), `SHORT` (5s)

### Collections Dashboard — Full Coverage

The Collections dashboard became our reference implementation. Commands built for it:

| Command File                | Actions                                                           | Scope                |
| --------------------------- | ----------------------------------------------------------------- | -------------------- |
| `contact-log.commands.js`   | Filter, search, validate                                          | Contact Log listing  |
| `events.commands.js`        | Add, update, clear, filter                                        | Events widget        |
| `notes.commands.js`         | Add, edit, delete, pin/unpin, filter by date/keyword/department   | Notes widget         |
| `overview.commands.js`      | Verify primary applicant, co-borrower, vehicle, loan, title, repo | Account Details      |
| `contact-tabs.commands.js`  | Navigate tabs, verify phones, addresses, emails, govt ID          | Contact popup        |
| `payment.commands.js`       | Pie chart validation, single payment, payment plan, authorization | Payment widget       |
| `question-flow.commands.js` | 11 scenario paths through call scripting workflow                 | Question flow        |
| `scheduled-ptp.commands.js` | Create, edit, delete, validate scheduled payments                 | Scheduled PTP widget |
| `makeCall.commands.js`      | Make call widget interactions                                     | Make Call            |
| `conversation.commands.js`  | Conversation flow management                                      | Conversation         |

### API Contract Tests — 48+ Endpoints

We built a **phased API contract testing approach**:

**Phase 1 — Independent API contracts** (48+ endpoints across 7 feature areas):

- Call Flow Operations (6 endpoints)
- Payments & Promise-to-Pay (8 endpoints)
- Notes Management (10 endpoints)
- Events Management (7 endpoints)
- Listings & Filtering (9 endpoints)
- Admin & Configuration (3 endpoints)
- Replicant/Integration (5 endpoints)

Each endpoint is validated against 6 contract points:

1. **A1: Endpoint** — Correct URL is called
2. **A2: Method** — GET/POST/PUT correctly executed
3. **A3: Status** — Expected HTTP status returned
4. **A4: Response Time** — Within SLA (3000ms default)
5. **A5: Payload** — Response body has required fields
6. **A6: Schema** — Response matches JSON schema

**Phase 2 — Workflow integration** using Phase 1 stub factories in UI tests, creating clean separation: if API test fails → fix API; if workflow fails → fix UI/logic.

### Schema Validation

- **ORDS envelope schema** — shared `items`, `hasMore`, `limit`, `offset`, `count`, `links`
- **Domain schemas** — Loan Details, Notes, Contacts, Phones, Events, Error Response
- **`ordsListOf()` helper** — wraps any item schema in the ORDS list envelope
- **AJV integration** — `cy.validateSchema()` command with `ajv-keywords` support

### Test Data Generation

A comprehensive `testDataGenerator.js` with **16+ object templates**:

`vehicle`, `buyer`, `tracking`, `text`, `title`, `scheduledPayment`, `contactPersonal`, `contactBusiness`, `address`, `phone`, `email`, `contactInfo`, `invoice`, `impound`, `transport`, `invalidSearch`

Plus scalar templates (`governmentId`, `note`, `comment`), override support, bulk generation (`generateMultipleTestData`), and date utilities (`generateDateFromToday`).

---

## 13. Minimizing Redundancy — AI as Duplication Police

One of the most unexpected benefits of the Copilot configuration was **redundancy elimination**. Here's how:

### Single Source of Truth Enforcement

When `copilot-instructions.md` says "use selectors/endpoints from config files; avoid hardcoded literals" — Copilot enforces this in every code generation. Before, developers might type `cy.get('[data-cy="submit-btn"]')` directly. Now, Copilot suggests `cy.get(PAYMENTS_UI.FORM.SUBMIT_BTN)` because it knows the config exists.

### Factory Pattern Eliminates Boilerplate

`createModuleConfig()` means you define an API module in 5-10 lines. Copilot understands this factory — when you ask for a new API config, it generates the compact definition rather than manually duplicating 50+ lines of endpoint objects.

### Shared Stub Builders

In our API contract tests, stub response builders are **defined once** and **reused everywhere**:

```js
// Defined in helpers/collections.api.stub-builders.js
export const buildPaymentDueResponse = () => ({
  items: [{ payment_due_id: 1, amount_due: 3500.75, ... }],
  count: 1, hasMore: false,
});

// Reused in Phase 1 (contract test)
cy.apiStub(COLLECTIONS_API.PAYMENT_DUE, {
  statusCode: 200, body: buildPaymentDueResponse(),
});

// Reused in Phase 2 (workflow test)
cy.apiStub(COLLECTIONS_API.PAYMENT_DUE, {
  statusCode: 200, body: buildPaymentDueResponse(),
});
```

When an API response shape changes, update the builder once — both contract and workflow tests use the new shape automatically.

### Instructions Prevent Duplicate Patterns

The auto-injected instruction files stop Copilot from generating duplicate command registrations, creating a second `visitPayments` in a different file, or defining the same selector in both a config and inline.

---

## 14. Framework Structure — AI as Co-Architect

Some of our biggest architectural decisions were made collaboratively with AI — and we configured Copilot to enforce them going forward.

### Concern-First, Scope-Second

We chose **concern-first folder organization** over scope-first:

```
✅ Concern-First (our choice):
configs/api/common/
configs/api/modules/
configs/api/dashboards/

❌ Scope-First (rejected):
common/api/
modules/api/
dashboards/api/
```

Why? Engineers usually know whether they're looking for API metadata, UI selectors, or commands **before** they know the exact scope. Concern-first makes discovery faster and ownership obvious.

### Command Segregation Model

Three clear layers with ownership boundaries:

1. **Framework-generic** (`commands/common/`) — cross-framework primitives (`getByDataCy`, visibility helpers). Domain-agnostic.
2. **Module-shared** (`commands/modules/`) — reusable flows within one module family. May compose common commands.
3. **Dashboard-specific** (`commands/dashboards/`) — `cy.*` commands used directly by specs. May compose layers 1 and 2.

### Import Alias System

`jsconfig.json` + `webpack.config.js` provide clean import paths:

```
@configs/*   → cypress/configs/*
@support/*   → cypress/support/*
@core/*      → cypress/support/core/*
@schemas/*   → cypress/schemas/*
@fixtures/*  → cypress/fixtures/*
@tests/*     → cypress/tests/*
```

These aliases mean command files can import `@configs/api/unifi/collections.api.js` instead of deep relative paths — and Copilot generates these alias imports automatically because `copilot-instructions.md` points to the config paths.

### Pre-Commit Quality Gates

`husky` pre-commit hooks run `npm test` on every commit. Combined with `lint-staged` and `eslint`, this ensures:

- ESLint catches style and pattern violations
- Automated tests validate changes before they're committed
- What Copilot generates is verified by the same gates as human code

---

## 15. Patterns and Approaches We Follow

### Config-Driven Testing

Every test value comes from a config:

- **Selectors**: `PAYMENTS_UI.LIST.TABLE` → `[data-cy="payments-table"]`
- **Endpoints**: `COLLECTIONS_API.LOAN_DETAILS` → `{ method: 'GET', endpoint: '...', alias: 'loanDetails', expectedStatus: 200 }`
- **Routes**: `ROUTES.PAYMENTS.ROOT` → `/payments`
- **Scenarios**: `QUESTION_FLOW_SCENARIOS.PAYMENT_ABILITY_YES` → `{ steps: [...], expectedOutcome: 'PAYMENT_WIDGET_DISPLAYED' }`

### API-First: Intercepts Before Visit

```js
// ✅ Correct — intercept registered BEFORE page navigation
cy.apiIntercept(COLLECTIONS_API.LOAN_DETAILS);
cy.visit('/collections/9000001');
cy.apiWait(COLLECTIONS_API.LOAN_DETAILS);

// ❌ Wrong — request may fire before intercept registers
cy.visit('/collections/9000001');
cy.apiIntercept(COLLECTIONS_API.LOAN_DETAILS);
```

### Atomic Commands: One Command = One Action

Each command does exactly one thing. Tests compose them:

```js
// Setup
cy.notesResetState();
cy.notesInterceptApis();
cy.notesSetAppId(appId);
cy.notesFetchApiData();
cy.notesWaitForWidget();

// Action
cy.notesTypeNewNote('Test note content');
cy.notesSubmitAdd();

// Assertion
cy.notesValidateAddResponse({ apiStatus: 201, apiMessage: 'created' });
cy.notesVerifyAddedInUI();
```

### Module-Level State Management

Command files maintain their own state objects — no global state pollution:

```js
const state = {
  appId: null,
  apiNotesData: [],
};

Cypress.Commands.add('notesResetState', () => {
  state.appId = null;
  state.apiNotesData = [];
});
```

### Scenario-Driven Testing

Complex workflows like `question-flow` use scenario configs with step arrays:

```js
export const QUESTION_FLOW_SCENARIOS = Object.freeze({
  PAYMENT_ABILITY_YES: {
    id: 'PAYMENT_ABILITY_YES',
    name: 'Customer can make payment',
    steps: [
      { question: 'Q1_DID_SOMEONE_ANSWER', answer: 'yes' },
      { question: 'Q2_CUSTOMER_AVAILABLE', answer: 'yes' },
      { question: 'Q3_IDENTITY_VERIFICATION', fields: [...] },
      { question: 'Q4_PAYMENT_ABILITY', answer: 'yes' },
    ],
    expectedOutcome: 'PAYMENT_WIDGET_DISPLAYED',
  },
  // ... 10 more scenarios covering every path
});
```

Tests just reference the scenario ID:

```js
cy.executeQuestionFlowScenario('PAYMENT_ABILITY_YES');
cy.qfAssertScenarioOutcome('PAYMENT_ABILITY_YES');
```

### Phase-Based API Testing

```
Phase 1 → API contracts verified independently (48+ endpoints, stubbed)
Phase 2 → Workflows use Phase 1 validated stubs (UI integration)
Phase 3 → CI/CD pipeline integration (automated gates)
```

If Phase 1 fails → fix the API contract.
If Phase 2 fails → fix the UI/workflow.
The separation makes debugging twice as fast.

---

## 16. What We Learned

### AI Is Most Effective When Given Explicit Rules

Generic Copilot is smart but undirected. It generates whatever pattern seems most common — page objects for Cypress, hardcoded selectors for UI tests, `cy.wait(3000)` for timing. **The moment we gave it our architectural rules**, the output quality jumped dramatically.

The investment in writing `copilot-instructions.md` paid back within the first day.

### Customization Files Are the #1 Force Multiplier

One human writes a 30-line agent file. That agent then reviews every PR, debugs every failure, and audits every performance issue — consistently, following the same methodology, forever. The leverage is extraordinary.

### Instructions > Prompts for Consistency

Instructions (auto-injected per file type) produce more consistent output than prompts (manually invoked). We still use prompts for complex generation tasks, but instructions are the silent enforcers that keep every code change aligned — without anyone having to remember to invoke them.

### Skills Package Knowledge That Compounds

When we wrote the `cypress-command-first-migration` skill, we encoded months of migration experience. Now any team member — including new hires — can migrate a legacy test file and get the same quality output. The knowledge isn't lost when people change teams.

### Documentation Written WITH AI Stays Accurate

Our docs are maintained using the `documentation-writer` agent, which cross-references the actual codebase. When architecture changes, the agent updates the docs to match. Traditional docs rot; AI-maintained docs evolve.

### The Prompting Guide Teaches the Team, Not Just the AI

Writing `prompting-guide.md` forced us to articulate our methodology. New team members read it, learn the 6 techniques, and immediately become productive with Copilot. It's onboarding documentation that makes the entire team faster.

### Pre-Commit Hooks Are the Safety Net

`husky` + `lint-staged` + `eslint` ensure that AI-generated code passes the same quality gates as human code. Copilot generates; the pipeline verifies. This combination gives confidence to move fast.

### The Boilerplate Approach Scales

By extracting patterns into `cypress-command-first-boilerplate`, we created a framework that any team can fork. The production framework proves it works at scale; the boilerplate makes it accessible. Both share the same Copilot customizations, so AI works identically in both.

---

## 17. By the Numbers

| Metric                             | Count                                                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Copilot customization files        | **40+** across both projects                                                                              |
| Specialized agents                 | **8** (test automation, reviewer, bug hunter, perf auditor, docs writer, QA, QA interactive, agent setup) |
| Prompt templates                   | **6+** (scaffold module, API config, UI config, scenarios, migrate, validate, document API)               |
| Domain skills                      | **5** (architecture review, migration, debug playbook, performance audit, API docs)                       |
| Auto-injected instruction files    | **3** (command files, config files, test files)                                                           |
| Custom chat modes                  | **2** (QA, documentation)                                                                                 |
| API contract tests                 | **48+** endpoints validated                                                                               |
| Dashboard API configs              | **12+** production dashboards                                                                             |
| ORDS module registrations          | **25**                                                                                                    |
| Common command files               | **15+**                                                                                                   |
| Collections-specific command files | **10+**                                                                                                   |
| Canonical documentation files      | **7+**                                                                                                    |
| Test data templates                | **16+** object templates                                                                                  |
| JSON schemas                       | **6+** (ORDS envelope, loan details, notes, contacts, phones, error response)                             |
| Page objects in new work           | **0**                                                                                                     |
| Action files in new work           | **0**                                                                                                     |
| `cy.wait(ms)` in new work          | **0**                                                                                                     |

---

## 18. What's Next

### Phase 2: Workflow Integration

We're rolling out Phase 2 of our API testing approach — importing Phase 1 validated stub factories into workflow tests. This means every UI test uses the same API response shapes that were independently contract-tested, creating a single source of truth from API to UI.

### Phase 3: CI/CD Pipeline

The API contract tests run first (fast, no UI), then workflow tests (slower, UI-dependent). If Phase 1 fails, Phase 2 doesn't run. This saves CI time and pinpoints issues faster.

### Expanding to Remaining Dashboards

The Collections dashboard is our reference implementation. Loss Mitigation, Titles, Custodian, DocMan, and others follow the same `/scaffold-module` → implement → review → merge cycle — each new dashboard is faster than the last because the framework AND the AI configuration grow together.

### Postman MCP Server Integration

We've configured MCP (Model Context Protocol) servers in `.vscode/settings.json` — including Postman integration. This lets Copilot directly reference API collections during test generation, closing the loop between API documentation and test automation.

### Evolving the Prompting Guide

The 6-technique guide has proven valuable. We're expanding it with case studies from our actual framework: real before/after examples of prompts that produced poor vs. excellent output, and pattern libraries for common test generation tasks.

---

## Final Thoughts

Building a Cypress automation framework is hard. Building one that scales across 12+ dashboards, 48+ API endpoints, and a growing team is harder. What we discovered is that **the same architectural decisions that make a framework maintainable for humans also make it effective for AI**.

Config-driven, command-first, single-source-of-truth architecture isn't just good engineering — it's AI-ready engineering. When every selector has one home, every endpoint has one definition, and every behavior has one owner, AI can generate, review, debug, and optimize with remarkable accuracy.

The 40+ Copilot customization files we wrote aren't overhead — they're **a coding-level investment that pays compound interest on every interaction**. Each agent, each skill, each instruction file makes the next test faster to write, the next bug faster to find, and the next team member faster to onboard.

We started with a messy framework and a generic AI assistant. We ended with **an opinionated, self-documenting, AI-augmented test automation platform** that our team trusts to catch real bugs.

The future of test automation isn't humans OR AI. It's **humans CONFIGURING AI to follow proven patterns — and AI executing those patterns at scale.**

---

_This article reflects work done on the `front-end-automation` repository at treacyandcoventures. The legacy codebase lives on the `dev` branch (630+ commits, June 2020–August 2025), and the AI-powered command-first migration is being built on the `SERV-11051` branch. Built with Cypress 15.x and GitHub Copilot (Claude Sonnet 4.6)._

---

**Tags**: `#cypress` `#test-automation` `#github-copilot` `#ai-powered-testing` `#command-first` `#qa-engineering`
