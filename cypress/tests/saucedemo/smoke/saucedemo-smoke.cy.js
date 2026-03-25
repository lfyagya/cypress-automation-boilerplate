/**
 * @fileoverview Saucedemo smoke tests — real-world demo of the command-first pattern.
 *
 * Target: https://www.saucedemo.com  (public Sauce Labs demo site)
 *
 * Architecture rules enforced:
 *   ✅ cy.loginSaucedemo() in before() — session cached via cy.session()
 *   ✅ cy.visitInventory() in beforeEach() — clean state per test
 *   ✅ All selectors via SAUCEDEMO_UI config — zero hardcoded selectors
 *   ✅ All routes via ROUTES.SAUCEDEMO constants — zero hardcoded URLs
 *   ✅ No cy.wait(number) — all waits are assertion-driven
 *   ✅ @cypress/grep tags — @smoke, @saucedemo, @cart, @checkout
 *
 * Test coverage:
 *   - Login + session caching
 *   - Inventory page loads with products
 *   - Add to cart / cart badge updates
 *   - Remove from cart
 *   - Sorting (name A→Z, price low→high)
 *   - Full checkout happy path
 *   - Locked-out user login error
 */

import { SAUCEDEMO_UI } from "@configs/ui/modules/saucedemo/saucedemo.ui";
import { ROUTES } from "@configs/app/routes";

describe("Saucedemo — Smoke Tests", { tags: ["@saucedemo"] }, () => {
  before(() => {
    cy.loginSaucedemo();
  });

  beforeEach(() => {
    cy.visitInventory();
  });

  // ─── Inventory ─────────────────────────────────────────────────────────────

  it("loads the inventory page with products", { tags: ["@smoke"] }, () => {
    cy.get(SAUCEDEMO_UI.INVENTORY.CONTAINER).should("be.visible");
    cy.get(SAUCEDEMO_UI.INVENTORY.ITEM).should("have.length.gte", 6);
    cy.get(SAUCEDEMO_UI.HEADER.APP_LOGO)
      .should("be.visible")
      .and("contain.text", "Swag Labs");
  });

  it("displays product names and prices", { tags: ["@smoke"] }, () => {
    cy.get(SAUCEDEMO_UI.INVENTORY.ITEM_NAME).first().should("not.be.empty");
    cy.get(SAUCEDEMO_UI.INVENTORY.ITEM_PRICE)
      .first()
      .invoke("text")
      .should("match", /^\$\d+\.\d{2}$/);
  });

  // ─── Sort ──────────────────────────────────────────────────────────────────

  it("sorts inventory by Name (A to Z)", { tags: ["@smoke"] }, () => {
    cy.sortInventoryBy("az");
    cy.get(SAUCEDEMO_UI.INVENTORY.ITEM_NAME).then(($names) => {
      const names = [...$names].map((el) => el.innerText);
      const sorted = [...names].sort();
      expect(names).to.deep.equal(sorted);
    });
  });

  it("sorts inventory by Price (low to high)", () => {
    cy.sortInventoryBy("lohi");
    cy.get(SAUCEDEMO_UI.INVENTORY.ITEM_PRICE).then(($prices) => {
      const prices = [...$prices].map((el) => parseFloat(el.innerText.replace("$", "")));
      const sorted = [...prices].sort((a, b) => a - b);
      expect(prices).to.deep.equal(sorted);
    });
  });

  // ─── Cart ──────────────────────────────────────────────────────────────────

  it("adds a product to the cart and updates the badge", { tags: ["@smoke", "@cart"] }, () => {
    cy.assertCartIsEmpty();
    cy.addToCart("sauce-labs-backpack");
    cy.assertCartBadge(1);
  });

  it("adds multiple products and reflects correct badge count", { tags: ["@cart"] }, () => {
    cy.addToCart("sauce-labs-backpack");
    cy.addToCart("sauce-labs-bike-light");
    cy.assertCartBadge(2);
  });

  it("removes a product and updates the badge", { tags: ["@cart"] }, () => {
    cy.addToCart("sauce-labs-backpack");
    cy.assertCartBadge(1);
    cy.removeFromCart("sauce-labs-backpack");
    cy.assertCartIsEmpty();
  });

  it("displays added products in the cart", { tags: ["@cart"] }, () => {
    cy.addToCart("sauce-labs-backpack");
    cy.get(SAUCEDEMO_UI.HEADER.CART_ICON).click();
    cy.url().should("include", ROUTES.SAUCEDEMO.CART);
    cy.get(SAUCEDEMO_UI.CART.ITEM).should("have.length", 1);
    cy.get(SAUCEDEMO_UI.CART.ITEM_NAME)
      .first()
      .should("contain.text", "Sauce Labs Backpack");
  });

  // ─── Checkout — Happy Path ─────────────────────────────────────────────────

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

// ─── Authentication edge cases ────────────────────────────────────────────────
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

    it("shows an error for invalid credentials", () => {
      cy.visit(ROUTES.SAUCEDEMO.LOGIN);
      cy.get(SAUCEDEMO_UI.LOGIN.USERNAME_INPUT).type("invalid_user");
      cy.get(SAUCEDEMO_UI.LOGIN.PASSWORD_INPUT).type("wrong_password");
      cy.get(SAUCEDEMO_UI.LOGIN.LOGIN_BTN).click();
      cy.get(SAUCEDEMO_UI.LOGIN.ERROR_MSG)
        .should("be.visible")
        .and("contain.text", "Username and password do not match");
    });
  },
);
