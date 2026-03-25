/**
 * @fileoverview Saucedemo (https://www.saucedemo.com) UI selector constants.
 *
 * All selectors verified against live DOM via agentic browser inspection (March 2026).
 * Saucedemo uses [data-test="..."] attributes throughout — prefer these over CSS classes.
 *
 * 6 products on the inventory page (sorted A→Z by default):
 *   sauce-labs-backpack           $29.99  (item-4)
 *   sauce-labs-bike-light         $9.99   (item-0)
 *   sauce-labs-bolt-t-shirt       $15.99  (item-1)
 *   sauce-labs-fleece-jacket      $49.99  (item-5)
 *   sauce-labs-onesie             $7.99   (item-2)
 *   test.allthethings()-t-shirt-(red)  $15.99  (item-3)
 *
 * Sort option values: 'az' | 'za' | 'lohi' | 'hilo'
 *
 * Grouped by page / component:
 *   LOGIN        — login page inputs and button
 *   INVENTORY    — product listing page
 *   PRODUCT_ITEM — individual product card selectors (dynamic by product name)
 *   CART         — shopping cart page
 *   CHECKOUT     — checkout step one (personal info form)
 *   OVERVIEW     — checkout step two (order summary)
 *   CONFIRMATION — order confirmation page
 *   HEADER       — persistent site header (cart badge, sidebar menu)
 */

export const SAUCEDEMO_UI = Object.freeze({
  // ── Login ─────────────────────────────────────────────────────────────────
  LOGIN: {
    USERNAME_INPUT: "[data-test='username']",
    PASSWORD_INPUT: "[data-test='password']",
    LOGIN_BTN: "[data-test='login-button']",
    ERROR_MSG: "[data-test='error']",
    ERROR_BUTTON: "[data-test='error-button']",
  },

  // ── Inventory list ────────────────────────────────────────────────────────
  INVENTORY: {
    CONTAINER: "[data-test='inventory-container']",
    LIST: "[data-test='inventory-list']",
    ITEM: "[data-test='inventory-item']",
    ITEM_DESCRIPTION: "[data-test='inventory-item-description']",
    ITEM_NAME: "[data-test='inventory-item-name']",
    ITEM_DESC: "[data-test='inventory-item-desc']",
    ITEM_PRICE: "[data-test='inventory-item-price']",
    SORT_DROPDOWN: "[data-test='product-sort-container']",
    ACTIVE_SORT_OPTION: "[data-test='active-option']",
  },

  // ── Per-product dynamic selectors ─────────────────────────────────────────
  // Pass kebab-case product name generated as: displayName.replace(/\s+/g,'-').toLowerCase()
  //   "Sauce Labs Backpack"        → 'sauce-labs-backpack'
  //   "Sauce Labs Fleece Jacket"   → 'sauce-labs-fleece-jacket'
  //   "Test.allTheThings() T-Shirt (Red)" → 'test.allthethings()-t-shirt-(red)'
  PRODUCT_ITEM: {
    ADD_TO_CART_BTN: (productName) =>
      `[data-test='add-to-cart-${productName}']`,
    REMOVE_BTN: (productName) => `[data-test='remove-${productName}']`,
    IMG: (productName) => `[data-test='inventory-item-${productName}-img']`,
    TITLE_LINK: (itemId) => `[data-test='item-${itemId}-title-link']`,
    IMG_LINK: (itemId) => `[data-test='item-${itemId}-img-link']`,
  },

  // ── Cart ──────────────────────────────────────────────────────────────────
  CART: {
    CONTAINER: "[data-test='cart-contents-container']",
    LIST: "[data-test='cart-list']",
    ITEM: ".cart_item",
    ITEM_NAME: "[data-test='inventory-item-name']",
    ITEM_PRICE: "[data-test='inventory-item-price']",
    ITEM_QUANTITY: "[data-test='item-quantity']",
    CHECKOUT_BTN: "[data-test='checkout']",
    CONTINUE_SHOPPING_BTN: "[data-test='continue-shopping']",
    QUANTITY_LABEL: "[data-test='cart-quantity-label']",
    DESCRIPTION_LABEL: "[data-test='cart-desc-label']",
  },

  // ── Checkout step one (personal info) ─────────────────────────────────────
  CHECKOUT: {
    CONTAINER: "[data-test='checkout-info-container']",
    FIRST_NAME_INPUT: "[data-test='firstName']",
    LAST_NAME_INPUT: "[data-test='lastName']",
    POSTAL_CODE_INPUT: "[data-test='postalCode']",
    CONTINUE_BTN: "[data-test='continue']",
    CANCEL_BTN: "[data-test='cancel']",
    ERROR_MSG: "[data-test='error']",
  },

  // ── Checkout step two (order overview) ────────────────────────────────────
  OVERVIEW: {
    CONTAINER: "[data-test='checkout-summary-container']",
    LIST: "[data-test='cart-list']",
    ITEM: ".cart_item",
    ITEM_NAME: "[data-test='inventory-item-name']",
    ITEM_PRICE: "[data-test='inventory-item-price']",
    SUBTOTAL: "[data-test='subtotal-label']",
    TAX: "[data-test='tax-label']",
    TOTAL: "[data-test='total-label']",
    PAYMENT_INFO_LABEL: "[data-test='payment-info-label']",
    PAYMENT_INFO_VALUE: "[data-test='payment-info-value']",
    SHIPPING_INFO_LABEL: "[data-test='shipping-info-label']",
    SHIPPING_INFO_VALUE: "[data-test='shipping-info-value']",
    FINISH_BTN: "[data-test='finish']",
    CANCEL_BTN: "[data-test='cancel']",
  },

  // ── Order confirmation ─────────────────────────────────────────────────────
  CONFIRMATION: {
    CONTAINER: "[data-test='checkout-complete-container']",
    HEADER: "[data-test='complete-header']",
    TEXT: "[data-test='complete-text']",
    BACK_HOME_BTN: "[data-test='back-to-products']",
    PONY_IMAGE: "[data-test='pony-express']",
  },

  // ── Persistent header ──────────────────────────────────────────────────────
  HEADER: {
    CONTAINER: "[data-test='header-container']",
    CART_ICON: "[data-test='shopping-cart-link']",
    CART_BADGE: "[data-test='shopping-cart-badge']",
    TITLE: "[data-test='title']",
    MENU_BTN: "#react-burger-menu-btn",
    CLOSE_MENU_BTN: "#react-burger-menu-close-btn",
    ALL_ITEMS_LINK: "[data-test='inventory-sidebar-link']",
    ABOUT_LINK: "[data-test='about-sidebar-link']",
    LOGOUT_LINK: "[data-test='logout-sidebar-link']",
    RESET_LINK: "[data-test='reset-sidebar-link']",
    APP_LOGO: ".app_logo",
  },
});
