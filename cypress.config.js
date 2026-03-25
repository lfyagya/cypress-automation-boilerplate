const { defineConfig } = require("cypress");
const fs = require("node:fs");
const path = require("node:path");
const cypressGrepPlugin = require("@cypress/grep/src/plugin");
const webpackPreprocessor = require("@cypress/webpack-preprocessor");
const webpackConfig = require("./cypress/webpack.config.js");

/**
 * Load environment-specific config from cypress/config/cypress.env.{env}.json
 * Usage: cypress run --env configFile=qa
 */
function loadEnvConfig(configFile) {
  if (!configFile) return {};
  const filePath = path.resolve(
    __dirname,
    "cypress",
    "config",
    `cypress.env.${configFile}.json`,
  );
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠ Environment config not found: ${filePath}`);
    return {};
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

module.exports = defineConfig({
  // ── Global Config ──
  chromeWebSecurity: false,
  video: false,
  screenshotOnRunFailure: true,
  viewportWidth: 1920,
  viewportHeight: 1080,

  // ── Memory Management ──
  experimentalMemoryManagement: true,
  numTestsKeptInMemory: 5,

  // ── Timeouts ──
  defaultCommandTimeout: 10000,
  requestTimeout: 15000,
  responseTimeout: 15000,
  pageLoadTimeout: 30000,

  // ── Reporter ──
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    charts: true,
    reportPageTitle: "Automation Test Report",
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },

  e2e: {
    // ── Base URL ──
    // Set in cypress.env.json or via --env baseUrl=https://...
    // baseUrl is read from env at runtime — do not hardcode here.

    specPattern: "cypress/tests/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
    fixturesFolder: "cypress/fixtures",
    downloadsFolder: "cypress/downloads",
    screenshotsFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",

    setupNodeEvents(on, config) {
      // ── Cypress Grep plugin ──
      cypressGrepPlugin(config);

      // ── Webpack preprocessor (path aliases) ──
      on(
        "file:preprocessor",
        webpackPreprocessor({ webpackOptions: webpackConfig }),
      );

      // ── Environment config merge ──
      const envConfig = loadEnvConfig(config.env.configFile);
      config.env = { ...config.env, ...envConfig };

      // ── Base URL from env ──
      // Only apply env baseUrl if not already set via --config baseUrl=...
      if (config.env.baseUrl && !config.baseUrl) {
        config.baseUrl = config.env.baseUrl;
      }

      return config;
    },
  },
});
