/**
 * @fileoverview Example module response schemas.
 * Used with cy.validateSchema(responseBody, EXAMPLE_SCHEMAS.LIST) in tests.
 */

export const EXAMPLE_SCHEMAS = Object.freeze({
  ITEM: {
    type: "object",
    required: ["id", "name", "status"],
    properties: {
      id: { type: "number" },
      name: { type: "string" },
      status: { type: "string" },
      createdAt: { type: "string" },
    },
  },

  LIST: {
    type: "object",
    required: ["items"],
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          required: ["id", "name", "status"],
          properties: {
            id: { type: "number" },
            name: { type: "string" },
            status: { type: "string" },
          },
        },
      },
      total: { type: "number" },
      page: { type: "number" },
      pageSize: { type: "number" },
    },
  },
});
