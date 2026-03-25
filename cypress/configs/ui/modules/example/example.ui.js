/**
 * @fileoverview Example module UI selectors.
 * All selectors target [data-cy="..."] attributes — never CSS classes or XPath.
 *
 * Convention:
 *   - Group by component/view (LIST, FORM, DETAIL)
 *   - Use UPPER_SNAKE_CASE for constant keys
 *   - Dynamic selectors are functions that return a string
 */

export const EXAMPLE_UI = Object.freeze({
  LIST: {
    CONTAINER: '[data-cy="example-list"]',
    SEARCH_INPUT: '[data-cy="example-search-input"]',
    SEARCH_BTN: '[data-cy="example-search-btn"]',
    CLEAR_BTN: '[data-cy="example-clear-btn"]',
    TABLE: '[data-cy="example-table"]',
    TABLE_ROW: '[data-cy="example-table-row"]',
    TABLE_ROW_BY_ID: (id) => `[data-cy="example-table-row-${id}"]`,
    LOADING_SPINNER: '[data-cy="example-list-loading"]',
    EMPTY_STATE: '[data-cy="example-empty-state"]',
    PAGINATION: '[data-cy="example-pagination"]',
  },
  FORM: {
    CONTAINER: '[data-cy="example-form"]',
    NAME_INPUT: '[data-cy="example-form-name"]',
    STATUS_SELECT: '[data-cy="example-form-status"]',
    SUBMIT_BTN: '[data-cy="example-form-submit"]',
    CANCEL_BTN: '[data-cy="example-form-cancel"]',
    ERROR_MSG: '[data-cy="example-form-error"]',
  },
  DETAIL: {
    CONTAINER: '[data-cy="example-detail"]',
    TITLE: '[data-cy="example-detail-title"]',
    EDIT_BTN: '[data-cy="example-detail-edit"]',
    DELETE_BTN: '[data-cy="example-detail-delete"]',
  },
});
