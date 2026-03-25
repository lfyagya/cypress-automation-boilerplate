/**
 * @fileoverview Authentication commands.
 *
 * cy.ensureAuthenticated()  — login once per session, reuse token across tests.
 * cy.logout()               — invalidate session.
 *
 * Uses cy.session() so credentials are cached per Cypress session key.
 * Never re-run authentication per test unless cy.clearCookies() is called explicitly.
 */

const SESSION_KEY = "user-session";

Cypress.Commands.add("ensureAuthenticated", (credentials = {}) => {
  const username = credentials.username ?? Cypress.env("username");
  const password = credentials.password ?? Cypress.env("password");

  cy.session(
    [SESSION_KEY, username],
    () => {
      cy.visit(Cypress.env("authUrl") ?? "/login");
      cy.get('[data-cy="username-input"]').type(username);
      cy.get('[data-cy="password-input"]').type(password, { log: false });
      cy.get('[data-cy="login-btn"]').click();
      // Assert landing page so session is not cached on a failed login
      cy.url().should("not.include", "/login");
    },
    {
      validate() {
        // Re-login if the protected API returns 401
        cy.request({
          url: Cypress.env("sessionValidateUrl") ?? "/api/v1/me",
          failOnStatusCode: false,
        })
          .its("status")
          .should("eq", 200);
      },
      cacheAcrossSpecs: true,
    },
  );
});

Cypress.Commands.add("logout", () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  Cypress.session.clearAllSavedSessions();
});
