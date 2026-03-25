/**
 * @fileoverview Navigation commands.
 *
 * cy.navigateTo(route)          — visit a ROUTES constant, assert URL.
 * cy.assertCurrentRoute(route)  — assert current URL matches route.
 */

import { ROUTES } from "@configs/app/routes";

Cypress.Commands.add("navigateTo", (route) => {
  cy.visit(route);
  cy.url().should("include", route);
});

Cypress.Commands.add("navigateToDashboard", () => {
  cy.navigateTo(ROUTES.DASHBOARD.ROOT);
});

Cypress.Commands.add("assertCurrentRoute", (route) => {
  cy.url().should("include", route);
});
