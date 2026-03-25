/**
 * @fileoverview Saucedemo (https://www.saucedemo.com) module commands.
 *
 * Demonstrates the command-first pattern against a real publicly accessible
 * demo site. All selectors come from SAUCEDEMO_UI, all routes from ROUTES.
 *
 * Available commands:
 *   cy.loginSaucedemo(username?, password?)   — login with session caching
 *   cy.visitInventory()                       — navigate to /inventory.html
 *   cy.visitCart()                            — navigate to /cart.html
 *   cy.addToCart(productName)                 — add a product by kebab-case name
 *   cy.removeFromCart(productName)            — remove while on inventory page
 *   cy.assertCartBadge(count)                 — assert the header cart badge count
 *   cy.assertCartIsEmpty()                    — assert no badge visible
 *   cy.proceedToCheckout()                    — clicks Checkout button in cart
 *   cy.fillCheckoutInfo(info)                 — fills step-one personal info form
 *   cy.finishOrder()                          — clicks Finish on order overview
 *   cy.assertOrderConfirmed()                 — asserts confirmation page message
 *   cy.sortInventoryBy(option)                — selects a sort option
 *   cy.logoutSaucedemo()                      — opens menu and clicks Logout
 */

import { SAUCEDEMO_UI } from "@configs/ui/modules/saucedemo/saucedemo.ui";
import { ROUTES } from "@configs/app/routes";

const SESSION_KEY = "saucedemo-session";

// ─── Authentication ───────────────────────────────────────────────────────────

/**
 * Login to Saucedemo using cy.session() for caching across tests.
 * Defaults to env vars: `saucedemo_username` / `saucedemo_password`
 */
Cypress.Commands.add("loginSaucedemo", (username, password) => {
  const user = username ?? Cypress.env("saucedemo_username");
  const pass = password ?? Cypress.env("saucedemo_password");

  cy.session(
    [SESSION_KEY, user],
    () => {
      cy.visit(ROUTES.SAUCEDEMO.LOGIN);
      cy.get(SAUCEDEMO_UI.LOGIN.USERNAME_INPUT).type(user);
      cy.get(SAUCEDEMO_UI.LOGIN.PASSWORD_INPUT).type(pass, { log: false });
      cy.get(SAUCEDEMO_UI.LOGIN.LOGIN_BTN).click();
      // Confirm successful login — landing on inventory page
      cy.url().should("include", ROUTES.SAUCEDEMO.INVENTORY);
    },
    { cacheAcrossSpecs: true },
  );
});

Cypress.Commands.add("logoutSaucedemo", () => {
  cy.get(SAUCEDEMO_UI.HEADER.MENU_BTN).click();
  cy.get(SAUCEDEMO_UI.HEADER.LOGOUT_LINK).should("be.visible").click();
  cy.url().should("not.include", ROUTES.SAUCEDEMO.INVENTORY);
});

// ─── Navigation ──────────────────────────────────────────────────────────────

Cypress.Commands.add("visitInventory", () => {
  cy.visit(ROUTES.SAUCEDEMO.INVENTORY, { failOnStatusCode: false });
  cy.get(SAUCEDEMO_UI.INVENTORY.CONTAINER).should("be.visible");
});

Cypress.Commands.add("visitCart", () => {
  cy.visit(ROUTES.SAUCEDEMO.CART, { failOnStatusCode: false });
  cy.get(SAUCEDEMO_UI.CART.CONTAINER).should("exist");
});

// ─── Inventory interactions ───────────────────────────────────────────────────

/**
 * Add a product to the cart.
 * @param {string} productName - kebab-case product name matching the data-test attr
 *   e.g. 'sauce-labs-backpack', 'sauce-labs-bike-light'
 */
Cypress.Commands.add("addToCart", (productName) => {
  cy.get(SAUCEDEMO_UI.PRODUCT_ITEM.ADD_TO_CART_BTN(productName))
    .should("be.visible")
    .click();
});

Cypress.Commands.add("removeFromCart", (productName) => {
  cy.get(SAUCEDEMO_UI.PRODUCT_ITEM.REMOVE_BTN(productName))
    .should("be.visible")
    .click();
});

Cypress.Commands.add("sortInventoryBy", (option) => {
  cy.get(SAUCEDEMO_UI.INVENTORY.SORT_DROPDOWN).select(option);
});

// ─── Cart assertions ──────────────────────────────────────────────────────────

Cypress.Commands.add("assertCartBadge", (expectedCount) => {
  cy.get(SAUCEDEMO_UI.HEADER.CART_BADGE)
    .should("be.visible")
    .and("have.text", String(expectedCount));
});

Cypress.Commands.add("assertCartIsEmpty", () => {
  cy.get(SAUCEDEMO_UI.HEADER.CART_BADGE).should("not.exist");
});

// ─── Checkout ────────────────────────────────────────────────────────────────

Cypress.Commands.add("proceedToCheckout", () => {
  cy.get(SAUCEDEMO_UI.CART.CHECKOUT_BTN).should("be.visible").click();
  cy.url().should("include", ROUTES.SAUCEDEMO.CHECKOUT_STEP_ONE);
});

/**
 * Fill the checkout personal information form (step one).
 * @param {{ firstName: string, lastName: string, postalCode: string }} info
 */
Cypress.Commands.add(
  "fillCheckoutInfo",
  ({ firstName, lastName, postalCode }) => {
    cy.get(SAUCEDEMO_UI.CHECKOUT.FIRST_NAME_INPUT).type(firstName);
    cy.get(SAUCEDEMO_UI.CHECKOUT.LAST_NAME_INPUT).type(lastName);
    cy.get(SAUCEDEMO_UI.CHECKOUT.POSTAL_CODE_INPUT).type(postalCode);
    cy.get(SAUCEDEMO_UI.CHECKOUT.CONTINUE_BTN).click();
    cy.url().should("include", ROUTES.SAUCEDEMO.CHECKOUT_STEP_TWO);
  },
);

Cypress.Commands.add("finishOrder", () => {
  cy.get(SAUCEDEMO_UI.OVERVIEW.FINISH_BTN).should("be.visible").click();
  cy.url().should("include", ROUTES.SAUCEDEMO.CHECKOUT_COMPLETE);
});

// ─── Order confirmation assertion ─────────────────────────────────────────────

Cypress.Commands.add("assertOrderConfirmed", () => {
  cy.get(SAUCEDEMO_UI.CONFIRMATION.CONTAINER).should("be.visible");
  cy.get(SAUCEDEMO_UI.CONFIRMATION.HEADER)
    .should("be.visible")
    .and("have.text", "Thank you for your order!");
});
