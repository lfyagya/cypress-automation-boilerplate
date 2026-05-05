# Test Organization — Architecture Rationale

> **This is an architecture rationale doc.** It explains *why* the framework is structured the way it is — with references to the industry principles behind each decision. Read this before adding any new file, folder, or command category.

---

## The Central Question: What Is a Test Trying to Answer?

Every automated test answers one of three questions:

1. **Does the right content appear on the screen?** (UI assertion)
2. **Does the right data move across the network?** (API assertion)
3. **Does the full journey work end to end?** (E2E scenario)

That is why configs are split into three buckets (`ui/`, `api/`, `app/`), and why tests are split into two scopes (`smoke/`, `e2e/`). The directory structure is not organizational preference — it reflects the three distinct types of contracts a test can verify.

---

## Part 1 — Why Three Config Types (UI / API / APP)

### The Single Source of Truth Principle

In 1999, Andrew Hunt and David Thomas coined the DRY principle: *"Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."* Test automation violates this principle constantly — the same selector string appears in 30 spec files; when the app changes it, all 30 break.

The Config layer exists to give every piece of test knowledge exactly one home.

### `configs/ui/` — Where Things Are

UI configs store selector constants. They answer: *"Where on the page is this element?"*

```javascript
// cypress/configs/ui/modules/saucedemo/saucedemo.ui.js
export const SAUCEDEMO_UI = Object.freeze({
  INVENTORY: {
    CONTAINER: '[data-test="inventory-container"]',
    SORT_DROPDOWN: '[data-test="product-sort-container"]',
  },
});
```

**Why freeze them?** `Object.freeze()` is not stylistic. It makes the config genuinely immutable at runtime — if a command accidentally tries to reassign `SAUCEDEMO_UI.INVENTORY.CONTAINER`, JavaScript throws a TypeError. The config cannot be mutated by test code, which prevents an entire class of subtle bugs where shared state is modified during a run.

**Why `data-cy` / `data-test` over CSS classes?** CSS classes encode styling intent — `.btn-primary`, `.sidebar__item--active`. They change every time a designer refactors the UI or a developer renames a BEM block. `data-cy` attributes encode *test intent* — they are written specifically to be stable test hooks. Google's testing blog, the Testing Library documentation, and the Cypress best-practices guide all converge on this same recommendation: test attributes are contracts between the dev and test team, not implementation details.

**Why `data-cy` specifically?** It signals ownership. When a developer sees `data-cy="checkout-submit-btn"` in the HTML, they know it is a test-owned attribute — they will not rename it casually. The naming convention creates an implied contract.

### `configs/api/` — What Data Moves

API configs store network intercept definitions. They answer: *"What HTTP contract does this feature depend on?"*

```javascript
// cypress/configs/api/modules/payments/payments.api.js
export const PAYMENTS_API = Object.freeze({
  LIST: Object.freeze({
    method: "GET",
    endpoint: "**/api/payments**",
    alias: "paymentsList",
    expectedStatus: HTTP_STATUS.OK,
  }),
});
```

**Why separate from UI configs?** Because selectors and API contracts are owned by different people and change for different reasons. A designer changes a selector when a component is redesigned. A backend engineer changes an endpoint when the API is versioned. If they lived in the same file, an API change would require editing the same file as a UI change — mixing two ownership concerns and increasing the chance of merge conflicts and accidental regressions.

**Why store `expectedStatus`?** When `cy.apiWait()` resolves, it validates the status code against the config. An API that returns 200 when it should return 201, or 200 when it should return 401, is a bug — and it is a bug that silently passes UI tests. The status assertion in the API config layer catches contract breaks before they propagate to the UI.

### `configs/app/routes.js` — How to Get There

Routes is the URL registry. It answers: *"What are the navigable surfaces of the application?"*

```javascript
// cypress/configs/app/routes.js
const SAUCEDEMO = Object.freeze({
  INVENTORY: "/inventory.html",
  CART: "/cart.html",
  CHECKOUT_STEP_ONE: "/checkout-step-one.html",
});
```

**Why does this exist?** Consider the alternative: `cy.visit('/inventory.html')` hardcoded in 15 test files. The app is refactored and the path becomes `/products`. Every one of those 15 tests breaks — but not at import time, and not with a clear error. They fail at runtime with "page not found," and you spend 20 minutes figuring out which hardcoded URL broke.

With `ROUTES.SAUCEDEMO.INVENTORY`, the path exists in one place. Update it once, all 15 references update automatically. The failure mode also improves: if you delete the constant without updating routes.js, the import fails loudly at module load time — before a single test runs.

**Routes as living documentation.** Open `routes.js` and you see every navigable URL in the application. This is more accurate than a wiki page and always up to date because tests use it. A new team member can map the product surface area by reading one file.

**Dynamic routes.** Routes supports parameterized paths as functions:

```javascript
PRODUCT_DETAIL: (productName) => `/inventory-item.html?id=${productName}`,
```

This keeps the pattern knowledge (how IDs appear in URLs) in one place rather than scattered across test files as string concatenation.

---

## Part 2 — Why Two Test Scopes (Smoke / E2E)

### The Test Pyramid

In 2009, Mike Cohn described the Test Pyramid in *Succeeding with Agile*: fast, cheap tests at the base, slow, expensive tests at the top. Martin Fowler expanded this into a practical principle: *optimize the distribution of tests so that the most tests run fastest and the fewest tests run slowest.*

This framework implements the pyramid's top two layers:

| Scope | What it tests | Speed | When it runs |
|-------|--------------|-------|-------------|
| **Smoke** | Critical path: does the page load and show primary content? | Fast (< 30s per module) | Every commit, every PR |
| **E2E** | Full user journeys: create, update, delete, edge cases | Slower (1–5 min per flow) | Nightly, pre-release |

**Why is smoke separate from e2e?** Because the feedback loop matters. A developer who pushes a commit should know within 2 minutes whether they broke something critical. If every test in the suite runs on every commit, the feedback loop becomes 30 minutes — developers stop waiting for results and the CI becomes noise. Smoke tests run fast and give the signal that matters: is the system standing?

**Why are tests organized by module, then by scope?**

```
cypress/tests/
└── saucedemo/
    ├── smoke/
    │   └── saucedemo-smoke.cy.js
    └── e2e/
        └── saucedemo-e2e.cy.js
```

Module-first organization means you can run all tests for one feature in isolation:

```bash
npx cypress run --spec "cypress/tests/saucedemo/**"
```

Scope-first organization (all smoke files in one folder) would make this impossible without grep filtering. Module-first also makes ownership clear: the payments team owns `cypress/tests/payments/` entirely.

---

## Part 3 — Why Custom Commands, and How to Organize Them

### The GoF Command Pattern Applied to Cypress

The Gang of Four's Command pattern (Design Patterns, 1994) encapsulates a request as an object, separating the requester from the executor. In Cypress, `cy.addToCart('sauce-labs-backpack')` encapsulates the interaction sequence — the spec is the requester, the command file is the executor. The spec does not know whether clicking "Add to Cart" triggers a network request, updates local state, or does both. That complexity is invisible to the test.

The three benefits:
1. **Encapsulation** — the spec stays readable and the command owns all complexity
2. **Reusability** — `cy.addToCart()` is called from 5 different tests, fixing in one place fixes all 5
3. **Resilience** — when the "Add to Cart" button is renamed, only the command file changes

### Domain-First, Not Page-First, Not Element-First

The most common mistake when organizing commands is modeling the directory structure on the UI — creating `checkout-page.commands.js` or worse, `buttons.commands.js`.

**Why not page-first?**

A checkout flow that spans three pages (`checkout-step-one.html`, `checkout-step-two.html`, `checkout-complete.html`) belongs to one domain: *checkout*. If you create `checkout-step-one.commands.js` and `checkout-step-two.commands.js`, a full checkout test has to import from two files. When the app refactors steps 1 and 2 into a single modal, you now have two files to merge.

`checkout.commands.js` owns the entire checkout *domain*. The number of pages is an implementation detail.

**Why not element-first?**

`button.commands.js`, `input.commands.js`, `dropdown.commands.js` — this is the anti-pattern of organizing by what something *is* rather than what it *does*. The submit button in a checkout form is fundamentally different from the submit button in a login form. Grouping them by element type creates a generic abstraction that serves no test use case.

**Domain-first means:** one command file per feature area of the application. `payments.commands.js` owns everything a test needs to interact with the payments feature — navigation, actions, assertions. The tests themselves remain thin:

```javascript
// From the spec — this is the ideal state
it("completes a purchase", () => {
  cy.visitInventory();
  cy.addToCart("sauce-labs-backpack");
  cy.visitCart();
  cy.proceedToCheckout();
  cy.fillCheckoutInfo({ firstName: "Test", lastName: "User", postalCode: "12345" });
  cy.finishOrder();
  cy.assertOrderConfirmed();
});
```

No selectors. No URLs. No waits. The test reads like acceptance criteria.

### When to Make a Command Cross-Module (Common vs Module)

The rule is usage count, not intuition:

| Question | Answer | Where the command lives |
|----------|--------|------------------------|
| Is this command used by exactly one module? | Yes | `commands/modules/[module].commands.js` |
| Is this command used by two or more modules? | Yes | `commands/common/[category].commands.js` |
| Is this command used by every module? | Yes | `commands/common/ui.commands.js` or `auth.commands.js` |

`cy.getByTestId()` is used by every module — it lives in `common/ui.commands.js`. `cy.addToCart()` is used only by the saucedemo module — it lives in `modules/saucedemo.commands.js`. This distinction is not arbitrary; it is how you prevent cross-module coupling.

---

## Part 4 — Why Core / Common / Modules Are Three Separate Tiers

This is the most important architectural decision in the framework, and the most commonly misunderstood one.

### The Three Tiers

```
cypress/support/
├── core/api/           ← Tier 1: Framework infrastructure
│   ├── api.engine.js
│   ├── api.commands.js
│   └── schema.commands.js
│
├── commands/common/    ← Tier 2: Cross-module app contracts
│   ├── auth.commands.js
│   ├── navigation.commands.js
│   ├── ui.commands.js
│   ├── filter.commands.js
│   ├── form.commands.js
│   └── table.commands.js
│
└── commands/modules/   ← Tier 3: Feature isolation
    ├── payments.commands.js
    └── checkout.commands.js
```

### Tier 1: Core — Framework Infrastructure

`core/` is the Cypress abstraction layer. It knows nothing about your application. It provides the engine that makes `cy.apiIntercept()`, `cy.apiWait()`, `cy.validateSchema()` work.

**Who owns it?** The framework author. In a team setting, this means the QA lead or the person who set up the framework.

**Who touches it?** Nobody, ordinarily. These files change when the framework itself needs an upgrade — a new API command, a change to how intercepts are registered, support for a new response format. This happens rarely and intentionally.

**Why is it separate?** Because any change to `api.engine.js` affects every test in the entire suite. A bug introduced here breaks everything. Separation signals danger: "before touching this file, understand the blast radius."

In production infrastructure terms, `core/` is your platform layer — like the OS your application runs on. You do not modify the OS to fix an application bug.

### Tier 2: Common — Cross-Module App Contracts

`commands/common/` knows about your application's universal patterns but not about any specific feature.

`auth.commands.js` knows how users log in to your application (your auth URL, your form selectors, your session mechanism). It does not know anything about payments or checkout. This is intentional — auth is a shared infrastructure concern, not a feature concern.

`navigation.commands.js` knows about `ROUTES` and how to navigate. It does not know what the payments page looks like.

`table.commands.js` knows how to interact with tables generically. It does not know about the payments table specifically.

**Who owns it?** The whole team, by consensus. Any developer can add a command here — but only if it is genuinely cross-module. If a command is added here that is actually specific to one module, it will be called from that one module and never again. That is the signal it does not belong here.

**Why is common separate from modules?** Because common commands are shared contracts. If you change `cy.ensureAuthenticated()`, you affect every spec that calls it. That is a team-wide impact. If you change `cy.visitPayments()`, you affect only the payments specs. The separation makes the blast radius explicit and controllable.

### Tier 3: Modules — Feature Isolation

`commands/modules/` knows about one specific feature area and nothing else.

`saucedemo.commands.js` imports `SAUCEDEMO_UI` and `ROUTES.SAUCEDEMO`. It does not import anything from any other module's configs. It cannot break any other module. A developer working on checkout can modify `saucedemo.commands.js` with full confidence that their changes are contained.

**Why is feature isolation important?** Because teams work on features independently. If `payments.commands.js` imported selectors from `checkout.ui.js`, a checkout change could break payment tests — silently, at runtime, with no obvious connection. Module isolation prevents this entire class of cross-feature test pollution.

### The Dependency Direction Rule

The only allowed import direction is downward:

```
modules/  can import from  common/  and  core/
common/   can import from  core/    only
core/     imports from     nothing (pure Cypress)
```

The reverse is forbidden:

```
core/     NEVER imports from  common/  or  modules/
common/   NEVER imports from  modules/
```

This is Robert Martin's Dependency Inversion Principle applied to test architecture. High-level policy (core framework behaviour) must not depend on low-level details (specific feature commands). If `api.engine.js` imported from `payments.commands.js`, the framework would need to be updated every time a payment endpoint changed. That inversion would destroy the framework's stability.

In practice, the easiest way to verify you are following this rule: core files have no `import` statements that reference anything outside `core/`. Common files have no imports from `modules/`. Violations of this rule are always a signal that the abstraction boundary is wrong — move the code up the chain, never down it.

---

## Part 5 — The POM Question: For Teams Coming From Page Objects

If your team has written Page Object Model tests before, the command-first architecture will look familiar in structure but unfamiliar in ownership.

**POM and command-first solve the same problem differently.**

| Aspect | Page Object Model | Command-First |
|--------|------------------|---------------|
| Selector storage | Inside the page class | `configs/ui/` config files |
| Action encapsulation | Page class methods | `cy.*` commands |
| Reuse mechanism | Instantiating the page class | Calling the global command |
| Ownership enforcement | Convention | Directory structure + hooks |
| Inheritance risk | High (BaseClass → SpecificPage) | None (commands are flat) |
| Discoverability | Browse class files | `commands.js` registry |

**What is the same:** Both approaches move selectors and interactions out of specs. Both aim for reusable, readable tests.

**What is different:** POM mixes responsibilities in one class — the `PaymentsPage` class stores selectors and exposes methods. This creates dual ownership: the class is both a locator map and a behaviour library. Over time, methods accumulate that belong in commands (data generation, assertions, navigation). The class grows and ownership becomes unclear.

In command-first, these responsibilities are formally separated:
- Selectors → `configs/ui/` (pure data, frozen, no logic)
- Behaviour → `commands/modules/` (pure behaviour, no data)

**The practical migration question:** If you have existing POM tests, the `cypress-command-first-migration` skill (`/cypress-command-first-migration`) provides a guided workflow for extracting selectors into configs and converting page methods into commands. The goal is not to throw away the investment in your POM tests — it is to make that investment durable by moving each responsibility to a layer that enforces it.

---

## Summary: One Table

| Decision | The Rule | The Principle Behind It |
|----------|----------|------------------------|
| Selectors in `configs/ui/` | One source of truth per selector | DRY — Andrew Hunt & David Thomas |
| API intercepts in `configs/api/` | Network contracts are a separate concern from UI | Separation of Concerns |
| Routes in `routes.js` | URL paths are first-class application contracts | Single Source of Truth |
| `smoke/` vs `e2e/` split | Fast feedback on critical path, full coverage less often | Test Pyramid — Mike Cohn |
| Tests organized by module, then scope | Feature ownership over test type ownership | Domain-Driven Design — Eric Evans |
| Commands organized by domain, not page | Pages are implementation details; domains are stable | Stable Abstractions Principle |
| Common vs modules separation | Blast radius must be explicit and controllable | Dependency Inversion — Robert Martin |
| Core never modified | Platform stability is non-negotiable | Open/Closed Principle |
| `Object.freeze()` on all configs | Configs are immutable data, not mutable state | Immutability as a design constraint |
| `data-cy` attributes required | Test selectors are contracts, not coincidences | Explicit API surface contract |
