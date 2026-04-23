# Jira AC to Cypress Workflow

Use this skill when starting new E2E or smoke automation from a Jira ticket.

## Inputs required

- Jira summary
- Jira description
- Acceptance criteria
- Test type: `e2e` or `smoke`
- Target module/page

## Required output order

1. Positive scenarios
2. Negative scenarios
3. Edge-case scenarios
4. Questions or assumptions requiring manual review
5. Manual repro steps for verified scenarios using browser integration
6. DOM/context capture targets from the live app
7. Required config changes (API + UI + routes)
8. Required command changes
9. Required test-suite changes
10. Reuse/duplication checks across configs, commands, and tests
11. Validation checklist against framework standards
12. Suggested focused execution plan

## Rules

- Follow Config → Commands → Tests architecture.
- Do not use page objects or `*.actions.js`.
- Prefer live DOM/context from browser interaction over static screenshots.
- Use existing selectors, endpoints, routes, and commands when available.
- Flag any likely duplication before proposing new files.
- Smoke scenarios must remain read-only.
