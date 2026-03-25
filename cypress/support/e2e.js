/**
 * @fileoverview Cypress support entry point.
 * Loaded before every spec file — DO NOT put test logic here.
 *
 * Responsibilities:
 *   1. Import custom commands
 *   2. Register @cypress/grep plugin
 *   3. Configure global exception handling
 *   4. Set global beforeEach defaults
 */

import "./commands";
import "@cypress/grep/src/support";
import "cypress-mochawesome-reporter/register";

// ─── Global Exception Handling ───────────────────────────────────────────────
// Suppress known non-critical app errors from failing tests.
// Add specific error patterns here only when verified as non-critical.
Cypress.on("uncaught:exception", (err) => {
  // Return false to prevent Cypress from failing the test on this exception.
  // Only suppress if the error is known to be safe to ignore.
  const suppressedPatterns = [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed",
  ];
  return !suppressedPatterns.some((pattern) => err.message.includes(pattern));
});

// ─── Global beforeEach ───────────────────────────────────────────────────────
// Intercept console.error to surface hidden app errors during test run.
beforeEach(() => {
  cy.window().then((win) => {
    cy.spy(win.console, "error").as("consoleError");
  });
});
