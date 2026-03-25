/**
 * @fileoverview Shared navigation UI selectors.
 * Only add selectors here that are reused across multiple modules.
 * Module-specific selectors go in cypress/configs/ui/modules/<name>/<name>.ui.js
 */

export const NAVIGATION_UI = Object.freeze({
  SIDEBAR: {
    CONTAINER: '[data-cy="sidebar"]',
    MENU_ITEM: (label) =>
      `[data-cy="sidebar-item-${label.toLowerCase().replaceAll(" ", "-")}"]`,
  },
  HEADER: {
    CONTAINER: '[data-cy="header"]',
    PAGE_TITLE: '[data-cy="page-title"]',
    USER_MENU: '[data-cy="user-menu"]',
    LOGOUT_BTN: '[data-cy="logout-btn"]',
  },
  BREADCRUMB: {
    CONTAINER: '[data-cy="breadcrumb"]',
    ITEM: (label) => `[data-cy="breadcrumb-${label.toLowerCase()}"]`,
  },
});
