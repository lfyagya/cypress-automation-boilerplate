/**
 * @fileoverview Example module UI selectors.
 * Values are bare data-cy IDs — used with cy.getByTestId(id).
 *
 * Convention:
 *   - Group by component/view (LIST, FORM, DETAIL)
 *   - Use UPPER_SNAKE_CASE for constant keys
 *   - Dynamic selectors are functions returning the bare ID string
 */

export const EXAMPLE_UI = Object.freeze({
  LIST: {
    CONTAINER: "example-list",
    SEARCH_INPUT: "example-search-input",
    SEARCH_BTN: "example-search-btn",
    CLEAR_BTN: "example-clear-btn",
    TABLE: "example-table",
    TABLE_ROW: "example-table-row",
    TABLE_ROW_BY_ID: (id) => `example-table-row-${id}`,
    LOADING_SPINNER: "example-list-loading",
    EMPTY_STATE: "example-empty-state",
    PAGINATION: "example-pagination",
  },
  FORM: {
    CONTAINER: "example-form",
    NAME_INPUT: "example-form-name",
    STATUS_SELECT: "example-form-status",
    SUBMIT_BTN: "example-form-submit",
    CANCEL_BTN: "example-form-cancel",
    ERROR_MSG: "example-form-error",
  },
  DETAIL: {
    CONTAINER: "example-detail",
    TITLE: "example-detail-title",
    EDIT_BTN: "example-detail-edit",
    DELETE_BTN: "example-detail-delete",
  },
});
