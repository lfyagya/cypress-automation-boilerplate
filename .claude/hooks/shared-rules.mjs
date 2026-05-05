/**
 * Shared Cypress rule scanner used by both pre-validate and post-validate hooks.
 * Add new rules here — they apply to both the pre-write block and the post-write warning.
 */

import fs from "node:fs";
import path from "node:path";

const TARGET_FILE_RE = /cypress[\\/].*\.(cy\.js|commands\.js|js)$/i;

export function toPosix(p) {
  return p.replaceAll("\\", "/");
}

export function loadAllowlist(allowlistPath) {
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

export function isAllowedLiteral(value, allowSet, ignoreCase = false) {
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

export function lineNumberForIndex(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

export function scanForRegex(violations, filePath, text, regex, messageBuilder) {
  let match;
  while ((match = regex.exec(text)) !== null) {
    const lineNumber = lineNumberForIndex(text, match.index);
    const message =
      typeof messageBuilder === "function" ? messageBuilder(match) : messageBuilder;
    if (!message) continue;
    violations.push({ filePath, lineNumber, message });
  }
}

export function scanContent(filePath, content, allowlist, repoRoot) {
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
  // Bypass with pragma: // @no-ensureAuthenticated (for modules with their own auth command)
  if (/cypress[\\/]tests[\\/].*\.cy\.js$/i.test(normalized)) {
    const requiresAuth = !/unauth|public|health/i.test(normalized);
    const hasPragma = /\/\/\s*@no-ensureAuthenticated/.test(content);
    if (requiresAuth && !hasPragma && !/cy\.ensureAuthenticated\(/.test(content)) {
      violations.push({
        filePath: normalized,
        lineNumber: 1,
        message:
          "Missing cy.ensureAuthenticated() in auth-required test file. Add it in beforeEach(), or add // @no-ensureAuthenticated if the module uses its own auth command.",
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
