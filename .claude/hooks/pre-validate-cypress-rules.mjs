#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const allowlistPath = path.resolve(__dirname, "cypress-hook-allowlist.json");

// Matches any file inside the cypress/ folder at the repo root
const TARGET_FILE_RE = /cypress[\\/].*\.(cy\.js|commands\.js|js)$/i;

function toPosix(p) {
  return p.replaceAll("\\", "/");
}

function loadAllowlist() {
  try {
    const raw = JSON.parse(fs.readFileSync(allowlistPath, "utf8"));
    return {
      selectors: new Set((raw.selectors || []).map((s) => String(s).trim())),
      routes: new Set((raw.routes || []).map((s) => String(s).trim())),
      endpoints: new Set((raw.endpoints || []).map((s) => String(s).trim())),
    };
  } catch {
    return {
      selectors: new Set(["body", "html"]),
      routes: new Set(["/"]),
      endpoints: new Set(),
    };
  }
}

function isAllowedLiteral(value, allowSet, ignoreCase = false) {
  const literal = String(value || "").trim();
  if (!literal) return false;
  if (allowSet.has(literal)) return true;
  if (!ignoreCase) return false;
  const lower = literal.toLowerCase();
  for (const allowed of allowSet) {
    if (String(allowed).toLowerCase() === lower) return true;
  }
  return false;
}

function lineNumberForIndex(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function scanForRegex(violations, filePath, text, regex, messageBuilder) {
  let match;
  while ((match = regex.exec(text)) !== null) {
    const lineNumber = lineNumberForIndex(text, match.index);
    const message =
      typeof messageBuilder === "function" ? messageBuilder(match) : messageBuilder;
    if (!message) continue;
    violations.push({ filePath, lineNumber, message });
  }
}

function scanContent(filePath, content, allowlist) {
  const violations = [];
  const normalized = toPosix(path.relative(repoRoot, filePath));

  if (!TARGET_FILE_RE.test(normalized)) return violations;

  // Rule 1: No hard waits.
  scanForRegex(
    violations, normalized, content,
    /\bcy\.wait\(\s*\d+\s*\)/g,
    "Hard wait detected. Replace with cy.apiWait(...) or a deterministic state-based wait.",
  );

  // Rule 2: No action class or page-object imports.
  scanForRegex(
    violations, normalized, content,
    /from\s+['"][^'"]*\.actions\.js['"]/g,
    "Action class import detected. Command-first architecture forbids *.actions.js dependencies.",
  );
  scanForRegex(
    violations, normalized, content,
    /from\s+['"][^'"]*(page-obj|pageobject|page-object)[^'"]*['"]/gi,
    "Page-object import detected. Command-first architecture forbids page-object dependencies.",
  );

  // Rule 3: No hardcoded selectors in spec/command files.
  if (/\.(cy\.js|commands\.js)$/i.test(normalized)) {
    scanForRegex(
      violations, normalized, content,
      /\bcy\.(get|find)\(\s*['"](?!@)([^'"]+)['"]\s*\)/g,
      (m) => {
        const selector = String(m[2] || "").trim();
        if (isAllowedLiteral(selector, allowlist.selectors, true)) return null;
        return `Hardcoded selector in cy.${m[1]}('${selector}'). Use config constants from cypress/configs/ui/**.`;
      },
    );
  }

  // Rule 4: No hardcoded routes in cy.visit (except allowlisted root).
  if (/\.(cy\.js|commands\.js)$/i.test(normalized)) {
    scanForRegex(
      violations, normalized, content,
      /\bcy\.visit\(\s*['"]([^'"]+)['"]\s*\)/g,
      (m) => {
        const route = String(m[1] || "").trim();
        const isLiteral = route.startsWith("/") || /^https?:\/\//i.test(route);
        if (!isLiteral || isAllowedLiteral(route, allowlist.routes)) return null;
        return `Hardcoded route '${route}' in cy.visit(...). Use route constants from cypress/configs/app/routes.js.`;
      },
    );
  }

  // Rule 5: Auth-required specs must call cy.ensureAuthenticated().
  if (/cypress[\\/]tests[\\/].*\.cy\.js$/i.test(normalized)) {
    const requiresAuth = !/unauth|public|health/i.test(normalized);
    if (requiresAuth && !/cy\.ensureAuthenticated\(/.test(content)) {
      violations.push({
        filePath: normalized,
        lineNumber: 1,
        message:
          "Missing cy.ensureAuthenticated() in auth-required test file. Add it in beforeEach().",
      });
    }
  }

  // Rule 6: Smoke tests must be read-only.
  if (/cypress[\\/]tests[\\/].*[\\/]smoke[\\/].*\.cy\.js$/i.test(normalized)) {
    scanForRegex(
      violations, normalized, content,
      /\bcy\.request\(\s*['"](POST|PUT|PATCH|DELETE)['"]/gi,
      "Write request in smoke suite. Smoke tests must remain read-only.",
    );
    scanForRegex(
      violations, normalized, content,
      /\bmethod\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/gi,
      "Write HTTP method in smoke suite. Smoke tests must remain read-only.",
    );
  }

  return violations;
}

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;

  let toolData;
  try {
    toolData = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const toolName = toolData?.tool_name || "";
  const toolInput = toolData?.tool_input || {};
  const filePath = toolInput.file_path || "";

  let content = "";
  if (toolName === "Write") {
    content = toolInput.content || "";
  } else if (toolName === "Edit") {
    content = toolInput.new_string || "";
  } else {
    process.exit(0);
  }

  if (!filePath || !content) process.exit(0);

  const allowlist = loadAllowlist();
  const violations = scanContent(filePath, content, allowlist);

  if (violations.length === 0) process.exit(0);

  console.error("");
  console.error("❌ [PRE-CHECK] Cypress rule violations in proposed change — edit BLOCKED.");
  for (const v of violations) {
    console.error(`- ${v.filePath}:${v.lineNumber} -> ${v.message}`);
  }
  console.error("");
  console.error("Fix violations before Claude writes this file.");

  process.exit(2);
}

main();
