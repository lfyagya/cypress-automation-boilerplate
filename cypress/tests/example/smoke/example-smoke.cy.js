/**
 * @fileoverview Example smoke spec — demonstrates the full command-first pattern.
 *
 * THIS FILE IS THE CANONICAL EXAMPLE. Copy it to start a new module spec.
 *
 * Architectural rules enforced here:
 *   ✅ cy.ensureAuthenticated() in before() — session cached, not re-run per test
 *   ✅ cy.interceptExampleRequests() in beforeEach() — intercepts registered before visit
 *   ✅ cy.apiWait('@alias') — never cy.wait(number)
 *   ✅ [data-cy] selectors only — via ui config constants
 *   ✅ @cypress/grep tags — @smoke, @example
 *   ✅ Multiple assertions per test — this is E2E, not a unit test
 *   ✅ State reset in beforeEach — not afterEach
 */

import { EXAMPLE_SCHEMAS } from "@schemas/example.schema";
import { EXAMPLE_CONFIG } from "@configs/api/modules/example/example.api";

describe("Example Module", { tags: ["@example"] }, () => {
  before(() => {
    cy.ensureAuthenticated();
  });

  beforeEach(() => {
    // Intercepts MUST be registered before cy.visit() so no requests are missed
    cy.visitExampleList();
  });

  // ─── Smoke: Page Load ──────────────────────────────────────────────────────

  it("loads the example list", { tags: ["@smoke"] }, () => {
    cy.assertExampleListLoaded();
    cy.assertLoadingComplete();
  });

  it("validates the list API response shape", { tags: ["@smoke"] }, () => {
    cy.apiWait(EXAMPLE_CONFIG.EXAMPLES_LIST).then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      cy.validateSchema(response.body, EXAMPLE_SCHEMAS.LIST);
    });
  });

  // ─── Search ────────────────────────────────────────────────────────────────

  it("filters results when a search query is entered", () => {
    cy.fixture("example").then(({ searchQuery }) => {
      cy.searchExamples(searchQuery);
      cy.assertTableHasRows('[data-cy="example-table"]', 1);
    });
  });

  it("resets the list when search is cleared", () => {
    cy.fixture("example").then(({ searchQuery }) => {
      cy.searchExamples(searchQuery);
      cy.clearExampleSearch();
      cy.assertTableHasRows('[data-cy="example-table"]', 1);
    });
  });

  // ─── Create ────────────────────────────────────────────────────────────────

  it("creates a new example item", () => {
    cy.fixture("example").then(({ newItem }) => {
      // Navigate to create form
      cy.navigateTo("/example/new");
      cy.createExample(newItem);
      cy.assertToast("created successfully");
    });
  });
});
