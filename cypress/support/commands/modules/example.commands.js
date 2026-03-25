/**
 * @fileoverview Example module commands.
 * All commands import selectors from ui config and API aliases from api config.
 * Commands are verb-first: loadExampleList, searchExamples, createExample, etc.
 */

import { EXAMPLE_CONFIG } from "@configs/api/modules/example/example.api";
import { EXAMPLE_UI } from "@configs/ui/modules/example/example.ui";
import { ROUTES } from "@configs/app/routes";

// ─── Intercepts (register before cy.visit) ───────────────────────────────────

Cypress.Commands.add("interceptExampleRequests", () => {
  cy.apiInterceptAll(EXAMPLE_CONFIG);
});

// ─── Navigation ──────────────────────────────────────────────────────────────

Cypress.Commands.add("visitExampleList", () => {
  cy.interceptExampleRequests();
  cy.visit(ROUTES.EXAMPLE.ROOT);
  cy.apiWait(EXAMPLE_CONFIG.EXAMPLES_LIST);
});

// ─── Search / Filter ─────────────────────────────────────────────────────────

Cypress.Commands.add("searchExamples", (query) => {
  cy.apiIntercept(EXAMPLE_CONFIG.EXAMPLE_SEARCH);
  cy.get(EXAMPLE_UI.LIST.SEARCH_INPUT).clear().type(query);
  cy.get(EXAMPLE_UI.LIST.SEARCH_BTN).click();
  cy.apiWait(EXAMPLE_CONFIG.EXAMPLE_SEARCH);
});

Cypress.Commands.add("clearExampleSearch", () => {
  cy.get(EXAMPLE_UI.LIST.CLEAR_BTN).click();
  cy.apiWait(EXAMPLE_CONFIG.EXAMPLES_LIST);
});

// ─── Assertions ──────────────────────────────────────────────────────────────

Cypress.Commands.add("assertExampleListLoaded", () => {
  cy.get(EXAMPLE_UI.LIST.TABLE).should("be.visible");
  cy.get(EXAMPLE_UI.LIST.LOADING_SPINNER).should("not.exist");
});

Cypress.Commands.add("assertExampleEmptyState", () => {
  cy.get(EXAMPLE_UI.LIST.EMPTY_STATE).should("be.visible");
});

// ─── Create / Edit ───────────────────────────────────────────────────────────

Cypress.Commands.add("createExample", (fields) => {
  cy.apiIntercept(EXAMPLE_CONFIG.EXAMPLES_CREATE);
  cy.fillForm({
    [EXAMPLE_UI.FORM.NAME_INPUT]: fields.name,
  });
  if (fields.status)
    cy.selectOption(EXAMPLE_UI.FORM.STATUS_SELECT, fields.status);
  cy.get(EXAMPLE_UI.FORM.SUBMIT_BTN).click();
  cy.apiWait(EXAMPLE_CONFIG.EXAMPLES_CREATE)
    .its("response.statusCode")
    .should("eq", 201);
});
