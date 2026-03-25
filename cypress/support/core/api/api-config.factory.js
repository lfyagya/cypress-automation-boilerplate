/**
 * @fileoverview API Config Factory
 *
 * Generates config-driven API entry objects from a compact module definition.
 * Eliminates hand-writing intercept aliases per endpoint.
 *
 * Usage:
 *   import { createModuleConfig } from '@core/api/api-config.factory.js';
 *
 *   export const ORDERS_API = createModuleConfig({
 *     basePath: '/api/orders',
 *     prefix: 'ord',
 *     resources: {
 *       'orders': ['LIST', 'DETAILS', 'CREATE', 'UPDATE', 'DELETE'],
 *     },
 *   });
 *   // Produces: ORDERS_API.ORDERS_LIST, ORDERS_API.ORDERS_DETAILS, etc.
 */

import { HTTP_STATUS } from "./status-codes.js";

export const CRUD_TEMPLATES = Object.freeze({
  LIST: {
    method: "GET",
    endpointSuffix: "?*",
    aliasSuffix: "Get",
    keySuffix: "_LIST",
    expectedStatus: HTTP_STATUS.OK,
  },
  LIST_ALL: {
    method: "GET",
    endpointSuffix: "*",
    aliasSuffix: "Get",
    keySuffix: "_LIST",
    expectedStatus: HTTP_STATUS.OK,
  },
  DETAILS: {
    method: "GET",
    endpointSuffix: "/*",
    aliasSuffix: "GetDetails",
    keySuffix: "_DETAILS",
    expectedStatus: HTTP_STATUS.OK,
  },
  CREATE: {
    method: "POST",
    endpointSuffix: "",
    aliasSuffix: "Create",
    keySuffix: "_CREATE",
    expectedStatus: HTTP_STATUS.CREATED,
  },
  UPDATE: {
    method: "PUT",
    endpointSuffix: "/*",
    aliasSuffix: "Update",
    keySuffix: "_UPDATE",
    expectedStatus: HTTP_STATUS.OK,
  },
  PATCH: {
    method: "PATCH",
    endpointSuffix: "/*",
    aliasSuffix: "Patch",
    keySuffix: "_PATCH",
    expectedStatus: HTTP_STATUS.OK,
  },
  DELETE: {
    method: "DELETE",
    endpointSuffix: "/*",
    aliasSuffix: "Delete",
    keySuffix: "_DELETE",
    expectedStatus: HTTP_STATUS.NO_CONTENT,
  },
});

export function toPascalCase(str) {
  return str
    .replaceAll(/([-_][a-z])/gi, (g) => g.toUpperCase().replaceAll(/[-_]/g, ""))
    .replace(/^[a-z]/, (c) => c.toUpperCase());
}

export function toUpperSnake(str) {
  return str.replaceAll("-", "_").toUpperCase();
}

/**
 * Build a single API config entry.
 */
function buildEntry({ method, endpoint, alias, expectedStatus }) {
  return Object.freeze({ method, endpoint, alias, expectedStatus });
}

/**
 * Create a module API config object from a compact definition.
 *
 * @param {object} opts
 * @param {string} opts.basePath     - API base path (e.g. '/api/orders')
 * @param {string} opts.prefix       - Short alias prefix (2-4 chars, e.g. 'ord')
 * @param {object} opts.resources    - Resource definitions: { 'resource-name': ['LIST', ...] }
 * @param {object} [opts.custom]     - Custom entries: { KEY: { method, endpoint, alias, expectedStatus } }
 * @returns {object} Frozen config object
 */
export function createModuleConfig({
  basePath,
  prefix,
  resources = {},
  custom = {},
}) {
  const entries = {};

  for (const [resourceName, ops] of Object.entries(resources)) {
    const opsArray = Array.isArray(ops) ? ops : ops.ops;
    const resourcePath = ops.path ?? resourceName;
    const aliasBase = toPascalCase(ops.aliasName ?? resourceName);
    const keyBase = toUpperSnake(resourceName);

    for (const op of opsArray) {
      const tmpl = CRUD_TEMPLATES[op];
      if (!tmpl) throw new Error(`Unknown CRUD op: ${op}`);

      const key = `${keyBase}${tmpl.keySuffix}`;
      const alias = `${prefix}${tmpl.aliasSuffix}${aliasBase}`;
      const endpoint = `${basePath}/${resourcePath}${tmpl.endpointSuffix}`;

      entries[key] = buildEntry({
        method: tmpl.method,
        endpoint,
        alias,
        expectedStatus: tmpl.expectedStatus,
      });
    }
  }

  for (const [key, entry] of Object.entries(custom)) {
    entries[key] = buildEntry({
      method: entry.method,
      endpoint: entry.endpoint,
      alias: entry.alias,
      expectedStatus: entry.expectedStatus ?? HTTP_STATUS.OK,
    });
  }

  return Object.freeze(entries);
}

export function getAliases(config) {
  return Object.values(config)
    .map((e) => e.alias)
    .filter(Boolean);
}

export function findByAlias(config, alias) {
  return Object.values(config).find((e) => e.alias === alias) ?? null;
}
