#!/usr/bin/env node
/**
 * Dual-mode Cypress rule validator.
 *
 * Claude Code hook mode (default — reads stdin):
 *   Receives a PostToolUse JSON event and checks the file just written/edited.
 *
 * CI mode (--base-ref <ref>):
 *   Diffs HEAD against origin/<ref>, reads every changed Cypress file from disk,
 *   and exits non-zero when violations are found.
 *
 *   Usage: node validate-cypress-rules.mjs --base-ref main
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { toPosix, loadAllowlist, scanContent } from "./shared-rules.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const allowlistPath = path.resolve(__dirname, "cypress-hook-allowlist.json");

// ── Detect mode ──────────────────────────────────────────────────────────────

const baseRefIndex = process.argv.indexOf("--base-ref");
const ciMode = baseRefIndex !== -1;

if (ciMode) {
  // ── CI mode ──────────────────────────────────────────────────────────────
  const baseRef = process.argv[baseRefIndex + 1];
  if (!baseRef) {
    console.error("Usage: node validate-cypress-rules.mjs --base-ref <ref>");
    process.exit(1);
  }

  let changedFiles;
  try {
    const diffOutput = execSync(
      `git diff --name-only --diff-filter=ACM origin/${baseRef}...HEAD`,
      { cwd: repoRoot, encoding: "utf8" },
    );
    changedFiles = diffOutput.split(/\r?\n/).filter(Boolean);
  } catch (err) {
    console.error(`[CI] git diff failed: ${err.message}`);
    process.exit(1);
  }

  if (changedFiles.length === 0) {
    console.log("[CI] No changed files — nothing to check.");
    process.exit(0);
  }

  const allowlist = loadAllowlist(allowlistPath);
  const allViolations = [];

  for (const relFile of changedFiles) {
    const absPath = path.resolve(repoRoot, relFile);
    let content;
    try {
      content = fs.readFileSync(absPath, "utf8");
    } catch {
      continue; // file deleted between diff and read — skip
    }
    const violations = scanContent(absPath, content, allowlist, repoRoot);
    allViolations.push(...violations);
  }

  if (allViolations.length === 0) {
    console.log("[CI] All Cypress rule checks passed.");
    process.exit(0);
  }

  console.error("");
  console.error("❌ [CI] Cypress rule violations detected:");
  for (const v of allViolations) {
    console.error(`  ${toPosix(v.filePath)}:${v.lineNumber} -> ${v.message}`);
  }
  console.error("");
  process.exit(1);
} else {
  // ── Claude Code hook mode (stdin) ─────────────────────────────────────────
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

  const allowlist = loadAllowlist(allowlistPath);
  const violations = scanContent(filePath, content, allowlist, repoRoot);

  if (violations.length === 0) process.exit(0);

  console.error("");
  console.error("❌ [POST-CHECK] Cypress rule violations detected in written file.");
  for (const v of violations) {
    console.error(`  ${toPosix(v.filePath)}:${v.lineNumber} -> ${v.message}`);
  }
  console.error("");
  console.error("Correct these violations before committing.");

  process.exit(2);
}
