/**
 * @fileoverview Core API barrel export.
 * Import everything from here: import { createModuleConfig, HTTP_STATUS } from '@core/api';
 */

export {
  HTTP_STATUS,
  isSuccess,
  isClientError,
  isServerError,
  getStatusCategory,
  getStatusName,
} from "./status-codes";
export {
  createModuleConfig,
  getAliases,
  findByAlias,
  CRUD_TEMPLATES,
} from "./api-config.factory";
export {
  registerIntercept,
  registerAllIntercepts,
  waitForAPI,
  waitForAPIs,
  makeRequest,
  stubResponse,
  assertResponseTime,
  assertResponseFields,
} from "./api.engine";

// Side-effect imports — register Cypress commands
import "./api.commands";
import "./schema.commands";
