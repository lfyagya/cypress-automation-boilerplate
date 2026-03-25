# Getting Started

## Prerequisites

- Node.js 18 or above
- npm 9 or above
- A running instance of your target application (or a staging URL)

## Setup

```bash
# 1. Clone or fork the boilerplate
git clone <your-repo-url>
cd cypress-command-first-boilerplate

# 2. Install dependencies
npm install

# 3. Create your local env file
cp cypress.env.example.json cypress.env.json
# Edit cypress.env.json with your baseUrl, username, password, authUrl
```

## Running Tests

```bash
# Open Cypress in interactive mode
npm run cy:open

# Run all tests headlessly
npm run cy:run

# Run only smoke tests
npm run cy:run:smoke

# Run by tag (e.g. @example)
npm run cy:run:tag -- --env grepTags=@example

# Run against a specific environment config
npm run cy:run -- --env configFile=qa
```

## Environment Files

| File                                   | Purpose                               |
| -------------------------------------- | ------------------------------------- |
| `cypress.env.json`                     | Local secrets — **never commit this** |
| `cypress/config/cypress.env.dev.json`  | Dev environment config                |
| `cypress/config/cypress.env.qa.json`   | QA environment config                 |
| `cypress/config/cypress.env.prod.json` | Production environment config         |
| `cypress.env.example.json`             | Template — commit this                |

## Writing Your First Test

1. Create a UI config: `cypress/configs/ui/modules/yourmodule/yourmodule.ui.js`
2. Create an API config: `cypress/configs/api/modules/yourmodule/yourmodule.api.js`
3. Create a command file: `cypress/support/commands/modules/yourmodule.commands.js`
4. Register it in: `cypress/support/commands.js`
5. Write a spec: `cypress/tests/yourmodule/smoke/yourmodule-smoke.cy.js`

> Use the `/scaffold-module` Copilot prompt to generate all five artifacts automatically.

## Adapting for Your Application

| What to change                | Where                                              |
| ----------------------------- | -------------------------------------------------- |
| App base URL + credentials    | `cypress.env.json`                                 |
| Route paths                   | `cypress/configs/app/routes.js`                    |
| API base paths + HTTP methods | `cypress/configs/api/modules/`                     |
| Login flow selectors          | `cypress/support/commands/common/auth.commands.js` |
| Shared navigation selectors   | `cypress/configs/ui/shared/navigation.ui.js`       |
