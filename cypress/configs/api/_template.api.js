/**
 * @fileoverview API Config Template — COPY THIS FILE to add a new module.
 *
 * HOW TO ADD A NEW MODULE:
 * 1. Copy this file to:  cypress/configs/api/modules/<module-name>/<module-name>.api.js
 * 2. Set basePath to the API base route (e.g. '/api/v1/items')
 * 3. Set prefix to a short UPPER_SNAKE alias (e.g. 'ITEM')
 * 4. List resources: string keys for CRUD_TEMPLATES, or custom { alias, method, pattern } entries
 * 5. Import in cypress/support/commands/modules/<module-name>.commands.js
 *
 * Result: createModuleConfig auto-generates intercept aliases like:
 *   '@ITEM_LIST', '@ITEM_DETAILS', '@ITEM_CREATE', '@ITEM_UPDATE', '@ITEM_DELETE'
 */

import { createModuleConfig } from "@core/api";

export const TEMPLATE_CONFIG = createModuleConfig({
  // basePath = API root WITHOUT the resource segment
  basePath: '/api/v1',

  // prefix = short alias prefix used in generated alias strings
  prefix: 'resource',

  // resources = object: key is the URL segment appended to basePath,
  //             value is array of CRUD_TEMPLATE operation names
  resources: {
    'your-resource': [
      'LIST',    // GET    /api/v1/your-resource?*   → config key: YOUR_RESOURCE_LIST
      'DETAILS', // GET    /api/v1/your-resource/*   → config key: YOUR_RESOURCE_DETAILS
      'CREATE',  // POST   /api/v1/your-resource     → config key: YOUR_RESOURCE_CREATE
      'UPDATE',  // PUT    /api/v1/your-resource/*   → config key: YOUR_RESOURCE_UPDATE
      'DELETE',  // DELETE /api/v1/your-resource/*   → config key: YOUR_RESOURCE_DELETE
    ],
  },

  // custom = object: key is the config lookup key,
  //           value = { alias, method, endpoint }
  custom: {
    // YOUR_RESOURCE_EXPORT: {
    //   alias: 'resourceExportYourResource',
    //   method: 'GET',
    //   endpoint: '/api/v1/your-resource/export',
    // },
  },
});
