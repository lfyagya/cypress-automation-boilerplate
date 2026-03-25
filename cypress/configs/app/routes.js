/**
 * @fileoverview Application route registry.
 * All navigable URL paths are defined here. Commands import from this file — never hardcode URLs.
 *
 * Pattern:
 *   const MODULE = { ROOT: '/path', DETAIL: (id) => `/path/${id}` };
 *   export const ROUTES = Object.freeze({ MODULE });
 */

const DASHBOARD = Object.freeze({
  ROOT: "/dashboard",
});

const EXAMPLE = Object.freeze({
  ROOT: "/example",
  DETAIL: (id) => `/example/${id}`,
  CREATE: "/example/new",
});

// ─── Saucedemo (https://www.saucedemo.com) ───────────────────────────────────
const SAUCEDEMO = Object.freeze({
  LOGIN: "/",
  INVENTORY: "/inventory.html",
  CART: "/cart.html",
  CHECKOUT_STEP_ONE: "/checkout-step-one.html",
  CHECKOUT_STEP_TWO: "/checkout-step-two.html",
  CHECKOUT_COMPLETE: "/checkout-complete.html",
  PRODUCT_DETAIL: (productName) => `/inventory-item.html?id=${productName}`,
});

export const ROUTES = Object.freeze({
  DASHBOARD,
  EXAMPLE,
  SAUCEDEMO,
});

/**
 * Returns the full URL for a given route constant.
 * @param {string} path - A ROUTES constant value
 * @returns {string}
 */
export const getFullUrl = (path) => `${Cypress.env("baseUrl")}${path}`;
