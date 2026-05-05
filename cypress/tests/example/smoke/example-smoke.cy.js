/**
 * @fileoverview Example smoke spec — demonstrates the full command-first pattern.
 *
 * THIS FILE IS THE CANONICAL EXAMPLE. Copy it to start a new module spec.
 *
 * Architectural rules enforced here:
 *   ✅ cy.ensureAuthenticated() in beforeEach() — session cached, not re-run per test
 *   ✅ cy.interceptExampleRequests() in beforeEach() — intercepts registered before visit
 *   ✅ cy.apiWait('@alias') — never cy.wait(number)
 *   ✅ [data-cy] selectors only — via ui config constants
 *   ✅ @cypress/grep tags — @smoke, @example
 *   ✅ Multiple assertions per test — this is E2E, not a unit test
 *   ✅ State reset in beforeEach — not afterEach
 */

import { EXAMPLE_SCHEMAS } from "@schemas/example.schema";
import { EXAMPLE_CONFIG } from "@configs/api/modules/example/example.api";
import { EXAMPLE_UI } from "@configs/ui/modules/example/example.ui";
import { ROUTES } from "@configs/app/routes";

// @no-ensureAuthenticated — template only; describe.skip prevents execution. Real modules must use cy.ensureAuthenticated() in beforeEach().
// TEMPLATE ONLY — copy this file to start a new module spec.
// Skipped: no backing application exists at baseUrl for these commands.
describe.skip("Example Module", { tags: ["@example"] }, () => {
  beforeEach(() => {
    cy.ensureAuthenticated();
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
      cy.assertTableHasRows(`[data-cy="${EXAMPLE_UI.LIST.TABLE}"]`, 1);
    });
  });

  it("resets the list when search is cleared", () => {
    cy.fixture("example").then(({ searchQuery }) => {
      cy.searchExamples(searchQuery);
      cy.clearExampleSearch();
      cy.assertTableHasRows(`[data-cy="${EXAMPLE_UI.LIST.TABLE}"]`, 1);
    });
  });

  // ─── Create ────────────────────────────────────────────────────────────────

  it("creates a new example item", () => {
    cy.fixture("example").then(({ newItem }) => {
      cy.visit(ROUTES.EXAMPLE.CREATE);
      cy.createExample(newItem);
      cy.assertToast("created successfully");
    });
  });
});
