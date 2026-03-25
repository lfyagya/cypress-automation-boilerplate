/**
 * @fileoverview Filter/search commands.
 * Generic filtering interactions — reused across any module that has a search bar.
 *
 * cy.applySearch(inputSelector, value)      — type into search and trigger search.
 * cy.clearSearch(inputSelector, clearBtn)   — clear search and reset results.
 * cy.assertFilterApplied(chipSelector)      — assert a filter chip is displayed.
 * cy.removeFilterChip(chipSelector)         — remove a filter chip.
 */

Cypress.Commands.add("applySearch", (inputSelector, value) => {
  cy.get(inputSelector).clear().type(value);
  cy.get(inputSelector).type("{enter}");
});

Cypress.Commands.add("clearSearch", (inputSelector, clearBtnSelector) => {
  cy.get(clearBtnSelector).click();
  cy.get(inputSelector).should("have.value", "");
});

Cypress.Commands.add("assertFilterApplied", (chipSelector) => {
  cy.get(chipSelector).should("be.visible");
});

Cypress.Commands.add("removeFilterChip", (chipSelector) => {
  cy.get(chipSelector).find('[data-cy="filter-chip-remove"]').click();
  cy.get(chipSelector).should("not.exist");
});
