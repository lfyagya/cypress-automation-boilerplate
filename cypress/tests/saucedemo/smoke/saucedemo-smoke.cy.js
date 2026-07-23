// @no-ensureAuthenticated — saucedemo uses cy.loginSaucedemo() (cy.session-based) as its auth mechanism.

/**
 * @fileoverview Saucedemo smoke tests — real-world demo of the command-first pattern.
 *
 * Target: https://www.saucedemo.com  (public Sauce Labs demo site)
 *
 * Architecture rules enforced:
 *   cy.loginSaucedemo() in beforeEach() — session cached via cy.session()
 *   cy.visitInventory() in beforeEach() — clean state per test
 *   All selectors via SAUCEDEMO_UI config — zero hardcoded selectors
 *   All routes via ROUTES.SAUCEDEMO constants — zero hardcoded URLs
 *   No cy.wait(number) — all waits are assertion-driven
 *   @cypress/grep tags — @smoke, @saucedemo, @cart, @checkout
 */

import { SAUCEDEMO_UI } from "@configs/ui/modules/saucedemo/saucedemo.ui";
import { ROUTES } from "@configs/app/routes";

describe("Saucedemo — Smoke Tests", { tags: ["@saucedemo"] }, () => {
  beforeEach(() => {
    cy.loginSaucedemo();
    cy.visitInventory();
  });

  it("loads the inventory page with products", { tags: ["@smoke"] }, () => {
    cy.get(SAUCEDEMO_UI.INVENTORY.CONTAINER).should("be.visible");
    cy.get(SAUCEDEMO_UI.INVENTORY.ITEM).should("have.length.gte", 6);
    cy.get(SAUCEDEMO_UI.HEADER.APP_LOGO)
      .should("be.visible")
      .and("contain.text", "Swag Labs");
  });

  it(
    "adds a product to the cart and updates the badge",
    { tags: ["@smoke", "@cart"] },
    () => {
      cy.assertCartIsEmpty();
      cy.addToCart("sauce-labs-backpack");
      cy.assertCartBadge(1);
    },
  );

  it(
    "completes a full checkout flow",
    { tags: ["@smoke", "@checkout"] },
    () => {
      cy.addToCart("sauce-labs-backpack");
      cy.addToCart("sauce-labs-fleece-jacket");

      cy.visitCart();
      cy.get(SAUCEDEMO_UI.CART.ITEM).should("have.length", 2);

      cy.proceedToCheckout();
      cy.fillCheckoutInfo({
        firstName: "Test",
        lastName: "User",
        postalCode: "12345",
      });

      // Overview: confirm items and total visible before finishing
      cy.get(SAUCEDEMO_UI.OVERVIEW.ITEM).should("have.length", 2);
      cy.get(SAUCEDEMO_UI.OVERVIEW.TOTAL).should("be.visible");

      cy.finishOrder();
      cy.assertOrderConfirmed();
    },
  );
});

// ─── Authentication edge case ─────────────────────────────────────────────────
// Run without a cached session — need a fresh visit to the login page.
describe(
  "Saucedemo — Login Validation",
  { tags: ["@saucedemo", "@auth"] },
  () => {
    it("shows an error for a locked-out user", { tags: ["@smoke"] }, () => {
      cy.visit(ROUTES.SAUCEDEMO.LOGIN);
      cy.get(SAUCEDEMO_UI.LOGIN.USERNAME_INPUT).type("locked_out_user");
      cy.get(SAUCEDEMO_UI.LOGIN.PASSWORD_INPUT).type("secret_sauce");
      cy.get(SAUCEDEMO_UI.LOGIN.LOGIN_BTN).click();
      cy.get(SAUCEDEMO_UI.LOGIN.ERROR_MSG)
        .should("be.visible")
        .and("contain.text", "Sorry, this user has been locked out");
    });
  },
);
