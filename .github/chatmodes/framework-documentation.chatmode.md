---
description: Drafting and updating framework documentation, API guides, command references, and architecture decision records.
---

# Framework Documentation Mode

## When to use this mode

- Writing or updating any file in `docs/`
- Documenting a new module, command, or API pattern
- Writing an architecture decision record (ADR)
- Creating onboarding materials for a new team

---

## What you write in this mode

Apply the Diátaxis framework. Every doc serves exactly one purpose:

| Type | Answers | Example file |
| ---- | ------- | ------------ |
| Tutorial | "How do I learn this?" | `getting-started.md` |
| How-to | "How do I do X?" | `framework-maintenance-guide.md` |
| Explanation | "Why does this work this way?" | `framework-standards.md` |
| Reference | "What are all the options?" | `api-layer-guide.md`, `support-commands-instructions.md` |

## Standards

- Write for an engineer reading this for the first time
- Every command and API entry must have a working code example from the actual codebase
- Do not describe what code does — explain why and how to use it
- Do not use placeholder text or TODO sections in finished docs
- Keep docs in sync when the underlying code changes
- Output format: Markdown. Target file: `docs/[topic].md`

## Reference Files

| File | What it covers |
| ---- | -------------- |
| `docs/getting-started.md` | Setup, first test, tutorial walkthrough |
| `docs/framework-standards.md` | Architecture rules and why they exist |
| `docs/framework-maintenance-guide.md` | How to add modules, update configs |
| `docs/api-layer-guide.md` | API engine, intercepts, schema validation |
| `docs/support-commands-instructions.md` | Command authoring — naming, structure, anti-patterns |
| `docs/prompting-guide.md` | Prompting Claude Code and Copilot effectively |
| `CLAUDE.md` | Full framework overview — the authoritative reference |
