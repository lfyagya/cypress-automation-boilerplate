/**
 * @fileoverview Saucedemo (https://www.saucedemo.com) UI selector constants.
 *
 * Saucedemo uses [data-test="..."] attributes throughout — mapped here to
 * the framework's UPPER_SNAKE_CASE constant convention.
 *
 * Grouped by page / component:
 *   LOGIN        — login page inputs and button
 *   INVENTORY    — product listing page
 *   PRODUCT_ITEM — individual product inside the inventory list
 *   CART         — shopping cart page
 *   CHECKOUT     — checkout step one (personal info)
 *   OVERVIEW     — checkout step two (order summary)
 *   CONFIRMATION — order confirmation page
 *   HEADER       — persistent site header (cart badge, menu)
 */

export const SAUCEDEMO_UI = Object.freeze({
  LOGIN: {
    USERNAME_INPUT: "[data-test='username']",
    PASSWORD_INPUT: "[data-test='password']",
    LOGIN_BTN: "[data-test='login-button']",
    ERROR_MSG: "[data-test='error']",
  },

  INVENTORY: {
    CONTAINER: ".inventory_list",
    ITEM: ".inventory_item",
    ITEM_NAME: ".inventory_item_name",
    ITEM_PRICE: ".inventory_item_price",
    SORT_DROPDOWN: "[data-test='product-sort-container']",
  },

  PRODUCT_ITEM: {
    // Dynamic selectors — pass the kebab-case product name
    ADD_TO_CART_BTN: (productName) => `[data-test='add-to-cart-${productName}']`,
    REMOVE_BTN: (productName) => `[data-test='remove-${productName}']`,
  },

  CART: {
    CONTAINER: ".cart_list",
    ITEM: ".cart_item",
    ITEM_NAME: ".inventory_item_name",
    ITEM_PRICE: ".inventory_item_price",
    ITEM_QUANTITY: ".cart_quantity",
    CHECKOUT_BTN: "[data-test='checkout']",
    CONTINUE_SHOPPING_BTN: "[data-test='continue-shopping']",
  },

  CHECKOUT: {
    FIRST_NAME_INPUT: "[data-test='firstName']",
    LAST_NAME_INPUT: "[data-test='lastName']",
    POSTAL_CODE_INPUT: "[data-test='postalCode']",
    CONTINUE_BTN: "[data-test='continue']",
    CANCEL_BTN: "[data-test='cancel']",
    ERROR_MSG: "[data-test='error']",
  },

  OVERVIEW: {
    ITEM_LIST: ".cart_list",
    ITEM: ".cart_item",
    SUBTOTAL: ".summary_subtotal_label",
    TAX: ".summary_tax_label",
    TOTAL: ".summary_total_label",
    FINISH_BTN: "[data-test='finish']",
    CANCEL_BTN: "[data-test='cancel']",
  },

  CONFIRMATION: {
    CONTAINER: ".checkout_complete_container",
    HEADER: "[data-test='complete-header']",
    TEXT: "[data-test='complete-text']",
    BACK_HOME_BTN: "[data-test='back-to-products']",
  },

  HEADER: {
    CART_ICON: ".shopping_cart_link",
    CART_BADGE: ".shopping_cart_badge",
    MENU_BTN: "#react-burger-menu-btn",
    LOGOUT_LINK: "#logout_sidebar_link",
    APP_LOGO: ".app_logo",
  },
});
