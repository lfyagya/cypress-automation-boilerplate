/**
 * @fileoverview UI utility commands.
 *
 * cy.getByTestId(id)          — query [data-cy="id"]   — for apps using data-cy attributes.
 * cy.getByDataTest(id)        — query [data-test="id"] — for apps using data-test attributes (e.g. Saucedemo).
 * cy.ensureVisible(selector)  — assert visible before interaction.
 * cy.assertToast(message)     — assert toast/snackbar notification text.
 * cy.assertLoadingComplete()  — wait for loading spinners to disappear.
 * cy.closeModal()             — close an open modal dialog.
 */

// For apps using [data-cy="..."] attributes (e.g. internal apps, example module)
Cypress.Commands.add("getByTestId", (id, options = {}) => {
  return cy.get(`[data-cy="${id}"]`, options);
});

// For apps using [data-test="..."] attributes (e.g. Saucedemo)
Cypress.Commands.add("getByDataTest", (id, options = {}) => {
  return cy.get(`[data-test="${id}"]`, options);
});

Cypress.Commands.add("ensureVisible", (selector, options = {}) => {
  return cy.get(selector, options).should("be.visible");
});

Cypress.Commands.add("assertToast", (message) => {
  cy.get('[data-cy="toast"], [data-cy="snackbar"], [role="alert"]')
    .should("be.visible")
    .and("contain.text", message);
});

Cypress.Commands.add("assertLoadingComplete", () => {
  cy.get('[data-cy*="loading"], [data-cy*="spinner"]', {
    timeout: 10000,
  }).should("not.exist");
});

Cypress.Commands.add("closeModal", () => {
  cy.get('[data-cy="modal-close"], [data-cy="dialog-close"]').click();
  cy.get('[data-cy="modal"], [data-cy="dialog"]').should("not.exist");
});
