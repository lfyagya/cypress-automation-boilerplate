/**
 * @fileoverview HTTP Status Codes
 * Single source of truth for expected HTTP status codes across all API operations.
 *
 * Usage:
 *   import { HTTP_STATUS, isSuccess } from '@core/api/status-codes.js';
 */

export const HTTP_STATUS = Object.freeze({
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // 3xx
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // 5xx Server Errors
  SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
});

export function isSuccess(status) {
  return status >= 200 && status < 300;
}
export function isClientError(status) {
  return status >= 400 && status < 500;
}
export function isServerError(status) {
  return status >= 500;
}
export function getStatusCategory(status) {
  if (isSuccess(status)) return "success";
  if (isClientError(status)) return "client-error";
  if (isServerError(status)) return "server-error";
  return "unknown";
}

const STATUS_NAMES = Object.fromEntries(
  Object.entries(HTTP_STATUS).map(([name, code]) => [code, name]),
);
export function getStatusName(status) {
  return STATUS_NAMES[status] ?? `UNKNOWN_${status}`;
}
