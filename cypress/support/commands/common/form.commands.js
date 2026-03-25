/**
 * @fileoverview Form interaction commands.
 *
 * cy.fillField(selector, value)         — clear and type into an input.
 * cy.selectOption(selector, value)      — choose a select/dropdown option.
 * cy.fillForm(fieldMap)                 — fill multiple fields using a { selector: value } map.
 * cy.submitForm(submitBtnSelector)      — click submit and wait for response.
 * cy.assertFormError(selector, message) — assert inline validation error text.
 */

Cypress.Commands.add("fillField", (selector, value) => {
  cy.get(selector).clear().type(value);
});

Cypress.Commands.add("selectOption", (selector, value) => {
  cy.get(selector).select(value);
});

Cypress.Commands.add("fillForm", (fieldMap) => {
  Object.entries(fieldMap).forEach(([selector, value]) => {
    cy.get(selector).clear().type(value);
  });
});

Cypress.Commands.add("submitForm", (submitBtnSelector) => {
  cy.get(submitBtnSelector).click();
});

Cypress.Commands.add("assertFormError", (selector, message) => {
  cy.get(selector).should("be.visible").and("contain.text", message);
});
