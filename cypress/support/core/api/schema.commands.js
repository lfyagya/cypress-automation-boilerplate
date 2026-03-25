/**
 * @fileoverview Schema Validation Command
 * cy.validateSchema(data, schema) — validates API response shape.
 */

const getDataType = (data) => {
  if (data === null) return "null";
  if (Array.isArray(data)) return "array";
  return typeof data;
};

const assertType = (data, schema, path) => {
  if (!schema.type) return;
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  const dataType = getDataType(data);
  if (!types.includes(dataType)) {
    throw new Error(
      `Schema validation failed at ${path}: expected ${types.join("|")}, got ${dataType}`,
    );
  }
};

const assertRequired = (data, schema, path) => {
  if (!schema.required || typeof data !== "object" || data === null) return;
  schema.required.forEach((field) => {
    if (!(field in data)) {
      throw new Error(
        `Schema validation at ${path}: missing required field '${field}'`,
      );
    }
  });
};

const validateDataAgainstSchema = (data, schema, path = "root") => {
  assertType(data, schema, path);
  assertRequired(data, schema, path);

  if (schema.properties && typeof data === "object" && data !== null) {
    Object.keys(schema.properties).forEach((key) => {
      if (data[key] !== undefined) {
        validateDataAgainstSchema(
          data[key],
          schema.properties[key],
          `${path}.${key}`,
        );
      }
    });
  }

  if (schema.items && Array.isArray(data)) {
    data.forEach((item, i) =>
      validateDataAgainstSchema(item, schema.items, `${path}[${i}]`),
    );
  }
};

Cypress.Commands.add("validateSchema", (data, schema) => {
  cy.wrap(null).then(() => {
    try {
      validateDataAgainstSchema(data, schema);
    } catch (err) {
      throw new Error(err.message);
    }
  });
});
