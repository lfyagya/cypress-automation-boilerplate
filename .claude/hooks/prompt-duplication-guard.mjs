#!/usr/bin/env node

// Intercepts prompts that intend to create new Cypress code and injects
// a duplication-check instruction before Claude starts writing anything.

const ACTION_WORDS = [
  "create", "add", "new", "write", "build", "generate",
  "scaffold", "implement", "make", "introduce", "set up", "setup",
];

const CYPRESS_CONTEXT_WORDS = [
  "command", "spec", "config", "test", "selector", "endpoint",
  "route", "helper", "util", "utility", "module", "smoke",
  "api config", "ui config", "commands file", "cy.", "cypress",
];

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const prompt = String(data?.prompt || "").toLowerCase();
  if (!prompt) process.exit(0);

  const hasAction = ACTION_WORDS.some((w) => prompt.includes(w));
  const hasCypressContext = CYPRESS_CONTEXT_WORDS.some((w) => prompt.includes(w));

  if (!hasAction || !hasCypressContext) process.exit(0);

  console.log(
    "DUPLICATION GUARD (auto-triggered): Before writing any new Cypress " +
    "config, command, helper, utility, or spec — you MUST search first. " +
    "Check cypress/configs/ui/**, cypress/configs/api/**, " +
    "cypress/configs/app/routes.js, and cypress/support/commands/** for " +
    "existing reusable matches. " +
    "If a match exists: REUSE or EXTEND it — do not create a new file. " +
    "If genuinely no match exists: state exactly why a new file is justified " +
    "before writing anything. Do not approve new *.actions.js files or " +
    "page-object wrappers. Only proceed to write code after this check is complete."
  );

  process.exit(0);
}

main();
